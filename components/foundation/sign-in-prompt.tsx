"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "./providers";
export function SignInPrompt(){const {openSignIn}=useSession();return <section className="reading page"><h1>Your workspace</h1><p className="muted">Sign in to view your records and files.</p><div className="theme-options"><Button asChild><Link href="/demo">Explore the demo</Link></Button><Button variant="secondary" onClick={openSignIn}>Sign in</Button></div></section>;}
