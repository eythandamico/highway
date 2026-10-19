"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/client";
import type { Workspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
type FileRow={id:string;name:string;bytes:number};
export function WorkspaceFiles({workspace,requestApi=api,fileHref}:{workspace:Workspace;requestApi?:typeof api;fileHref?:(id:string)=>string}) {
 const [files,setFiles]=useState<FileRow[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(true);
 const url=`files?workspace=${encodeURIComponent(workspace.id)}`;
 useEffect(()=>{const controller=new AbortController();requestApi<{files:FileRow[]}>(url,{signal:controller.signal}).then(data=>setFiles(data.files)).catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});return()=>controller.abort();},[url,requestApi]);
 async function upload(file:File|undefined){if(!file)return;if(file.size>5*1024*1024){setError("Choose a file under 5 MB.");return;}setBusy(true);setError("");try{await requestApi(`${url}&name=${encodeURIComponent(file.name)}`,{method:"POST",body:file,headers:{"Content-Type":"application/octet-stream"}});setFiles((await requestApi<{files:FileRow[]}>(url)).files);}catch(e){setError(e instanceof Error?e.message:"Upload failed.");}finally{setBusy(false);}}
 async function remove(id:string){setBusy(true);try{await requestApi(`files/${id}`,{method:"DELETE"});setFiles(items=>items.filter(f=>f.id!==id));}catch(e){setError(e instanceof Error?e.message:"Delete failed.");}finally{setBusy(false);}}
 return <div className="stack">{workspace.role!=="viewer"&&<div><Label htmlFor="file">{fileHref ? "Try a file locally (up to 5 MB; never uploaded)" : "Upload a private file (up to 5 MB)"}</Label><Input id="file" type="file" disabled={busy} onChange={e=>{void upload(e.target.files?.[0]);e.target.value="";}}/></div>}{error&&<p role="alert" className="error-message">{error}</p>}<div aria-busy={busy}>{files.map(file=><div className="record-row" key={file.id}><a href={fileHref ? fileHref(file.id) : `/api/files/${file.id}`} download={fileHref ? file.name : undefined}>{file.name} <span className="muted">({Math.ceil(file.bytes/1024)} KB)</span></a>{workspace.role!=="viewer"&&<Button variant="ghost" disabled={busy} onClick={()=>remove(file.id)}>Delete</Button>}</div>)}{!files.length&&<p role="status" className="muted">{busy?"Loading files…":"No files uploaded yet."}</p>}</div></div>;
}
