import { PluginSetup } from "../../components/plugin-setup";
import "../../components/home.css";
import { OnboardingSetup } from "../../components/onboarding-setup";
import { OnThisPage } from "../../components/on-this-page";
import Link from "next/link";
import { LibraryShell } from "../../components/library-shell";
import { CodeExample } from "../../components/code-example";
import uiPackage from "../../../../packages/highway-react/package.json";
export const metadata = { title: "Documentation" };
const sections = [["quickstart","Quick start"],["packages","Install"],["build","Use components"],["theme","Theme"],["typography","Typography"],["effects","Effects"],["skill","Agent skill"],["agents","MCP"],["local","Run locally"]];
export default function Guide() {
 return <LibraryShell><div className="library-layout library-layout-toc"><aside className="library-sidebar"><p className="library-eyebrow">DOCUMENTATION</p><nav aria-label="Guide chapters">{sections.map(([id,name])=><a href={`#${id}`} key={id}>{name}</a>)}</nav></aside><article className="library-content">
  <h1 id="start">Use Highway in your project.</h1><p className="library-intro">Install the components, apply your theme, and connect your existing handlers.</p>
  <section id="quickstart" className="library-guide-section"><h2>Connect your agent</h2><p>Install the Highway plugin to get the skill and version-matched component MCP together. These are local plugins; no account or hosted service is required.</p><PluginSetup/></section>
  <details className="library-other-setup"><summary>Other setup options</summary><section className="library-guide-section"><h2>Local project setup</h2><OnboardingSetup/></section>
  <section id="packages" className="library-guide-section"><h2>Install</h2><p>React components require React 19.2+. The styles package can be used on its own. Install matching packages directly from the public GitHub release. No repository checkout or GitHub login is required.</p><CodeExample label="Install in your project" language="sh" code={`npm install --ignore-scripts --save-exact https://github.com/eythandamico/highway/releases/download/highway-v${uiPackage.version}/highway-styles-${uiPackage.version}.tgz https://github.com/eythandamico/highway/releases/download/highway-v${uiPackage.version}/highway-react-${uiPackage.version}.tgz`}/><CodeExample label="Load styles and scope the theme" language="tsx" code={`import '@highway/styles/styles.css';
import { HighwayTheme, Button, GlassCard } from '@highway/react';

export function SavePanel({ onSave }: { onSave: () => void }) {
  return (
    <HighwayTheme>
      <GlassCard>
        <Button onClick={onSave}>Save</Button>
      </GlassCard>
    </HighwayTheme>
  );
}`}/><p>Keep your routes, authentication, data, and hosting. Start with one screen and check its behavior before expanding.</p></section>
  </details>
  <section id="build" className="library-guide-section"><h2>Use components</h2><p>Choose a component in the <Link href="/showcase">showcase</Link>. Its page includes the public import, props, and a working example. Import it directly; don’t recreate its markup.</p><div className="library-api-scroll"><table className="library-mapping"><thead><tr><th>Task</th><th>Component</th></tr></thead><tbody><tr><td>Submit a form</td><td><code>Button</code>, <code>Input</code>, <code>FormDialog</code></td></tr><tr><td>Show a glass surface</td><td><code>GlassCard</code></td></tr><tr><td>Compose a message</td><td><Link href="/showcase?component=ask-bar">AskBar</Link></td></tr><tr><td>Record audio</td><td><Link href="/showcase?component=voice-recorder">VoiceRecorder</Link></td></tr></tbody></table></div><p>Connect your app’s callbacks. Async save and apply handlers should reject on failure and resolve only after success.</p><details id="invariant"><summary>Which card or dialog should I use?</summary><p><code>GlassCard</code> uses Highway’s glass material; <code>Card</code> is the opaque card. <code>FoundationDialog</code> supports composed content; <code>Dialog</code> has a separate API. Use the props shown on each component’s page.</p></details></section>
  <section id="theme" className="library-guide-section"><h2>Theme</h2><p>Set your loaded font and brand colors through <code>HighwayTheme</code>. Theme values also reach portaled menus and dialogs.</p><CodeExample label="Set a font and mode" language="tsx" code={`<HighwayTheme
  mode="dark"
  brand={{ fontFamily: 'Brand Sans, sans-serif' }}
>
  <App />
</HighwayTheme>`}/><p>Keep component geometry and interaction styles intact. See the <a href="https://github.com/eythandamico/highway/blob/main/docs/PACKAGES.md">theme API</a> for supported color options.</p></section>
  <section id="typography" className="library-guide-section"><h2>Typography</h2><p>Use 14/20 for standard UI and 13/20 for dense tables. These pixel equivalents are implemented in rem units.</p><div className="library-api-scroll"><table className="library-mapping"><thead><tr><th>Role</th><th>Size / line height</th><th>Weight</th><th>Use</th></tr></thead><tbody>{[["display","30 / 36","600","Primary metrics"],["heading-xl","24 / 32","600","Page titles"],["heading-lg","18 / 28","600","Sections"],["heading-md","16 / 24","600","Card titles"],["body","14 / 20","400","UI and navigation"],["body-sm","13 / 20","400","Tables and filters"],["caption","12 / 16","400–500","Metadata"],["micro","11 / 16","500","Dense secondary labels"]].map(([role,size,weight,use])=><tr key={role}><td><code>{role}</code></td><td>{size}</td><td>{weight}</td><td>{use}</td></tr>)}</tbody></table></div><CodeExample label="Style application content" language="tsx" code={`<h1 className="highway-type-heading-xl">Overview</h1>
<p className="highway-type-body">Your projects</p>
<span data-highway-type="caption">Updated today</span>`}/><p>For analytics, use tabular numbers, weights 400–600, and muted 14px secondary labels. Dense table rows should grow with their content. Reserve 30px for primary metrics and 24px for secondary metrics.</p></section>
  <section id="effects" className="library-guide-section"><h2>Effects</h2><p>Use <Link href="/showcase?component=progressive-blur">progressive blur</Link> to soften content behind an edge, <Link href="/showcase?component=edge-fade">EdgeFade</Link> for a color fade, and <Link href="/showcase?component=media-scrim">MediaScrim</Link> for readable text over media.</p><CodeExample label="Layer a progressive blur" language="tsx" code={`import { GradientSurface, ProgressiveBlur } from '@highway/react';

<GradientSurface variant="stage" className="preview">
  <ProgressiveBlur recipe="panel" edge="bottom" />
  <div className="foreground">Your content</div>
</GradientSurface>`}/><CodeExample label="Keep content above the effect" language="css" code={`.preview {
  position: relative;
  isolation: isolate;
  padding: var(--space-8);
}
.foreground { position: relative; z-index: 1; }`}/><p>Keep interactive controls above decorative layers. See the <Link href="/components/effects">effects examples</Link> for placement and accessibility behavior.</p></section>
  <details className="library-other-setup"><summary>Other setup options: standalone skill and MCP</summary>
  <section id="skill" className="library-guide-section"><h2>Install the Highway skill</h2><p>The skill teaches your agent how to choose, compose, and refine Highway components. MCP supplies the exact imports and APIs. Use both for the best results.</p><p>Start from a Highway checkout containing <code>skills/highway/SKILL.md</code>. Run these commands from the repository root. They copy the complete skill, including its references, into your personal skills directory.</p>
  <CodeExample label="Install for Codex · macOS / Linux" language="sh" code={`mkdir -p "$HOME/.agents/skills"
cp -R -i skills/highway "$HOME/.agents/skills/"`}/>
  <details><summary>Claude Code or a project-only installation</summary><CodeExample label="Install for Claude Code · macOS / Linux" language="sh" code={`mkdir -p "$HOME/.claude/skills"
cp -R -i skills/highway "$HOME/.claude/skills/"`}/><p>For a project-only installation, copy the complete <code>skills/highway</code> folder into your application’s <code>.agents/skills/</code> for Codex or <code>.claude/skills/</code> for Claude Code. On Windows, copy the folder into the equivalent directory under your user profile or project.</p></details>
  <p>The copy command asks before replacing existing files. Restart your agent if the skill does not appear. In Codex, invoke <code>$highway</code>; in Claude Code, use <code>/highway</code>. The skill does not install the UI packages or configure MCP.</p><p>These steps are for local coding-agent sessions. See <a href="https://learn.chatgpt.com/docs/build-skills">Codex skill discovery</a>, <a href="https://code.claude.com/docs/en/skills">Claude Code skills</a>, and the <a href="https://github.com/eythandamico/highway/tree/main/skills/highway">Highway skill source</a>.</p></section>
  <section id="agents" className="library-guide-section"><h2>Connect Highway MCP</h2><p>Use Node 22.13 or newer. From the same Highway repository root, build the read-only server and its component snapshot:</p><CodeExample label="Build MCP" language="sh" code={`npm ci
npm ci --prefix packages/highway-mcp --ignore-scripts
npm run build:mcp`}/>
  <CodeExample label="Connect with the Codex CLI" language="sh" code={`codex mcp add highway -- "$(command -v node)" "$PWD/packages/highway-mcp/src/server.mjs"
codex mcp list`}/>
  <p>Keep the checkout at this location: your client launches the server from that path. The server uses local standard input/output, not an HTTP URL. No API key or login is required.</p>
  <details><summary>Configure another MCP client</summary><p>For clients accepting <code>mcpServers</code> JSON, merge this entry into their MCP settings. Replace both paths with absolute paths on your machine; find Node with <code>command -v node</code>. Other clients may use a different configuration format.</p><CodeExample label="MCP server configuration" language="json" code={JSON.stringify({mcpServers:{highway:{command:"/absolute/path/to/node",args:["/absolute/path/to/highway/packages/highway-mcp/src/server.mjs"]}}},null,2)}/></details>
  <h3>Use the skill and MCP together</h3><CodeExample label="Paste into Codex · replace the screen description" language="text" code={`$highway Build a settings screen using Highway.
Use Highway MCP to discover suitable components and read their exact APIs.
Check that the MCP snapshot matches my installed package version.
Preserve my existing handlers, validation, routes, and brand.
Use the real components and verify the changed interactions.`}/>
  <p>For Claude Code, replace <code>$highway</code> with <code>/highway</code>. Describe your actual screen and behavior. For a review without edits, add “Review only; report proposed changes.”</p>
  <CodeExample label="Check the connection in your agent" language="text" code={`Use Highway MCP to call get_component with name AskBar.
Report its public import, onSend signature, and snapshot package version.`}/>
  <p>A successful setup exposes Highway tools such as <code>search_components</code>, <code>get_component</code>, and <code>get_guidance</code>. If tools are missing, check the configured paths and restart the client. If the snapshot is stale, rebuild with <code>npm run build:mcp</code> and restart MCP. Recopy the skill after updating its source. Match APIs to the packages installed in your app.</p><p>See the <a href="https://github.com/eythandamico/highway/blob/main/packages/highway-mcp/README.md">MCP setup guide</a> for archive distribution and the <a href="https://learn.chatgpt.com/docs/extend/mcp?surface=cli">Codex MCP documentation</a> for client settings. These tools provide documentation; they do not install packages or modify your application.</p></section>
  </details>
  <section id="local" className="library-guide-section"><h2>Run locally</h2><p>Use Node 22.13 or newer.</p><CodeExample label="Showcase · localhost:5190" language="sh" code={`npm ci
npm run dev`}/><CodeExample label="Demo · localhost:5191/demo" language="sh" code="npm run dev:demo"/><p id="demo">The demo uses sample data and resets on reload. It does not send messages, process payments, or connect to an AI service.</p><details id="deploy"><summary>Optional backend starter</summary><p>The UI packages require no backend. To run the separate starter, follow <a href="https://github.com/eythandamico/highway/blob/main/docs/OPERATIONS.md">Operations</a> for environment setup and deployment.</p></details></section>
 </article><OnThisPage sections={sections.map(([id,label])=>({id,label}))}/></div></LibraryShell>;
}
