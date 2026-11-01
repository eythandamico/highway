# Highway as installable packages

Highway has two versioned packages distributed through public GitHub Releases built directly from the implementations used by the showcase:

| Package | Contents | Runtime |
| --- | --- | --- |
| `@highway/styles` | Compiled scoped tokens, typography, component styles, glass, gradients, progressive blur, motion | CSS only |
| `@highway/react` | Original components, composable glass card and overlay primitives, `HighwayTheme` | React 19.2+ / React DOM 19.2+ |

The existing full application remains the optional starter. No auth, routing, domain model, demo data, database or Cloudflare configuration is part of these packages. Vite and TypeScript are supported through an isolated installed-package example. The JavaScript is ESM with `use client` directives, and imports/rendering are checked server-side; a full Next.js integration is not certified by that smoke test. React 18, CommonJS and direct execution of React components in another UI framework are not supported by this release.

## Build and distribute

```sh
npm ci
npm run pack:packages
```

Outputs:

- `artifacts/highway-styles-0.3.0.tgz`
- `artifacts/highway-react-0.3.0.tgz`

Only compiled assets, declarations, manifests, READMEs and license notices are packed. The names do not imply public npm publication or ownership of the `@highway` npm scope. Use the public GitHub Release tarballs. Do not assume permission to publish under an unowned npm scope.

Install the exact versioned public URLs below. No checkout or GitHub credentials are required. npm records their URLs and integrity hashes in the lockfile. Local tarballs remain supported for offline/private workflows.

```sh
npm install --ignore-scripts --save-exact https://github.com/eythandamico/highway/releases/download/highway-v0.3.0/highway-styles-0.3.0.tgz https://github.com/eythandamico/highway/releases/download/highway-v0.3.0/highway-react-0.3.0.tgz
```

Pin React and React DOM to matching supported versions. Commit the consumer's lockfile. Installing tarballs copies the built library into that project; it does not modify the Highway source.

## Install with your coding agent

For combined UI package, skill, and project-local MCP setup, use [the onboarding flow](ONBOARDING.md). It supports a new React/Vite app or an existing standalone npm React project. `npm run onboard` previews by default and builds the artifacts automatically when applied. The lower-level command below remains available for UI-only or CSS-only adoption.

## Preview-first setup command

From this Highway checkout, after building the tarballs, preview an independent npm project:

```sh
npm run adopt -- --target /absolute/path/to/project
# Review the listed additions, then apply:
npm run adopt -- --target /absolute/path/to/project --apply
# For a CSS-only application:
npm run adopt -- --target /absolute/path/to/project --mode styles --apply
```

The target must have package.json; React mode also requires an already installed matching supported React/React DOM pair. The command vendors matched artifacts, installs with lifecycle scripts disabled, and adds `src/highway` with theme wiring, the exact-component catalog and implementation instructions. The provider is TSX when the host has tsconfig.json, otherwise JSX. It leaves routes and host source untouched. Follow the generated INTEGRATION.md to import CSS and wrap the selected region. Installation alone does not restyle existing markup.

The default is read-only preview. Existing Highway installations or generated-file collisions are refused; upgrades follow release notes. npm-only standalone projects are supported by the command. Use manual installation for workspaces, other package managers, and framework-specific global CSS conventions. Installation failure restores package.json, lockfile and generated files; node_modules may need resynchronizing.

Read [the implementation contract](IMPLEMENTATION.md) before asking an agent to adopt Highway. See [the changelog](../CHANGELOG.md), [0.3.0 upgrade notes](releases/0.3.0.md), and [package release procedure](PACKAGE-RELEASE.md).

## Adopt in an existing React project

Import the CSS once, using the host's normal CSS import mechanism:

```tsx
import '@highway/styles/styles.css';
import { HighwayTheme, Button, GlassCard, AskBar } from '@highway/react';

export function ExistingFeature() {
  return <HighwayTheme>
    <GlassCard><Button onClick={existingSave}>Save</Button></GlassCard>
    <AskBar onSend={existingSend} />
  </HighwayTheme>;
}
```

Keep your routes, authentication, API clients, handlers and deployment. Do not import `app/globals.css`, configure a `@/` alias to Highway, install Tailwind for Highway, or copy its backend. Use the components directly rather than recreating their markup or overriding their internal classes.

`HighwayTheme` scopes styling to its subtree. Its portal host carries the theme to Foundation dialogs, sheets, dropdown menus, selects and date popovers outside clipping containers. Existing host styles outside the scope are unchanged. The wrapper does not use Shadow DOM: high-specificity host selectors targeting its descendants can still override styles. Audit those conflicts instead of adding broad `!important` rules. CSS property registrations and keyframe names remain document-level.

## Keep the exact appearance or add a brand

No theme options means Highway defaults. A brand changes only the supplied choices:

```tsx
<HighwayTheme mode="dark" brand={{
  primary: '#4055d8',
  primaryForeground: '#ffffff',
  focus: '#8ca7ff',
  fontFamily: 'Brand Sans, sans-serif',
}}>
  <YourFeature />
</HighwayTheme>
```

Supply matching foreground/background colors with readable contrast, and load your font separately. Component geometry, transitions, focus behavior and pending/error handling remain the same. Mode is explicit and controlled by your application; Highway does not write theme preferences or change the document's theme. Nested themes inherit brand settings. `tokens` provides advanced CSS variable overrides where needed. Keep semantic success, warning, error and focus meaning intact.

Core TypeScript APIs ship typed declarations. Older JavaScript Invariant APIs ship permissive inferred declarations; they are usable from TypeScript but do not provide exhaustive prop validation. `Card` keeps its original Invariant API; use `GlassCard` plus `CardHeader`/`CardContent` for the glass material. `FoundationDialog` names the Radix composition; `Dialog` keeps the Invariant API. `NativeTextarea` exposes the plain field, while `Textarea` keeps the labelled API.

## Application typography contract

Use this scale for the entire adopted application, including existing headings, navigation, tables, and custom content—not only Highway controls. Import the stylesheet once and wrap the application in `HighwayTheme` (or `.highway` for CSS-only usage). The scoped default is **14px / 20px, weight 400**. Content outside that scope is unchanged.

| Role | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| `display` | 30 / 36 | 600 | Primary KPI |
| `heading-xl` | 24 / 32 | 600 | Page titles |
| `heading-lg` | 18 / 28 | 600 | Major sections |
| `heading-md` | 16 / 24 | 600 | Card titles |
| `body` | 14 / 20 | 400 | Standard UI, navigation |
| `body-sm` | 13 / 20 | 400 | Dense tables, filters |
| `caption` | 12 / 16 | 400–500 | Chart labels, metadata |
| `micro` | 11 / 16 | 500 | Dense secondary labels only |

Values are pixel equivalents at the default 16px browser root. Implementation uses rem units; do not set the root to 14px or disable browser zoom. The scale stays consistent on phones, with an accessibility exception: editable inputs use at least 1rem (16px at the default root). Caption defaults to weight 400; 500 is also appropriate for emphasized metadata. Never use caption or micro for primary data.

```tsx
import '@highway/styles/styles.css';
import { HighwayTheme } from '@highway/react';

<HighwayTheme brand={{ fontFamily: 'Brand Sans, sans-serif' }}>
  <h1 className="highway-type-heading-xl">Overview</h1>
  <p className="highway-type-body">Your existing application content</p>
  <div className="highway-type-display">1,240</div>
  <table className="highway-table">{/* existing rows */}</table>
  <span data-highway-type="caption">Updated today</span>
</HighwayTheme>
```

Every role is available as `highway-type-{role}` or `data-highway-type="{role}"`; both set size, line height, and weight together. CSS-only hosts can use the same markup inside `.highway`. No Tailwind compiler is required. Canonical custom properties are `--type-{role}`, `--leading-{role}`, and `--weight-{role}`. Existing aliases resolve to these values; they do not define a separate scale.

Brand the font family and colors while retaining the role scale. During adoption, remove or map competing host typography rules within the adopted scope. Merely installing npm packages cannot rewrite existing app markup or defeat higher-specificity host CSS. Use the explicit roles for custom content and verify computed styles after integration.

## Styles without React

Use `@highway/styles/effects.css` for the effects toolkit or `tokens.css` for just theme/typography. Wrap the adopted area in `.highway` and set `data-highway-mode="light"` or `"dark"`; add class `dark` in dark mode. The effects use the same documented markup and semantic variables as the React components. Full `styles.css` includes both; do not import all three entries together.

## Verify the real installation

```sh
npm run pack:packages
cd examples/highway-vite
npm ci
npm run build
npm run dev
```

The example at localhost:5192 has its own dependencies and imports the actual packed files. It contains an untouched host area, default/custom/dark themes, glass, controls, a menu, a lazy date calendar, a protected form and Ask bar. It has no Tailwind or Cloudflare setup. Package-browser tests cover representative parity and interaction behavior; see `docs/VALIDATION.md` for actual results and limits.

## Release discipline

Keep styles and React package versions matched. Build from clean source, validate archives and installed consumers, and increment versions for every distributed change. Do not silently replace a released tarball with different contents at the same version. Keep source paths for provenance, not as consumer imports. Update this guide and the fixture when the supported React range or component API changes.

## Validate a release

After `npm run pack:packages` and installing the tarballs in `examples/highway-vite`, run `npm run test:packages`. This checks archive contents, the independent TypeScript/Vite build, server rendering, and browser interactions. Shared component changes also require `npm run check:ui:full`.

## Choosing exact components and checking installation

Use the [canonical component catalog](../catalog/README.md) before mapping a host UI to exports. The showcase distinguishes package imports from internal source examples and demo-only compositions.

Run `npm run check:packages:clean` for an independent temporary consumer installation using freshly packed artifacts. It checks the catalog, strict consumer types, production build, SSR and browser parity. CI runs the same check; it does not publish or deploy. The source comparison server needs local starter setup, but the external consumer needs no infrastructure.

## Source ownership

Canonical implementations now live in `packages/highway-react/src`, including the adapted Invariant modules and their license. Canonical tokens, typography, controls, surfaces and Tailwind theme rules live in `packages/highway-styles/src`. Legacy paths reexport these implementations for compatibility. Edit the package owner, not the shim.

The source showcase (`apps/showcase`) and synthetic demo (`examples/yardwork`) are independent development apps. Run `npm run dev:showcase` or `npm run dev:demo`; neither requires Cloudflare setup. `npm run build` validates their production builds alongside the packages. The optional backend uses `dev:starter` and `build:starter`.

### Analytics dashboard rules

- Use `font-variant-numeric: tabular-nums` for table values and KPI cards. Highway Table, display text, and the metric helpers include it. Use a brand font that supports tabular figures; the package cannot add missing glyph features.
- Use only weights 400, 500, and 600. Strong/bold emphasis resolves to 600; avoid 700+ overrides.
- Prefer a 14px muted secondary label over shrinking ordinary labels to 11px. Use `highway-secondary-label`; reserve micro for genuinely dense secondary annotations. Keep readable contrast when branding.
- Dense desktop tables use 13px / 20px text and roughly 36–44px single-line rows. Highway Table and `highway-table` target 40px at the default root. Wrapped text and enlarged browser text expand rows rather than clipping; phone spacing stays comfortable.
- Reserve 30px display for a meaningful primary KPI. Secondary KPIs use the existing 24px heading-xl role, within the preferred 20–24px range. Do not promote every numeric value to display size or add an unnecessary ninth type size.

```tsx
<p className="highway-secondary-label">Net revenue</p>
<div data-highway-metric="primary">$48,120</div>
<p className="highway-secondary-label">Average order</p>
<div data-highway-metric="secondary">$124</div>
```

`highway-metric` alone defaults to the secondary metric role. Use `highway-table` for adopted host tables and preserve their existing sorting, filtering, and selection behavior. Keep equal numeric precision within a column, and right-align comparable amounts through the host column configuration.


## Specialized control contracts (0.3.0)

- `BottomSheet` leaves the host page's background and root styles alone. Its optional `pageTarget` accepts an explicitly owned sibling `HTMLElement` for the original page shrink effect. Keep the sheet outside that target (a transformed ancestor changes fixed positioning); do not share a target between simultaneous sheet animations. Target properties are restored on unmount after the exit animation. Dialogs coordinate scroll locking and focus restoration.
- `Dropdown`, `ProfileMenu`, and `WorkspaceSwitcher` keep closed actions inert during exit motion. Enter/Space opens the button; Arrow Up/Down, Home, and End navigate actions. Escape returns focus to the trigger; Tab dismisses and continues normal navigation. Supply a native button (or a button-compatible component) as a custom Dropdown trigger.
- `NumberInput` is a labelled stepper group with a read-only numeric status and native Increase/Decrease buttons. Click, Enter, or Space steps once; holding a pointer repeats. Wheel adjustment requires focus inside the group so ordinary page scrolling does not change data.
- `SliderInput` exposes a labelled slider with pointer/touch dragging, arrow steps, Home/End bounds, and Page Up/Down ten-step adjustments. Steps are anchored to `min`, including decimal ranges.
- `SplitPane` uses a focusable separator. Left/Right adjusts a horizontal layout; Up/Down adjusts a vertical layout, by five percentage points. Home/End select its bounds. It supports pointer/touch dragging without changing body selection or cursor styles.
- `Tabs` is a **view-button group**, with `aria-pressed` on the active button and native Tab navigation. It does not claim the ARIA tab/panel pattern or create panels; the host owns view content. IDs may contain quotes or other punctuation.
- `Progress` displays normalized percentages (`value={5} max={10}` means 50%) and exposes progressbar semantics. Reduced-motion users receive the final value immediately, without a JavaScript count-up or shimmer.

The audited controls export explicit prop interfaces (`NumberInputProps`, `SliderInputProps`, `SelectProps`, `BottomSheetProps`, `DropdownProps`, `ProfileMenuProps`, `WorkspaceSwitcherProps`, `SplitPaneProps`, `TabsProps`, `ProgressProps`). Callback values and option shapes are checked by TypeScript; optional runtime props stay optional. Other legacy JavaScript exports may still use inferred declarations.

### Token identity

`TokenIcon` and `TokenBadge` adapt Vault's token artwork and network badges. Supply image URLs or custom badge children; no wallet connection or network registry is bundled. Missing and failed images use the bundled fallback artwork, with no additional image request. Sizes are `small` (24px icon / 12px badge), `large` (32px / 16px), and `xl` (40px / 16px). The icon masks a real transparent gap around its attached badge so it works on any surface.

```tsx
<TokenIcon
  token={{ symbol: "SOL", name: "Solana", imageUrl: tokenImage }}
  network={{ label: "Solana", imageUrl: networkImage }}
  size="large"
/>
<TokenBadge label="Solana" imageUrl={networkImage} />
```

Use `decorative` on an icon when adjacent text already identifies the token and network. `TokenBadge` uses its `label` as its accessible name.

### Breadcrumbs

Use `Breadcrumbs` with `items: { label, href? }[]`. Ancestors with `href` are links, and the final item is the current page (`aria-current="page"`). Paths wrap on narrow screens. Supply `renderLink` to integrate your router without replacing the navigation structure. The optional `label` names the navigation landmark.

### Copy page

`CopyPage` provides a split copy button with Markdown viewing, page-link copying, an optional install command, and assistant actions. Pass `markdown`, optionally `pageUrl` (otherwise the current URL), `installCommand`, and `showAssistants={false}` to omit assistant links. Successful clipboard writes show a checkmark and “Copied” for two seconds. Provider artwork is bundled in the shared styles.
