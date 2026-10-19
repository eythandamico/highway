import { env } from "cloudflare:workers";
import { requireUser } from "@/lib/session";
import { workspaceAccess } from "@/lib/workspace";
import { handle, json, sameOrigin, HttpError, limitedBody, limit } from "@/lib/http";
export function GET(request:Request) {return handle(async()=>{
 const user=await requireUser(),p=new URL(request.url).searchParams,w=await workspaceAccess(user.id,p.get("workspace")||"");
 const files=await env.DB.prepare("SELECT id,name,bytes,created_at FROM files WHERE workspace_id=? ORDER BY created_at DESC LIMIT 100").bind(w.id).all();return json({files:files.results});
});}
export function POST(request:Request) {return handle(async()=>{
 sameOrigin(request);const user=await requireUser();await limit(`files:${user.id}`,20,3600);
 const p=new URL(request.url).searchParams,w=await workspaceAccess(user.id,p.get("workspace")||"",true);
 const name=(p.get("name")||"attachment").replace(/[\r\n\x00-\x1f/\\]/g,"_").slice(0,120);
 const bytes=await limitedBody(request,5*1024*1024);if(!bytes.length)throw new HttpError(400,"Choose a non-empty file.");
 const id=crypto.randomUUID(),key=`private/${w.id}/${id}`;
 // Downloads are always attachments; untrusted SVG/HTML is never rendered inline.
 await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:"application/octet-stream"}});
 try {await env.DB.prepare("INSERT INTO files(id,workspace_id,owner_id,name,object_key,mime,bytes,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(id,w.id,user.id,name,key,"application/octet-stream",bytes.length,Date.now()).run();}
 catch(e){await env.BUCKET.delete(key);throw e;}
 return json({id},201);
});}
