# Highway showcase

From the repository root, run `npm ci` then `npm run dev:showcase`. Open http://localhost:5190. Build with `npm run build:showcase`; output stays in this app's `dist` folder.

This app owns the guide, searchable showcase and component previews. It uses package-owned components and styles. It has no Cloudflare plugin, authentication lookup, database or email requirement. Three labelled Yardwork reference previews intentionally import the example's components; they never enter the core packages.

`HIGHWAY_DEMO_URL` configures the Yardwork link on the Examples page; the default is http://localhost:5191/demo. Existing starter routes reexport these screens for compatibility. Run commands at the repository root: installation and build tooling are shared.

## Preview rendering

`components/component-preview.tsx` renders every component page and directory thumbnail directly in React. It uses the existing package components and demo controls; no showcase iframe or separate stylesheet build is needed. The shared canvas uses `--surface-muted` through `preview-surface.css`.

Examples live in `previews/`, grouped by actions, inputs, feedback, overlays, surfaces, effects, agent tools, and navigation. Each interactive example owns its state. `examples.tsx` and `metadata.json` describe the examples; `interactive-examples.jsx` maps example IDs to their implementations. Demo reference examples stay in `demo-reference.tsx`.

`catalog/components.json` owns public families, variants, selection rules, and exports. The directory and component documentation read it directly. The MCP build snapshots that same catalog alongside package declarations and canonical guides; rebuild the MCP after changing those sources. `catalog/component-reference.json` supplies generated API declarations for the docs.

There is no separate preview application or build. `/showcase?component=<id>&preview=1` uses the same renderer without the documentation shell. Old `/invariant-preview/index.html` links redirect there; the existing avatar and video asset URLs remain valid.

Preview canvases show one working example with compact Appearance, Size, and State menus when supported. `previews/state-examples.ts` owns these presets. Each change resets the example with the selected combination; grid thumbnails remain control-free.

`catalog.pages` owns discoverable component pages. Distinct purposes have separate grid cards and sidebar links; same-purpose modes stay on one page. Families remain a relationship map for discovery and MCP selection.
