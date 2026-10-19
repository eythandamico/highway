"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({reset}:{error:Error;reset:()=>void}) {return <section className="page reading"><h1>Something went wrong</h1><p className="muted">Your saved work is still there. Try loading this screen again.</p><Button onClick={reset}>Try again</Button></section>;}
