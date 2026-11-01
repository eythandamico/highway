"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { highlightTree, classHighlighter } from "@lezer/highlight";
import { parser as js } from "@lezer/javascript";
import { parser as css } from "@lezer/css";
import { parser as json } from "@lezer/json";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
function highlighted(code: string, language: string) {
  const parser = language === "css" ? css : language === "json" ? json : /^(tsx?|jsx?|javascript|typescript)$/.test(language) ? js.configure({ dialect: "ts jsx" }) : null;
  if (/^(sh|bash|shell)$/.test(language)) {
    return code.split(/("[^"\n]*"|'[^'\n]*'|#[^\n]*|(?<!\S)--?[\w-]+|\b(?:npm|npx|node|cd)\b)/g).map((part,index)=><span key={index} className={part.startsWith("#")?"tok-comment":/^["']/.test(part)?"tok-string":part.startsWith("-")?"tok-propertyName":/^(npm|npx|node|cd)$/.test(part)?"tok-keyword":undefined}>{part}</span>);
  }
  if (!parser) return code;
  const parts: ReactNode[] = []; let offset = 0;
  highlightTree(parser.parse(code), classHighlighter, (from, to, classes) => {
    if (from > offset) parts.push(code.slice(offset, from));
    parts.push(<span key={from} className={classes}>{code.slice(from, to)}</span>); offset = to;
  });
  parts.push(code.slice(offset)); return parts;
}
export function CodeExample({ code, label = "Usage", language }: { code: string; label?: string; language?: string }) {
  const lang = language ?? (/^(npm |npx |node |cd )/.test(code) ? "sh" : /^(Read |Use Highway|Connect )/.test(code) ? "text" : "tsx");
  const [copied, setCopied] = useState(false), [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <div className="library-code source-code-viewer"><div className="library-code-heading"><span>{label} · {lang}</span><Button static variant="ghost" size="xs" className="hw-copy-page-copy" data-copied={copied || undefined} aria-label={copied ? "Copied" : "Copy code"} onClick={async () => { try { await navigator.clipboard.writeText(code); clearTimeout(timer.current); setCopied(true); setError(""); timer.current = setTimeout(() => setCopied(false), 2000); } catch { setError("Select the code below to copy it."); } }}><span className="hw-copy-page-content" aria-hidden="true"><span className="hw-copy-page-idle"><Copy/><span>Copy</span></span><span className="hw-copy-page-success"><Check/><span>Copied</span></span></span></Button></div><pre tabIndex={0} aria-label={`${label} code`}><code className={`language-${lang}`}>{highlighted(code, lang)}</code></pre><span role="status" className="sr-only">{copied ? "Code copied" : error}</span>{error && <p>{error}</p>}</div>;
}
