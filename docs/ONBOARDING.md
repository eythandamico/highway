# First-time Highway setup

This local early-access workflow installs version-matched UI packages, the Highway skill, and a project-local MCP server. It does not publish packages, deploy an app, modify global agent settings, or connect an AI service.

Requires Node 22.13+, npm, network access for dependencies, and a Highway source checkout with its root dependencies installed (`npm ci`). Run the commands below from that checkout. The interactive guide at `/guide#quickstart` generates the command for your chosen agent and project type.

## New application

```sh
npm run onboard -- --target /absolute/path/to/new-app --new --agent codex
npm run onboard -- --target /absolute/path/to/new-app --new --agent codex --apply
```

The first command previews without creating the target. The second creates a React/Vite app in a previously nonexistent directory, builds matched Highway artifacts, installs them, wires the theme and stylesheet, installs the skill, and adds MCP. The starter has a form with in-memory state so the first interaction is runnable without a backend. Run `npm run dev` in the generated project.

## Existing application

```sh
npm run onboard -- --target /absolute/path/to/existing-app --agent claude
npm run onboard -- --target /absolute/path/to/existing-app --agent claude --apply
```

Supports standalone npm projects with installed, matching stable React / React DOM ^19.2.0. Use `--agent codex`, `--agent claude`, or `--agent cursor`. No automatic React upgrade. Workspaces and other package managers use the manual package guide.

Existing application source and routes are preserved. Generated `src/highway/INTEGRATION.md` guides the agent through adding the provider/styles to one region and verifying the real handlers. Installing packages alone does not restyle the application.

## What changes

- Matching UI archives are vendored under `vendor/highway`, and package.json/lockfile receive local dependencies.
- `src/highway` contains the provider, stylesheet entry, catalog, and adoption instructions.
- `.highway/mcp` contains an independent copy of the MCP server, snapshot, lockfile and dependencies.
- The skill is copied to `.agents/skills/highway` (Codex), `.claude/skills/highway` (Claude Code), or `.cursor/skills/highway` (Cursor).
- Codex receives `.codex/config.toml`; Claude receives `.mcp.json`; Cursor receives `.cursor/mcp.json`. Existing unrelated configuration is retained; an existing Highway entry is refused.
- `.highway/START-HERE.md` contains the connection check and a first-task prompt.

The installer refuses existing Highway installs and generated-file collisions. It is not an upgrade command. A failed new-app setup removes the directory it created. A failed existing-app setup restores package/config files and removes its generated files; npm's node_modules may require `npm install` to resynchronize. It disables dependency lifecycle scripts; review and run host-required steps separately.

## Connect and verify

Open the target project in the selected local agent. Trust the project and enable the MCP server through the client's normal approval flow; setup does not bypass client approval. Restart the session if needed.

Ask `$highway` in Codex or `/highway` in Claude Code/Cursor:

> Use Highway MCP to inspect AskBar. Report its public import, onSend signature, and snapshot package version.

Then describe a real screen and ask the agent to build or adopt it using the skill and exact MCP APIs. Preserve existing business behavior and inspect the rendered result.

Agent configuration uses absolute paths to the project and Node executable. Update them when moving the project or Node. Do not commit another machine's paths as universal configuration. On another machine install `.highway/mcp` dependencies with `npm ci --omit=dev --ignore-scripts` and configure the correct paths. UI artifacts and the application lockfile can be committed for reproducible app installs.

This local milestone precedes hosted MCP, published package distribution, and a plugin marketplace release. The docs should not advertise those as available yet.

## Maintainer validation

Run `npm run check:onboarding` with Chromium available to Playwright and MCP development dependencies installed. It exercises new and existing isolated applications, real MCP requests, browser interactions, and refusal paths. It does not configure your personal coding agents.
