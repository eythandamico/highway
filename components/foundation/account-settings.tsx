"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import type { User } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function AccountSettings({user}:{user:User}) {const {setTheme}=useTheme();const [name,setName]=useState(user.name),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await authClient.updateUser({name:name.trim()});setMessage(r.error?r.error.message||"Could not save.":"Saved.");}catch{setMessage("Could not save. Please try again.");}finally{setBusy(false);}}
 return <div className="page reading"><h1>Settings</h1><form className="stack settings-section" onSubmit={save}><h2>Account</h2><p className="muted">{user.email}</p><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={e=>setName(e.target.value)} maxLength={100} required/><Button disabled={busy} type="submit">{busy?"Saving…":"Save changes"}</Button>{message&&<p role="status">{message}</p>}</form><section className="settings-section"><h2>Appearance</h2><p className="muted">Choose a theme for this device.</p><div className="theme-options">{["light","dark","system"].map(t=><Button variant="secondary" key={t} onClick={()=>setTheme(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</Button>)}</div></section></div>;
}
