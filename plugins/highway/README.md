# Highway agent plugins

Two local plugin packages share the canonical `skills/highway` and the read-only Highway MCP snapshot. Build with `npm run build:plugins` after installing checkout dependencies with `npm ci`. The build installs the locked MCP dependencies with lifecycle scripts disabled.

Outputs:

- `artifacts/highway-plugins/codex` — Codex marketplace and plugin
- `artifacts/highway-plugins/claude` — Claude Code marketplace and plugin
- `artifacts/highway-{codex,claude}-plugin-0.1.0.zip` — zipped marketplaces for direct distribution
- `public/downloads/highway-{codex,claude}-plugin.zip` — generated website downloads

The showcase development/production npm commands build these downloads first. They are generated, not committed. Every archive includes INSTALL.md; unzip and run its commands from the marketplace directory. Node 22.13+ must be available on PATH. MCP and runtime dependencies are bundled; the consumer does not need to install server dependencies or keep the Highway source checkout.

## Scope

Plugins install agent guidance and MCP, not application UI dependencies. The installer in `scripts/highway/onboard.mjs` remains available for project-local setup. Manual packages and standalone skill/MCP setup remain documented under Other setup options. Avoid enabling both standalone and plugin copies of Highway in the same agent session.

No global client settings are changed by building. User installation uses the client's own marketplace commands and trust flow. Claude's plugin manifest uses `CLAUDE_PLUGIN_ROOT`; Codex's uses a plugin-relative working directory and server path, so cached installations do not depend on build-machine paths.

The source descriptor's version governs plugin releases; bump it when shipping changes. The build regenerates the MCP snapshot, requires matching UI versions, copies the skill resources, and carries bundled dependency license notices. Generated runtime artifacts are not a blanket public license grant for Highway.

## Publication status

These packages are for local clients. They are not approved directory listings, do not provide a hosted endpoint, and do not run in ChatGPT web. No listing button should imply otherwise.

For a web-capable ChatGPT/Codex release, host the read-only MCP over supported remote transport and complete publisher/domain verification, listing/legal information, test cases, and review. A local-only OpenAI directory submission has separate eligibility requirements. Keep that release separate from the working direct-install packages.

References: [OpenAI packaging](https://developers.openai.com/plugins/build/plugins), [desktop-only submission](https://developers.openai.com/plugins/deploy/desktop-only), [Claude manifest](https://code.claude.com/docs/en/plugins-reference).

## Validation

Run `npm run check:plugins` to build and check relocated plugin archives, skill references, and real MCP requests. Run native client validators when available. A passing package check does not imply directory approval or a completed installation in a user’s client.

## Design workflow (plugin 0.2.0)

The skill carries the full nine-pass review process, product direction, audit signs, visual examples, and optional snapshot/story utilities. Highway's public APIs, type scale, materials and motion remain the implementation contract. A new content review checks unsupported metrics, generic filler, decorative widgets and summaries that become stale after interaction. Substantial design work requires rendered review and evidence of any refinements; API correctness alone is not a design-quality pass.
