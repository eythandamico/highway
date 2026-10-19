import { env } from "cloudflare:workers";
import { HttpError } from "./http";
export type Workspace={id:string;name:string;role:"owner"|"admin"|"member"|"viewer"};
export async function personalWorkspace(userId:string) {
  const id=`personal:${userId}`;
  await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO workspaces(id,name,created_at) VALUES(?,?,?)").bind(id,"My workspace",Date.now()),
    env.DB.prepare("INSERT OR IGNORE INTO memberships(workspace_id,user_id,role) VALUES(?,?,'owner')").bind(id,userId),
  ]);
  return workspaceAccess(userId,id);
}
export async function workspaceAccess(userId:string,id:string,write=false):Promise<Workspace> {
  const found=await env.DB.prepare("SELECT w.id,w.name,m.role FROM workspaces w JOIN memberships m ON m.workspace_id=w.id WHERE w.id=? AND m.user_id=?").bind(id,userId).first<Workspace>();
  if(!found)throw new HttpError(404,"Workspace not found.");
  if(write && found.role==="viewer")throw new HttpError(403,"You have read-only access.");
  return found;
}
