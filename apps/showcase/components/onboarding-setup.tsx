"use client";
import { useState } from "react";
import { Tabs } from "../../../packages/highway-react/src/components/tabs";
import { CodeExample } from "./code-example";

const projects = [{ id: "new", label: "New project" }, { id: "existing", label: "Existing project" }];
const agents = [{ id: "codex", label: "Codex" }, { id: "claude", label: "Claude Code" }, { id: "cursor", label: "Cursor" }];
export function OnboardingSetup() {
  const [project, setProject] = useState("new");
  const [agent, setAgent] = useState("codex");
  const command = `npm run onboard -- --target "/absolute/path/to/${project === "new" ? "my-new-app" : "your-app"}"${project === "new" ? " --new" : ""} --agent ${agent}`;
  const invocation = agent === "codex" ? "$highway" : "/highway";
  return <div className="highway-onboarding">
    <p>Install the components, the Highway skill, and a local MCP connection together. Choose your project and coding agent.</p>
    <Tabs className="highway-onboarding-tabs" tabs={projects} activeTab={project} onTabChange={setProject}/>
    <Tabs className="highway-onboarding-tabs" tabs={agents} activeTab={agent} onTabChange={setAgent}/>
    <p>{project === "new" ? "Creates a React/Vite app with Highway already wired in. Choose a directory that does not exist." : "Adds Highway to a standalone npm project using matching React and React DOM 19.2+. Existing routes, handlers, and source files stay intact. Install your app’s existing dependencies first."}</p>
    <h3>1. Prepare Highway</h3>
    <p>This early-access flow runs from a <a href="https://github.com/eythandamico/highway">Highway checkout</a> with Node 22.13+. Run <code>npm ci</code> there once. Package building and agent setup are handled by the command below.</p>
    <h3>2. Preview, then install</h3>
    <p>Replace the target path with your app’s location. The preview lists the changes without modifying your app.</p>
    <CodeExample label="Preview setup · run in the Highway checkout" language="sh" code={command}/>
    <CodeExample label="Install and connect" language="sh" code={`${command} --apply`}/>
    <h3>3. Open your project and build</h3>
    <p>Open the target project in {agents.find(item => item.id === agent)?.label}. Trust the project and enable Highway MCP when your agent asks. Setup writes project-local settings, leaving your global settings alone.</p>
    <CodeExample label="Check the connection · paste into your agent" language="text" code={`${invocation} Use Highway MCP to inspect AskBar. Report its public import, onSend signature, and snapshot package version.`}/>
    <CodeExample label="Your first task · describe what you want to build" language="text" code={`${invocation} ${project === "new" ? "Help me design and build the first useful flow for my app." : "Inspect my app and adopt Highway in one screen. Preserve my existing handlers, validation, routes, and brand."}\nUse Highway MCP to read the exact APIs before editing.\n${project === "new" ? "Ask what the app does and who it is for before choosing the layout." : "Follow src/highway/INTEGRATION.md to wire the theme and stylesheet."}\nRun the app and review the result at desktop and mobile widths.`}/>
    <p>{project === "new" ? "Run npm run dev in the new app to see the starter." : "Your agent connects Highway to the existing screen after setup."} The generated <code>.highway/START-HERE.md</code> includes next steps and troubleshooting.</p>
    <details><summary>Compatibility and manual setup</summary><p>This first-time installer supports standalone npm projects. It stops if Highway is already installed, files would be replaced, or React versions are incompatible. Use the manual instructions below for other package managers, workspaces, upgrades, or an existing Highway installation.</p><p>MCP is copied into the project, so it does not need the Highway checkout afterward. Agent settings contain machine-specific paths; update them if the project or Node moves. Hosted MCP and public package installation are not part of this local setup.</p></details>
  </div>;
}
