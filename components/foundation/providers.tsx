"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "sonner";
import type { User } from "@/lib/session";
import { appConfig } from "@/config/app";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AuthForm } from "./auth-form";
import { Brand } from "./brand";
const SessionContext=createContext<{user:User|null;openSignIn:()=>void;signOut:()=>Promise<void>}>({user:null,openSignIn:()=>{},signOut:async()=>{}});
export const useSession=()=>useContext(SessionContext);
export function Providers({children,initialUser}:{children:ReactNode;initialUser:User|null}) {
 const [user,setUser]=useState(initialUser),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);const router=useRouter();
 async function signOut(){if(busy)return;setBusy(true);const notice=toast.loading("Signing out…");try{const {authClient}=await import("@/lib/auth-client");const result=await authClient.signOut();if(result.error)throw new Error(result.error.message);window.location.replace("/");}catch{toast.error("Could not sign out. Please try again.",{id:notice});setBusy(false);}}
 async function signedIn(){const {authClient}=await import("@/lib/auth-client");const result=await authClient.getSession();if(!result.data?.user)throw new Error("Could not load your session. Please try again.");setUser(result.data.user);setOpen(false);router.refresh();}
 return <ThemeProvider attribute="class" defaultTheme="system" storageKey={appConfig.themeStorageKey} enableSystem disableTransitionOnChange><SessionContext.Provider value={{user,openSignIn:()=>setOpen(true),signOut}}>{children}<Dialog open={open} onOpenChange={setOpen}><DialogContent mobileSheet className="auth-dialog"><div className="auth-heading"><Brand symbolOnly/><DialogTitle>Welcome to {appConfig.name}</DialogTitle><DialogDescription>Sign in to continue to your workspace.</DialogDescription></div><AuthForm onSuccess={signedIn} onNavigate={()=>setOpen(false)}/></DialogContent></Dialog><Toaster richColors position="bottom-right"/></SessionContext.Provider></ThemeProvider>;
}
