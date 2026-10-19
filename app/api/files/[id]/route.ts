import { env } from "cloudflare:workers";
import { requireUser } from "@/lib/session";
import { workspaceAccess } from "@/lib/workspace";
import { handle, HttpError, json, sameOrigin } from "@/lib/http";
type Context={params:Promise<{id:string}>};
async function find(id:string,write=false) {const user=await requireUser();const file=await env.DB.prepare("SELECT * FROM files WHERE id=?").bind(id).first<{id:string;workspace_id:string;object_key:string;name:string}>();if(!file)throw new HttpError(404,"File not found.");await workspaceAccess(user.id,file.workspace_id,write);return file;}
export function GET(_request:Request,context:Context) {return handle(async()=>{const file=await find((await context.params).id);const object=await env.BUCKET.get(file.object_key);if(!object)throw new HttpError(404,"File not found.");return new Response(object.body,{headers:{"Content-Type":"application/octet-stream","Content-Disposition":`attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});});}
export function DELETE(request:Request,context:Context) {return handle(async()=>{sameOrigin(request);const file=await find((await context.params).id,true);await env.BUCKET.delete(file.object_key);await env.DB.prepare("DELETE FROM files WHERE id=? AND workspace_id=?").bind(file.id,file.workspace_id).run();return json({ok:true});});}
