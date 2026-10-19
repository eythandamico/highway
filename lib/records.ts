import { env } from "cloudflare:workers";
export type RecordItem={id:string;title:string;body:string;status:"active"|"archived";revision:number;created_at:number;updated_at:number};
export async function listRecords(workspace:string, query="", status="active", page=1) {
  const search=`%${query.replace(/[\\%_]/g,"\\$&")}%`;
  const sql="FROM records WHERE workspace_id=? AND status=? AND title LIKE ? ESCAPE '\\'";
  const count=await env.DB.prepare(`SELECT COUNT(*) AS total ${sql}`).bind(workspace,status,search).first<{total:number}>();
  const rows=await env.DB.prepare(`SELECT id,title,body,status,revision,created_at,updated_at ${sql} ORDER BY updated_at DESC,id DESC LIMIT 20 OFFSET ?`).bind(workspace,status,search,(page-1)*20).all<RecordItem>();
  return {records:rows.results,total:count?.total||0,page};
}
