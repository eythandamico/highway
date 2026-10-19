"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
export function CodeExample({ code, label = "Usage" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false), [error, setError] = useState("");
  return <div className="library-code"><div className="library-code-heading"><span>{label}</span><Button variant="ghost" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setError(""); } catch { setError("Select the code below to copy it."); } }}>{copied ? <Check/> : <Copy/>}{copied ? "Copied" : "Copy"}</Button></div><pre tabIndex={0}><code>{code}</code></pre>{error && <p role="status">{error}</p>}</div>;
}
