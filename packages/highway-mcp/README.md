# Highway MCP

A local, read-only MCP server for Highway's exact component APIs and adoption guidance. This is a separate development tool: it adds no dependencies or JavaScript to applications using `@highway/react` or `@highway/styles`.

Server version **0.2.0** serves a bundled snapshot of UI packages **0.3.0**. It requires Node **22.13+**. The snapshot is built from the canonical catalog, compiled declarations and documentation, with a SHA-256 integrity check. Rebuild and restart the server after changing Highway; this is not a live filesystem watcher.

## Build from the Highway checkout

```sh
npm ci
npm ci --prefix packages/highway-mcp --ignore-scripts
npm run build:mcp
npm run check:mcp
```

Run directly with `node packages/highway-mcp/src/server.mjs`, or let your MCP client launch it. It speaks MCP over stdin/stdout; it is not a website. It waits silently for client requests. Do not launch it through a command that prints banners to stdout.

## Connect an MCP client

For clients supporting `mcpServers` JSON configuration, replace both absolute paths below with your Node executable (`command -v node`) and checkout location:

```json
{
  "mcpServers": {
    "highway": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/highway/packages/highway-mcp/src/server.mjs"]
    }
  }
}
```

Other clients may use a different configuration format: use the same executable and argument array in their stdio server settings. The paths are separate arguments, so spaces in the checkout path work. No credentials, account, port, Cloudflare deployment or environment variables are needed. Client settings are not changed automatically.

## Tools

| Tool | Input | Result |
| --- | --- | --- |
| `list_families` | Optional `query` | Family discovery with implemented variants |
| `get_family` | Exact `family` ID | Variant use cases, props, compatibility and preservation rules |
| `select_variant` | `family`, optional `variant` and `intent` | Exact imports and mode props; ambiguous requests return candidates |
| `search_components` | `query`, optional `limit` (1–20) and `offset` | Ranked public exports with selection constraints; empty query browses |
| `get_component` | Exact public export or `highway.id` as `name` | Correct import, canonical declarations, referenced prop resources, engineering contracts, compiled examples and recipes |
| `get_guidance` | `topic`: `implementation`, `packages`, `design`, `effects`, `systems`, `interactions` | Bundled canonical guidance |
| `get_installation` | `mode`: `react` or `styles` | Version-matched private tarball instructions and adoption checks |

Search is deterministic keyword matching, not semantic AI. Unknown names and showcase-only compositions are not invented or presented as installable APIs. Public aliases matter: `GlassCard` is not interchangeable with `Card`; declaration modules may retain internal names, so use the public import returned by the tool.

Resources include `highway://catalog`, `highway://guides/{topic}`, and fixed declaration URIs returned by `get_component`. Read supporting declarations when a component references a named prop type. Third-party types such as React's native button props remain references to those installed packages. Recipes describe valid composition intent; they are not generated application code.

A useful agent request:

> Use Highway MCP to map this application's controls to exact public exports. Read the implementation guide and each selected component's declarations. Preserve existing handlers, validation, routes, infrastructure and brand. Show the mapping before replacing controls. Import the real components; do not reproduce their markup or CSS. Verify the host's existing behavior after integration.

The tools only return information. They cannot inspect or edit a consumer project, install packages, execute shell commands, deploy, or connect to a database. The calling agent still needs permission and project context for its own actions. MCP guidance improves selection; it cannot guarantee an arbitrary host integration is regression-free.

## Distribute privately

```sh
npm run pack:mcp
```

This runs the MCP checks and writes `artifacts/highway-mcp-0.2.0.tgz`. The tarball contains the server and its data snapshot, not the showcase, demo, or original checkout. Install it in a separate tools directory with `npm install --ignore-scripts /path/to/highway-mcp-0.2.0.tgz`, then configure the client to run that directory's `node_modules/@highway/mcp/src/server.mjs` with Node. Do not assume this private package is published on npm.

Tests exercise real SDK client/server stdio requests and installation outside the source repository. CI rebuilds the snapshot from package sources before testing; generated data is intentionally ignored by Git. Ship a new server artifact when its bundled UI version or guidance changes.

## Family component selection

1. Call `list_families` with the intended interaction.
2. Call `get_family` with its exact ID. Read each mode's `when`, `exports`, `props`, `options`, examples and compatibility names.
3. Call `select_variant` with the family and exact variant ID. With only an intent, it returns keyword-ranked candidates, not an automatic design decision. Resolve ambiguity using the host's behavior and value shape.
4. Call `get_component` for each selected export and use its exact declaration. Keep existing handlers and native form behavior.

Example: `get_family({"family":"combobox"})`, then `select_variant({"family":"combobox","variant":"multi-select"})` returns `Combobox` with `multiple: true`. `MultiSelect` remains supported for existing integrations.

`highway://families` exposes the same data used by the showcase. Family membership does not make different APIs interchangeable: draggable sheets, async buttons, media cards, native form adapters and composed workflows retain their contracts. Proposed modes are not advertised.

## Terminology

- **Components:** members of a family, such as Button, Split button, and Copy button. Some members select a supported behavior mode of the same export.
- **Appearance:** visual options for the selected component, such as default, secondary, ghost, and destructive.
- **States:** disabled, loading, error, and other interaction conditions.

The catalog owns these definitions. The existing `variants` field and `select_variant` tool name remain compatible; they select family members or behavior modes. Read the selected component’s props for appearance and state options.

## Companion skill

The repository includes [`skills/highway`](../../skills/highway/SKILL.md), a consumer-facing skill for building and refining interfaces with the exact Highway APIs. MCP supplies versioned component facts; the skill guides selection, composition, and host integration. Copy the complete `skills/highway` directory into your agent's project or personal skills directory, retaining its references, license, and attribution. It does not install the UI packages or connect MCP automatically.
