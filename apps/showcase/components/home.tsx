"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { Popover, PopoverAnchor, PopoverTrigger, PopoverContent } from "../../../packages/highway-react/src/components/ui/popover";
import { PluginSetup } from "./plugin-setup";
import { OnboardingSetup } from "./onboarding-setup";
import { LibraryShell } from "./library-shell";
import "./home.css";

export function Home() {
  const [open, setOpen] = useState(false);

  return <LibraryShell><main className="highway-home">
    <section className="highway-home-intro" aria-labelledby="home-title">
      <p className="highway-home-eyebrow">Design and engineering, together</p>
      <h1 id="home-title">Build your next app<br/>with Highway.</h1>
      <p className="highway-home-description">Considered components, purposeful motion, and an agent that knows how to put them together. Start fresh or bring the app you already have.</p>
      <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild><div className="highway-home-actions">
        <Button asChild size="lg"><Link href="/guide#quickstart">Get started <ArrowRight aria-hidden="true"/></Link></Button>
        <PopoverTrigger asChild><Button static size="lg" variant="secondary" aria-expanded={open} aria-controls="home-agent-panel">
          <span className="highway-home-agent-marks" aria-hidden="true"><span><i className="highway-home-mark-openai"/></span><span><i className="highway-home-mark-claude"/></span></span>
          Connect your agent <ChevronDown className="highway-home-chevron" data-open={open} aria-hidden="true"/>
        </Button></PopoverTrigger>
      </div></PopoverAnchor>
      <PopoverContent id="home-agent-panel" className="highway-home-connect" side="bottom" align="center" sideOffset={16} collisionPadding={16} aria-label="Connect your agent">
        <PluginSetup/>
        <details className="highway-other-setup"><summary>Other setup options</summary><OnboardingSetup/><p><Link href="/guide#packages">Manual package installation</Link> · <Link href="/guide#agents">Standalone MCP setup</Link></p></details>

      </PopoverContent>
      </Popover>
      <Link className="highway-home-browse" href="/showcase">Explore the components <ArrowRight size={16} aria-hidden="true"/></Link>
    </section>
    <section className="highway-home-principles" aria-label="What Highway gives you">
      <div><span>01</span><h2>Craft in every component</h2><p>Consistent typography, precise spacing, and the interaction details that make an app feel considered.</p></div>
      <div><span>02</span><h2>Guidance for your agent</h2><p>A design skill paired with exact component APIs, so your agent builds with the real system.</p></div>
      <div><span>03</span><h2>Your app stays yours</h2><p>Keep your brand, routes, and business logic. Adopt Highway one useful flow at a time.</p></div>
    </section>
  </main></LibraryShell>;
}
