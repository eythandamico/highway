import { env } from "cloudflare:workers";
import { requireUser } from "@/lib/session";
import { workspaceAccess } from "@/lib/workspace";
import { listRecords } from "@/lib/records";
import { handle, json, body, sameOrigin, textField, HttpError, limit } from "@/lib/http";
export function GET(request:Request) {return handle(async()=>{
 const user=await requireUser(),params=new URL(request.url).searchParams;
 const workspace=await workspaceAccess(user.id,params.get("workspace")||"");
 const page=Number(params.get("page")||1);if(!Number.isSafeInteger(page)||page<1||page>1000)throw new HttpError(400,"Invalid page.");
 return json(await listRecords(workspace.id,(params.get("q")||"").slice(0,120),params.get("status")==="archived"?"archived":"active",page));
});}
export function POST(request:Request) {return handle(async()=>{
 sameOrigin(request);const user=await requireUser();await limit(`records:${user.id}`,120,60);const data=await body(request);
 const workspace=await workspaceAccess(user.id,textField(data.workspace,200),true),id=crypto.randomUUID(),now=Date.now();
 const title=textField(data.title,160),description=textField(data.body??"",4000,false);
 await env.DB.prepare("INSERT INTO records(id,workspace_id,title,body,created_at,updated_at) VALUES(?,?,?,?,?,?)").bind(id,workspace.id,title,description,now,now).run();
 return json({id},201);
});}
export function PATCH(request:Request) {return handle(async()=>{
 sameOrigin(request);const user=await requireUser();await limit(`records:${user.id}`,120,60);const data=await body(request);
 const workspace=await workspaceAccess(user.id,textField(data.workspace,200),true),id=textField(data.id,100);
 if(!Number.isSafeInteger(data.revision)||Number(data.revision)<1)throw new HttpError(400,"Invalid revision.");
 if(data.status!=="active"&&data.status!=="archived")throw new HttpError(400,"Invalid status.");
 const row=await env.DB.prepare("UPDATE records SET status=?,revision=revision+1,updated_at=? WHERE id=? AND workspace_id=? AND revision=? RETURNING id").bind(data.status,Date.now(),id,workspace.id,data.revision).first();
 if(!row)throw new HttpError(409,"This record changed or is unavailable. Refresh before trying again.");
 return json({ok:true});
});}
