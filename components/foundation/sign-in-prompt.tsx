"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "./providers";
export function SignInPrompt(){const {openSignIn}=useSession();return <section className="reading page"><h1>Your workspace</h1><p className="muted">Sign in to view your records and files.</p><Button onClick={openSignIn}>Sign in</Button></section>;}
