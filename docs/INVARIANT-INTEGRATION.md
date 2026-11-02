# Invariant integration history

Highway adopted components and styling from Invariant into its own canonical packages. This document records that integration history; current applications use one Highway component library. Compatibility links for `inv-button` and `inv-toggle` resolve to the canonical Button and Switch. All 50 original preview scenarios remain available.

- `packages/highway-styles/src/tokens.css`: canonical Highway light/dark palette, layered shadows, radii and motion.
- `packages/highway-styles/src/typography.css`: Highway scale in rem with readable phone inputs.
- `packages/highway-styles/src/component-theme.css`: aliases and type classes only.
- `packages/highway-react/src/index.ts`: public package export surface.
- Original Button and Toggle APIs delegate to shared Button/Switch. TextInput and Textarea compose the shared fields, retaining labels/errors and auto-grow.
- All previews render directly through the shared showcase canvas and load the same styling owners.
- Original upstream repositories remain untouched. All state stays demo-only, with no Yardwork backend or account dependency.

The notes below record provenance and retained integration details. Highway is the current implementation owner; Invariant is not a separate runtime dependency.

## Source provenance

The owner requested the original Invariant component collection and its engineering quality on October 19, 2026. All 50 registry entries were copied from the local Invariant project into `packages/highway-compat`. The upstream repository and its deployment were not modified. The MIT license is retained alongside the code.

## Use

For consuming applications, import exact public exports from `@highway/react`, load `@highway/styles/styles.css`, and wrap adopted content in `HighwayTheme`. Use the catalog or MCP to select APIs; do not import compatibility source paths into another project. Preserve host validation and save handlers. See [package installation](PACKAGES.md).

`/showcase?component=inv-segmented-control` exposes all 50 components, original interactive examples, source paths, copyable usage, and component references. `/guide#invariant` explains setup and reuse. Foundation patterns and Invariant components appear together; the Yardwork demo remains available.

## Preview architecture

`apps/showcase/components/component-preview.tsx` renders component pages, standalone views, and grid thumbnails directly in React. Family examples live in `apps/showcase/previews`; each interactive example owns its state and imports canonical package components. Preview controls are local to the canvas; overlays retain their package portals and focus handling. Switching components resets example state. The shared canvas uses Highway’s tan surface token.

There is no separate preview build. Old `/invariant-preview/index.html` links redirect to `/showcase?component=<id>&preview=1`; static avatar and video assets keep their URLs. Tests target the React renderer directly.

Original sample photos in ImageCarousel remain public Unsplash URLs. The personal profile photograph was replaced with a synthetic gradient avatar. The included sample video is from the source showcase. Actions produce local feedback; no customer backend is connected.

## Integration refinements

- Kept the original shapes, materials, measured geometry, timing and easing.
- Added React client boundaries and support for the host's `.dark` theme.
- Added dialog/modal/sheet focus containment, keyboard dismissal, hidden-state inertness, background inertness, and trigger focus restoration.
- Corrected conditional hooks and render-time DOM reads in ImageCarousel; use ResizeObserver for dimensions.
- Made the segmented indicator remeasure on resize and expose selection through `aria-pressed`.
- Removed render-time random waveform initialization and moved handler-ref updates into effects.
- Cleaned up delayed outside-click listeners and sheet animation frames.
- Added reduced-motion CSS and bounded mobile preview widths; input text remains at least 16px on phones.

The original library is JavaScript/JSX. It is linted and bundled but does not claim comprehensive static prop typing. Automated interaction tests and desktop/mobile emulation do not establish assistive-technology or real-device coverage for every component.

Checkbox and RadioGroup also delegate to the shared Radix primitives. Their Invariant selection artwork sits inside 44px targets; labels, keyboard selection, disabled state and form behavior use the shared implementations.

## Ask bar

`components/ui/ask-bar.tsx` extracts the original Yardwork glass composer without its orb. It is exported as `AskBar` from `@highway/react`; the demo's `ask-launcher.tsx` is now a context adapter around that same component. The shared composer has no Yardwork context, transport, AI, or voice dependency. Its material consumes the canonical `--panel-*` tokens and its original capsule motion consumes `--ask-*` tokens.

Supply `onSend(text)` and an append-only `messages` array (`id`, `role`, `text`) for reply previews. Reject the callback on failure to preserve drafts; resolve only after the operation is accepted. Empty submissions and immediate duplicate submissions are blocked. `label`, `placeholder`, `disabled`, `hidden`, `floating`, `compactOnScroll`, and `onOpen` configure embedding. Inline is the default; floating placement requires content clearance, with bottom-navigation offsets owned by the consuming page. The showcase at `/showcase?component=ask-bar` exercises the real component with synthetic replies and an explicit failure toggle.

### Current source ownership

Canonical Highway implementations now live in `packages/highway-react/src/components`, with shared helpers in `packages/highway-react/src/lib`; the compatibility imports in `packages/highway-compat` are explicit re-exports. Shared theme CSS lives in `packages/highway-styles/src/component-theme.css`. The family examples belong to `apps/showcase/previews` and build with the showcase. Attribution remains with the copied implementation. These are ownership moves, not new component designs or API replacements.
