# Choosing Highway components

`components.json` is the canonical map for installing Highway in another project. Read it before choosing controls. The showcase uses the same map to display public package imports. Internal repository examples are labelled separately.

## Integration workflow

1. Identify the host's framework, existing behavior, brand tokens and required UI states.
2. Map each proposed change to a catalog export and its `useWhen` guidance. Preserve handlers, routes, validation and infrastructure.
3. Install the matching `@highway/react` and `@highway/styles` versions using the [package guide](../docs/PACKAGES.md). Import the stylesheet once and wrap the intended region in `HighwayTheme`.
4. Render the real exports. Adapt application data and callbacks to their documented props. Do not recreate component markup or override internal geometry, materials or motion.
5. Apply the existing brand through the theme. Adopt the exact [application type scale](../docs/PACKAGES.md#application-typography-contract) across host content: body14/20, dense tables13/20, and the documented heading/metadata roles. Use `highway-type-{role}` or `data-highway-type`, map competing host typography, and preserve rem scaling. Check keyboard, mobile, light/dark, pending and failure behavior in the host.
6. If no supported export fits, record the gap before choosing a substitute. Demo-only entries are not installable components.

## Common decisions

| Need | Choose | Distinction |
| --- | --- | --- |
| Default action or field | `Button`, `Input`, `NativeTextarea`, `NativeSelect` | Native form semantics; wire existing validation and callbacks. |
| Original translucent glass material | `GlassCard` and `Card*` children | `Card` is the separate Invariant card API, not a replacement for glass. |
| Save/cancel form overlay | `FormDialog` | Owns pending and failure flow. See its API before wiring submission. |
| Custom composed dialog | `FoundationDialog` and `Dialog*` children | `Dialog` is the separate Invariant API; their props are not interchangeable. |
| Invariant-specific interaction | The matching catalog export | `TextInput`, `Textarea` and `Select` have their own documented contracts. |
| Ask interaction | `AskBar` | Supply the host callback; the component does not connect an AI service. |
| Brand | `HighwayTheme` | Use supported tokens, preserve semantic statuses and portal theming. |
| Progressive edge treatment | `ProgressiveBlur`, `EdgeFade`, `MediaScrim` | Compose bounded visual effects; preserve readability. |
| Yardwork navigation or bookings | Demo reference only | Application-specific composition, not a package export. |

## Catalog contract

- `schemaVersion` versions this data format; `packageVersion` is the compatible package release, not a promise of public npm availability.
- `components` lists public runtime exports. `status: alternative` means supported with a distinct API, not deprecated. Helpers are marked separately.
- `source` points to the owning repository module, with an optional extension. It is evidence for maintainers, not a consumer import path.
- `showcase` maps each gallery entry (including aliases) to `package`, `mixed`, or `demo-only` availability and exact exports.
- `gaps` records source-only patterns that must not be presented as package exports.
- `recipes` recommends small compositions without creating additional implementations.

Update this catalog alongside public exports or showcase entries. Run `npm run check:packages:clean` to verify the catalog and install fresh tarballs in an external temporary project. This checks strict TypeScript, a production Vite build, React SSR, browser interaction, and source parity. It does not prove every host framework or real-device behavior.

The CI job runs the same check. It does not publish packages or deploy the application.

## Families

`families` owns discovery and variant selection for the showcase and MCP. Each family has a stable ID, primary showcase entry, variants with exact exports, use cases, implemented props, optional options/examples, and compatibility names. Component `families` links include composition helpers. Demo-only compositions are excluded from installable family discovery; their direct showcase routes remain available.

A family is a navigation and selection unit, not necessarily one export. Preserve specialized behavior rather than manufacturing an all-purpose mode prop. Runtime consolidation uses compatibility wrappers and shared internal behavior while preserving authored presentation.

## Terminology

- **Components:** members of a family, such as Button, Split button, and Copy button. Some members select a supported behavior mode of the same export.
- **Appearance:** visual options for the selected component, such as default, secondary, ghost, and destructive.
- **States:** disabled, loading, error, and other interaction conditions.

The catalog owns these definitions. The existing `variants` field and `select_variant` tool name remain compatible; they select family members or behavior modes. Read the selected component’s props for appearance and state options.

Component pages follow purpose, not family membership: distinct behaviors get separate pages and navigation entries. `catalog.pages` maps each page to its family and same-purpose example modes. `get_family` returns this page map alongside supported APIs. Appearance, sizes, and states remain on the selected component page.
