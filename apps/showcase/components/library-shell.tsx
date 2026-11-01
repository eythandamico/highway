"use client";
import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { SegmentedControl } from "../../../packages/highway-react/src/invariant/components/segmented-control";
import Icon from "../../../packages/highway-react/src/invariant/lib/icon";
import "./library.css";
const themeOptions = [{ id: "Light theme", icon: "sun" }, { id: "Dark theme", icon: "moon" }];
export function LibraryShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const path = usePathname();
  const shell = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const node = header.current;
    if (!node) return;
    const measure = () => shell.current?.style.setProperty("--library-header-height", `${node.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={shell} className="library"><header ref={header} className="library-header">
    <Link className="library-wordmark" href="/">Highway</Link>
    <nav aria-label="Main navigation"><Link href="/showcase" aria-current={path.startsWith("/showcase") || path.startsWith("/components") ? "page" : undefined}>Components</Link><Link href="/examples" aria-current={path.startsWith("/examples") ? "page" : undefined}>Examples</Link><Link href="/guide" aria-current={path === "/guide" ? "page" : undefined}>Docs</Link><Link href="/guide#quickstart">Connect your agent <ArrowUpRight size={14} aria-hidden="true"/></Link></nav>
    <div className="library-actions">
      <SegmentedControl className="library-theme-switch" variant="subdued" label="Color theme" tabs={themeOptions}
        activeTab={resolvedTheme === "dark" ? "Dark theme" : "Light theme"}
        onTabChange={(theme: string) => setTheme(theme === "Dark theme" ? "dark" : "light")}/>
      <Button asChild variant="ghost" style={{ borderRadius: 999, background: "var(--surface-muted)" }} static>
        <a href="https://github.com/eythandamico/highway" target="_blank" rel="noopener noreferrer" aria-label="Highway on GitHub (opens in a new tab)"><Icon name="github" size={20} style={undefined} color={undefined}/>GitHub</a>
      </Button>
    </div>
  </header>{children}<footer className="library-footer"><span>Highway component library</span><Link href="https://github.com/eythandamico/highway">GitHub ↗</Link></footer></div>;
}
