# Highway for agents

Highway's MCP server exposes the same canonical catalog, package declarations and adoption guidance used by maintainers. It is a separate local tool, independent of the React/CSS runtime, demo and hosting infrastructure.

See [setup, client configuration and tools](../packages/highway-mcp/README.md).

Use this sequence when adopting Highway:

1. Read `get_guidance` with `topic: "implementation"`  , `topic: "packages"`, and `topic: "systems"`.
2. Search for the intended interaction with `search_components`.
3. Inspect each exact export, engineering contract, and checked example with `get_component`, following supporting declaration resources for named props. The returned public import resolves aliases correctly.
4. Map existing handlers and states to that API; retain the host control when no compatible mapping exists.
5. Use `get_installation` to obtain version-matched instructions. Installation and edits remain the agent's separate, explicitly scoped work.
6. Verify existing host behavior, brand, accessibility and surrounding styles after adoption.

The server's UI package version is explicit in component/search/install responses. Match that version to the installed packages; do not apply a newer API to an older installation. Its searchable catalog is bounded, and declaration text is fetched only for selected components. It neither reads arbitrary host files nor accepts file paths, credentials or commands.

## Maintenance

After changing exports, update `catalog/components.json`. After changing props or contracts, run `npm run systems:update` and review the generated API, reference, and contract changes before accepting them. Run `npm run verify` to check drift. After changing guidance, rebuild the MCP snapshot. `npm run check:mcp` performs that build before integration tests; `npm run pack:mcp` checks before producing the private artifact. Install the separate server dependencies first with `npm ci --prefix packages/highway-mcp --ignore-scripts`.

MCP checks supplement the existing package release gate; core UI changes still require `npm run check:packages:clean` and the applicable design checks. Run both gates when shipping UI and MCP together. The MCP CI job validates its protocol and packed delivery independently of browser tests.

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

Component pages follow purpose, not family membership: distinct behaviors get separate pages and navigation entries. `catalog.pages` maps each page to its family and same-purpose example modes. `get_family` returns this page map alongside supported APIs. Appearance, sizes, and states remain on the selected component page.
