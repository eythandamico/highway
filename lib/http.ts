import { env } from "cloudflare:workers";
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function json(data: unknown, status = 200) { return Response.json(data, { status, headers: {"Cache-Control":"no-store"} }); }
export function sameOrigin(request: Request) {
  if (request.headers.get("Origin") !== new URL(env.SITE_ORIGIN).origin) throw new HttpError(403, "This request must come from the app.");
}
export async function body(request: Request) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) throw new HttpError(415,"Send JSON.");
  const text = await limitedBody(request, 16_384);
  try { const value: unknown = JSON.parse(new TextDecoder().decode(text)); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(); return value as Record<string, unknown>; }
  catch { throw new HttpError(400,"Invalid JSON."); }
}
export async function limitedBody(request: Request, max: number) {
  if (Number(request.headers.get("Content-Length")) > max) throw new HttpError(413,"This file or request is too large.");
  const reader = request.body?.getReader(); if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const {done,value} = await reader.read(); if(done) break; size += value.byteLength; if(size>max) {await reader.cancel(); throw new HttpError(413,"This file or request is too large.");} chunks.push(value); }
  const bytes = new Uint8Array(size); let offset=0; for(const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.length;} return bytes;
}
export function textField(value: unknown, max: number, required = true) { if(typeof value !== "string" || value.trim().length>max || (required&&!value.trim())) throw new HttpError(400,"Check the text fields and try again."); return value.trim(); }
export async function handle(fn: () => Promise<Response>) { try {return await fn();} catch(e) {if(e instanceof HttpError)return json({error:e.message},e.status); console.error("Request failed", e instanceof Error ? e.name : "unknown"); return json({error:"Something went wrong. Please try again."},500);} }
export async function limit(key: string, max: number, seconds: number) {
  const period = Math.floor(Date.now()/1000/seconds);
  const row = await env.DB.prepare("INSERT INTO request_limits(key,period,count) VALUES(?,?,1) ON CONFLICT(key,period) DO UPDATE SET count=count+1 RETURNING count").bind(key,period).first<{count:number}>();
  if(!row || row.count>max)throw new HttpError(429,"Too many attempts. Please try again later.");
}
