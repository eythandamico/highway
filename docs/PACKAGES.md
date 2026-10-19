# Highway as installable packages

Highway has two versioned, private-distribution packages built directly from the implementations used by the showcase:

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

- `artifacts/highway-styles-0.1.0.tgz`
- `artifacts/highway-react-0.1.0.tgz`

Only compiled assets, declarations, manifests, READMEs and license notices are packed. The names do not imply public npm publication or ownership of the `@highway` npm scope. Use these tarballs or a private registry you control. Never publicly publish the private source or assume permission to publish under an unowned scope.

For a shared consuming repository, place the tarballs in a versioned `vendor/` folder or fetch the same private release assets in CI. Avoid references to someone else's absolute local directory.

```sh
npm install ./vendor/highway-styles-0.1.0.tgz ./vendor/highway-react-0.1.0.tgz
```

Pin React and React DOM to matching supported versions. Commit the consumer's lockfile. Installing tarballs copies the built library into that project; it does not modify the Highway source.

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
