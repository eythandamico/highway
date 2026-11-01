# Exact component discovery and integration

## Evidence order and version compatibility

1. Inspect the consumer's `package.json`, lockfile, framework, CSS entry, and existing provider. Determine whether Highway is already installed.
2. Installed declarations define the API available to that application. A newer showcase or MCP snapshot does not add capabilities to an older package.
3. Use Highway MCP for discovery and guidance when connected. Tool names may have a client prefix; discover the available tools rather than assuming a namespace.
4. Without MCP, use the installed package declarations and supplied adoption catalog/docs. In a Highway checkout, use `catalog/components.json`, `catalog/component-reference.json`, `docs/PACKAGES.md`, and `docs/IMPLEMENTATION.md`. Paths are relative to that checkout, not a consumer application.
5. If neither declarations nor authoritative docs are available, request the package/artifact or documentation needed. Do not guess a public registry URL, release version, or API.

MCP serves a bundled snapshot, not live source. Compare its reported package version with the installed version. If they differ, use matching evidence or explicitly resolve an upgrade; do not silently upgrade the host. In a maintainer checkout, rebuilding and restarting MCP refreshes its snapshot.

## MCP requests

These are tool inputs, not shell commands:

| Purpose | Tool and input |
| --- | --- |
| Adoption rules | `get_guidance({"topic":"implementation"})` |
| Installation source | `get_installation({"mode":"react"})` |
| Find a control | `search_components({"query":"search","limit":8})` |
| Inspect an export | `get_component({"name":"AskBar"})` |
| Discover related modes | `list_families({"query":"combobox"})` |
| Read a known family | `get_family({"family":"combobox"})` |
| Resolve an implemented mode | `select_variant({"family":"combobox","variant":"multi-select"})` |

Search is keyword-based. Retry with the interaction name or browse with an empty query; do not infer absence from one unsuccessful search. Read supporting declaration resources returned by `get_component` when named types carry the value or callback contract. `select_variant` can return candidates; it does not decide what best fits the user's task.

Other guidance topics are `packages`, `design`, `effects`, `systems`, and `interactions`. Fetch only the relevant guidance. MCP is read-only; it cannot install packages or perform host actions.

## Installation and scope

Highway distributes matching React/styles packages as public GitHub Release tarballs. Call `get_installation` and install its exact versioned URLs into the user’s project when Highway adoption is requested. No Highway checkout or GitHub credentials are required. Do not assume `npm install @highway/react` or a shadcn registry command will work. If downloading fails, report the failure rather than guessing a release or using mismatched versions. Use the host's package manager and commit-compatible lockfile workflow; don't substitute a hard-coded version from this skill.

Import CSS once in the framework's permitted global CSS entry, then wrap the intended region in `HighwayTheme`. Reuse an existing provider instead of nesting a duplicate accidentally. Load brand fonts through the host. Preserve its router, authentication, API clients, theme persistence, and deployment setup.

```tsx
import { AskBar, HighwayTheme } from '@highway/react';
import '@highway/styles/styles.css';

export function AskRegion({ send }: { send: (text: string) => Promise<void> }) {
  return <HighwayTheme><AskBar onSend={send} /></HighwayTheme>;
}
```

This illustrates the confirmed `onSend` callback, not an AI integration. The host must provide `send`, await its real operation, and propagate failure. In frameworks with server/client boundaries, place interactive code in the appropriate client component and CSS in the allowed entry. Recheck the installed version's declarations before use.

## Names that are easy to confuse

- `Input`, `NativeTextarea`, and `NativeSelect` expose native field semantics. `TextInput`, `Textarea`, and `Select` have distinct contracts; do not assume DOM-event callbacks or interchangeable labels.
- `GlassCard` uses the translucent glass material with `Card*` composition helpers. `Card` is a separate API.
- `FoundationDialog` with `Dialog*` helpers is distinct from `Dialog`. Inspect the exact export's composition and state ownership.
- `AskBar` and a prompt/composer variant are not interchangeable solely because both accept text. Match the interaction and declared callbacks.
- Public import names can differ from names in implementation files. Use the public import from the catalog.
- Showcase compositions and repository demo screens are not automatically package exports. Only advertise an option or component supported by the installed catalog/declarations.

## Diagnose styling at the owning layer

If the installed component looks wrong, first check stylesheet loading, package version pairing, theme scope, host resets, inherited font/line-height, and CSS specificity. `HighwayTheme` is scoped CSS, not Shadow DOM. Portaled content also needs the intended theme; use the supplied theme infrastructure.

Use app CSS for grid, flex, widths, and external spacing. Do not patch `.ui-*` or `.hw-*` internals to approximate the showcase. In the Highway source repository, fixes belong in the canonical React/styles packages; update catalog/declarations when the API changes. Consumer projects should report an unsupported capability rather than editing `node_modules`.
