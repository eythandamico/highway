"use client";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Moon, Sun, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./library.css";
export function LibraryShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const path = usePathname();
  return <div className="library"><header className="library-header">
    <Link className="library-wordmark" href="/guide">{appConfig.name}<span> × Invariant</span></Link>
    <nav aria-label="Library navigation"><Link href="/guide" aria-current={path === "/guide" ? "page" : undefined}>How to use</Link><Link href="/showcase" aria-current={path === "/showcase" ? "page" : undefined}>Showcase</Link></nav>
    <div className="library-actions"><Button variant="ghost" size="icon" aria-label="Toggle light and dark theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}><Sun className="dark:hidden"/><Moon className="hidden dark:block"/></Button><Button asChild><Link href="/demo">Open demo <ArrowUpRight/></Link></Button></div>
  </header>{children}<footer className="library-footer"><span>Your foundation. Your infrastructure.</span><Link href="https://github.com/eythandamico/highway">View your private repository ↗</Link></footer></div>;
}
