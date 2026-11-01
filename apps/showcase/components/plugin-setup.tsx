"use client";
import { useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { SegmentedControl } from "../../../packages/highway-react/src/invariant/components/segmented-control";
import { CodeExample } from "./code-example";
const clients = [{id:"codex",label:"Codex"},{id:"claude",label:"Claude Code"},{id:"chatgpt",label:"ChatGPT"}];
export function PluginSetup() {
  const [client,setClient] = useState("codex");
  return <div className="highway-plugin-setup">
    <SegmentedControl className="highway-home-agent-tabs" label="Choose your agent" tabs={clients} activeTab={client} onTabChange={setClient}/>
    {client === "chatgpt" ? <div className="highway-plugin-unavailable"><h2>ChatGPT web is coming later</h2><p>Our current plugin runs MCP locally. A web connection needs a hosted server and directory publication. You can use the local Codex plugin today.</p><Button variant="secondary" onClick={()=>setClient("codex")}>Set up Codex</Button></div> : <ol className="highway-home-steps">
      <li><div><h2>Download the Highway plugin</h2><p>Unzip the folder on your machine. It includes the skill and read-only MCP server. Requires Node 22.13+ on your PATH and a current {client === "codex" ? "Codex" : "Claude Code"} client with plugin support.</p><Button asChild variant="secondary" className="highway-plugin-download"><a href={`/downloads/highway-${client}-plugin.zip`} download><ArrowDownToLine aria-hidden="true"/>Download for {client === "codex" ? "Codex" : "Claude Code"}</a></Button></div></li>
      <li><div><h2>Add it to your agent</h2><p>Replace the path below with the unzipped folder. Keep that folder available for plugin updates.</p><CodeExample label="Install local plugin" language="sh" code={client === "codex" ? 'codex plugin marketplace add "/absolute/path/to/unzipped-folder"\ncodex plugin add highway@highway-local' : 'claude plugin marketplace add "/absolute/path/to/unzipped-folder"\nclaude plugin install highway@highway-local'}/></div></li>
      <li><div><h2>Open your project and start building</h2><p>Enable the plugin and MCP when your client asks. Start a new session if needed, then describe your app.</p><CodeExample label="Paste into your agent" language="text" code="Use the Highway plugin to help me build or improve this app. First inspect my project and use Highway MCP to check the exact component APIs and package version. Preserve my existing behavior and brand. If UI packages are missing, call get_installation and install its exact public release URLs in my project."/><p>The plugin connects your agent, which can install matching UI packages from our public releases. Disable any separate Highway skill or MCP connection before using the plugin to avoid duplicates.</p></div></li>
    </ol>}
  </div>;
}
