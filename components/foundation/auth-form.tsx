"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function AuthForm({onSuccess,onNavigate}:{onSuccess:()=>Promise<void>;onNavigate?:()=>void}) {
 const [email,setEmail]=useState(""),[sentTo,setSentTo]=useState(""),[code,setCode]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:React.FormEvent) {e.preventDefault();if(busy)return;setBusy(true);setError("");try {
  const {authClient}=await import("@/lib/auth-client");
  const result=sentTo ? await authClient.signIn.emailOtp({email:sentTo,otp:code}) : await authClient.emailOtp.sendVerificationOtp({email:email.trim().toLowerCase(),type:"sign-in"});
  if(result.error)throw new Error(result.error.message||"Could not sign in. Please try again.");
  if(sentTo)await onSuccess();else setSentTo(email.trim().toLowerCase());
 }catch(e){setError(e instanceof Error?e.message:"Please try again.");}finally{setBusy(false);}}
 return <form onSubmit={submit} className="stack" aria-busy={busy}>
  {!sentTo&&<p className="muted">New here? Verify your email to create your account. Already registered? Use the same email to sign in. No password needed.</p>}
  {sentTo ? <><p className="muted">Enter the six-digit code sent to {sentTo}.</p><Label htmlFor="signin-code">Sign-in code</Label><Input id="signin-code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} required/></> : <><Label htmlFor="signin-email">Email address</Label><Input id="signin-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></>}
  {error&&<p className="error-message" role="alert">{error}</p>}
  <Button type="submit" disabled={busy}>{busy?"Please wait…":sentTo?"Continue to your account":"Email me a code"}</Button>
  {sentTo&&<Button type="button" variant="ghost" disabled={busy} onClick={()=>{setSentTo("");setCode("");setError("");}}>Use another email or resend</Button>}
  <p className="legal">By continuing, you agree to our <Link href="/terms" onClick={onNavigate}>Terms</Link> and <Link href="/privacy" onClick={onNavigate}>Privacy Policy</Link>.</p>
 </form>;
}
