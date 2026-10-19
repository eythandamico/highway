# Unified Invariant integration

The owner selected Invariant as the styling system for the entire Foundation library. The single catalogue combines application patterns and Invariant components. Compatibility links for `inv-button` and `inv-toggle` resolve to the canonical Button and Switch. All 50 original preview scenarios remain available.

- `app/tokens.css`: canonical Invariant light/dark palette, layered shadows, radii and motion.
- `app/typography.css`: Invariant scale in rem with readable phone inputs.
- `packages/invariant-ui/tokens/theme.css`: aliases and type classes only.
- `components/library/index.ts`: unified public import surface.
- Original Button and Toggle APIs delegate to shared Button/Switch. TextInput and Textarea compose the shared fields, retaining labels/errors and auto-grow.
- Preview documents load the same styling owners. Isolation contains viewport-sized demonstrations; it does not define a separate theme.
- Original upstream repositories remain untouched. All state stays demo-only, with no Yardwork backend or account dependency.

The notes below record provenance and retained integration details.

## Source provenance

The owner requested the original Invariant component collection and its engineering quality on October 19, 2026. All 50 registry entries were copied from the local Invariant project into `packages/invariant-ui`. The upstream repository and its deployment were not modified. The MIT license is retained alongside the code.

## Use

Import components directly from `@/packages/invariant-ui/components/<name>.jsx`. Their `--inv-*` theme and Tailwind classes are included by `app/globals.css`. Wrap compositions in `inv-scope` for reduced-motion and phone input rules. Components use their original APIs (for example, Invariant Button uses `label`, whereas Foundation Button uses children). Read the per-component docs before composing them. Keep Foundation's validated form and authorization patterns for domain operations.

`/showcase?component=inv-segmented-control` exposes all 50 components, original interactive examples, source paths, copyable usage, and component references. `/guide#invariant` explains setup and reuse. Foundation patterns and Invariant components appear together; the Yardwork demo remains available.

## Preview architecture

The preview is built from the same component source with Vite into ignored `public/invariant-preview`. `npm run build:invariant` rebuilds it during development; `npm run dev` and `npm run build` include this step. A same-origin iframe contains each preview so fixed navigation, portaled overlays, original typography, and sheet transforms retain their expected document geometry. This is not a second component implementation. Preview state resets when switching components or themes. The full-preview link opens a larger stage.

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

`components/ui/ask-bar.tsx` extracts the original Yardwork glass composer without its orb. It is exported as `AskBar` from `components/library`; the demo's `ask-launcher.tsx` is now a context adapter around that same component. The shared composer has no Yardwork context, transport, AI, or voice dependency. Its material consumes the canonical `--panel-*` tokens and its original capsule motion consumes `--ask-*` tokens.

Supply `onSend(text)` and an append-only `messages` array (`id`, `role`, `text`) for reply previews. Reject the callback on failure to preserve drafts; resolve only after the operation is accepted. Empty submissions and immediate duplicate submissions are blocked. `label`, `placeholder`, `disabled`, `hidden`, `floating`, `compactOnScroll`, and `onOpen` configure embedding. Inline is the default; floating placement requires content clearance, with bottom-navigation offsets owned by the consuming page. The showcase at `/showcase?component=ask-bar` exercises the real component with synthetic replies and an explicit failure toggle.
