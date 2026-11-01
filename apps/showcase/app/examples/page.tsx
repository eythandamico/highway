import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../../../../packages/highway-react/src/components/ui/button";
import { LibraryShell } from "../../components/library-shell";
import { CodeExample } from "../../components/code-example";
import "./examples.css";

export const metadata = { title: "Examples · Highway" };

export default function ExamplesPage() {
  return <LibraryShell><main className="highway-examples">
    <header className="highway-examples-heading">
      <h1>Examples</h1>
      <p>See how Highway comes together in an app. Explore a complete workflow or start with a small React project.</p>
    </header>
    <article className="highway-example" aria-labelledby="yardwork-title">
      <div className="highway-example-description">
        <span className="highway-example-kicker">Reference app</span>
        <h2 id="yardwork-title">Yardwork</h2>
        <p>An office workspace with connected screens and interactive workflows, built with Highway’s shared components.</p>
        <p className="highway-example-note">Uses sample content. Changes reset on reload; no messages or payments are sent.</p>
        <Button asChild variant="secondary"><a href={process.env.NEXT_PUBLIC_HIGHWAY_DEMO_URL || "/demo"}>Explore Yardwork <ArrowUpRight aria-hidden="true"/></a></Button>
      </div>
      <div className="highway-example-code"><CodeExample label="Run from the Highway repository" language="sh" code={"npm ci\nnpm run dev:demo"}/><p>For local development, start the server and open localhost:5191/demo.</p></div>
    </article>
    <article className="highway-example" aria-labelledby="react-title">
      <div className="highway-example-description">
        <span className="highway-example-kicker">React + Vite</span>
        <h2 id="react-title">A starting point for your app</h2>
        <p>A small project that uses the packaged components. Try themes, dark mode, forms, menus, and calendar interactions.</p>
        <Button asChild variant="secondary"><Link href="/guide#quickstart">Set up your project <ArrowUpRight aria-hidden="true"/></Link></Button>
      </div>
      <div className="highway-example-code"><CodeExample label="Run from the Highway repository" language="sh" code={"npm run pack:packages\ncd examples/highway-vite\nnpm install\nnpm run dev"}/><p>Available locally at localhost:5192. This example installs the built Highway packages.</p></div>
    </article>
  </main></LibraryShell>;
}
