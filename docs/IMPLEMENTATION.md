# Implement with exact Highway components

This is the consumer contract for Highway 0.3.0. Read the adjacent `components.json` (in an installation) or `catalog/components.json` (in the source repository), then `PACKAGES.md`. The catalog is the export map; installed TypeScript declarations are the prop contract. Do not guess an API from its name.

## Before editing an existing application

Record the framework, installed React pair, package manager, CSS entry, providers, routes, form handlers, validation, API calls, loading/error states, and deployment commands. Record existing brand colors, font family and light/dark behavior. Run the host's baseline build and tests; distinguish existing failures from regressions.

Create a mapping before replacing UI:

| Existing element / behavior | Exact Highway export | Data/handler adapter | Preserved states | Verification |
| --- | --- | --- | --- | --- |
| Save button → existingSave | Button | onClick={existingSave} | disabled, pending, failure | Existing save test |
| Glass content panel | GlassCard + CardContent | existing children | long content, narrow screen | Visual comparison |
| Email field | Input + Label | existing name/value/onChange/ref | validation and autofill | Existing form test |

Fill this table with the actual project elements. Do not select components merely because a similar showcase tile exists.

## Selection rules

- Import runtime components only from `@highway/react`; import styles once from `@highway/styles/styles.css`. No source aliases, copied JSX, local lookalikes, or duplicate CSS implementations.
- `GlassCard` is the glass surface. `Card` has a separate Invariant API. Do not substitute them.
- `FoundationDialog` / `Dialog*` are composable primitives; `Dialog` is a different API. Use `FormDialog` only after matching its submit and error contract to the host.
- Use `Button`, `Input`, `NativeTextarea`, and `NativeSelect` for default native form behavior. `TextInput`, `Textarea`, and `Select` have distinct contracts; inspect declarations first.
- Use `AskBar` for the ask interaction. The host owns its send handler and any AI service.
- Use `ProgressiveBlur`, `EdgeFade`, and `MediaScrim` for supported effects. Do not recreate those effects with new layers or arbitrary filters.
- Preserve component geometry, glass materials, focus treatment and motion. Do not override internal selectors to make an approximation.
- When no export fits, document the gap and compose supported primitives if appropriate. Keep the existing host component until a suitable mapping is agreed. Never silently replace functional UI with a decorative demo.

## Wiring and branding

Use the generated Provider as a small host-owned adapter. Pass existing brand tokens; do not infer a new brand. For example:

```tsx
import { HighwayProvider } from './highway/Provider';
import { Button, GlassCard, CardContent } from '@highway/react';
// Import ./highway/theme.css once in the framework's global CSS entry.

export function AdoptedRegion({ children, mode, brand }) {
  return <HighwayProvider mode={mode} brand={brand}>{children}</HighwayProvider>;
}

// Keep the existing business handler, validation and pending state.
<GlassCard><CardContent>
  <Button type="button" disabled={isSaving} onClick={existingSave}>
    {isSaving ? 'Saving…' : 'Save'}
  </Button>
</CardContent></GlassCard>;
```

The snippet illustrates wiring; replace host identifiers with existing values and type them for the host. Keep submit buttons' native form behavior where the original application uses it. Avoid double-calling handlers through both form submit and button click.

Brand via `HighwayTheme`/Provider `brand` and supported semantic tokens. Font family may change; the eight-role scale does not. Default UI is 14/20/400, dense tables 13/20/400, headings 16/24, 18/28, 24/32 at 600, primary KPI 30/36 at 600, caption 12/16, micro 11/16. Use `highway-type-{role}` or `data-highway-type` for host content. Keep tabular numbers, weights 400/500/600, muted 14px secondary labels, expandable approximately 40px desktop rows, and secondary KPI 24px. Keep editable phone inputs at least 16px and preserve browser zoom.

Adopt one region first. Check CSS specificity and stylesheet order against existing host CSS; the theme is scoped, not Shadow DOM. Verify portaled dialogs/menus receive the brand. Keep the host router, authentication, data fetching, state, database, build configuration and deployment unchanged unless a separate requirement authorizes a change.

## Acceptance evidence

- Build and typecheck the actual host; rerun its business-flow tests.
- Exercise successful and failed submission, duplicate-submit protection, disabled/pending controls, and preserved form values.
- Compare the exact installed component to the matching showcase in light/dark and branded modes. Record intentional differences from branding.
- Verify keyboard navigation, focus restoration, Escape, reduced motion, touch, narrow viewports, 200% zoom and long content.
- Verify host regions outside the scope retain their computed styles; no new global selectors or backend dependencies.
- Record the package versions, chosen exports, screenshot evidence, measured build impact, and remaining unverified flows. Do not claim real-device or screen-reader verification from a browser automation test.

## Copyable implementation prompt

> Apply the installed Highway components to the agreed region of this project. First read src/highway/INTEGRATION.md, IMPLEMENTATION.md, PACKAGES.md and components.json. Inventory existing behavior and brand, and create an element-to-export mapping. Use exact imports from @highway/react and installed prop declarations; never recreate components or import Highway source files. Preserve handlers, validation, state, routes, infrastructure and deployment. Preserve Highway geometry, glass and motion; use theme tokens for the existing brand and the required typography scale for custom content. Implement one complete region, run the host checks and show visual evidence before expanding. Report gaps instead of inventing substitute components. Do not modify the original Highway repository.

## Choose a family before an export

Use the catalog's family variants (or MCP `list_families`, `get_family`, `select_variant`) to map the host need. Combobox supports single values by default and string arrays with `multiple`. SearchBar supports `expandable`. Stack supports `direction="horizontal"` with alignment and wrapping. MultiSelect, SearchToggle and Row remain compatibility wrappers. Keep primitive field adapters, async workflows, draggable sheets and artwork recipes when their behavior is required. Do not infer that similar-looking triggers share the same value or callback contract.
