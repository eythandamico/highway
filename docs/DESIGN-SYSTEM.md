# App Foundation design contract

Updated October 19, 2026 from Yardwork's reusable foundation. This contract replaces the original extraction notes. The starter is for building a new product: establish its audience, tasks and brand before replacing neutral screens. The owner selected Invariant's styling system across the unified component library. Yardwork supplies only the independent synthetic demo and its artwork.

## One owner per concern

| Concern | Owner | Contract |
| --- | --- | --- |
| Colors, space, radius, layers and motion | `app/tokens.css` | One semantic scale, with light/dark pairs. |
| Typography | `app/typography.css` | Named rem sizes, leading and weights; honor browser text size. |
| Button geometry and interaction | `app/controls.css` | Button emits semantic classes; avoid competing utility sizes. |
| Fields, raised surfaces, menus, overlays, accessibility | `app/foundation.css` | Shared rules work without any product stylesheet. |
| Primitive behavior | `components/ui` | Reuse Button, Input, Textarea, NativeSelect, Dialog and Sheet. |
| Forms and page compositions | `components/foundation/patterns.tsx` | Fields, FormDialog, Confirm, Modal, Heading, RowMeta, Empty, SearchField and view-choice buttons. |
| Status and recovery | `feedback.tsx`, `status.tsx`, `section-boundary.tsx` | Explicit labeled states; retain data on refresh failure. |
| App arrangement | `app/globals.css` and feature CSS | Layout only; fix shared materials in their owning layer. |
| Scoped branding | `lib/design/appearance-style.ts`, `ThemeScope` | Validate colors, keep readable action text and carry tokens through portals. |
| Optional visual effects | `components/visual`, `docs/VISUAL-EFFECTS.md` | Bounded progressive blur, edge fades, scrims, gradients and avatars. |

Fix cascade conflicts at the owner. Do not append competing recipes or broad `!important` overrides. Print, browser scrollbar compensation and accessibility preferences have narrowly scoped exceptions. Decorative syntax/visual-effect palettes are owned by their modules; product screens must not grow a second palette.

## Palette and surfaces

Default action: Invariant ink on a warm near-white canvas. Neutral white fields, concentric rounded corners, hairline rims and layered shadows. The blue Invariant accent indicates focus and selection. Brand colors are separate from success, warning, error and information tokens. Text must communicate status without relying on color. Dark mode uses semantic dark surfaces; never invert artwork.

| Surface | Usage |
| --- | --- |
| Field | White fill, subtle hairline shadow, visible keyboard focus and invalid feedback. |
| Raised | Card or `data-surface="raised"`; shared wash, rim and soft shadow. Do not turn every grouping into a card. |
| Menu | Opaque popover, warm edge and shadow; content behind it must not compete. |
| Dialog/sheet | Opaque card base; bounded viewport scrolling, safe-area padding and focus restoration. |

Raised hover changes the shadow without moving layout. Selection, hover and focus remain distinguishable. Reduced transparency uses opaque raised surfaces and removes backdrop blur. Preserve the original progressive-blur masks and prefixed filters when optimizing CSS.

## Type, rhythm and targets

Use Invariant caption 11, secondary 13, body 15, subheading 18, title 24, heading 32 and display 64 through rem tokens. At phone widths, metadata becomes 14 and secondary text 16. Inputs remain at least 16px at the default root size. Weights are 400/500/600. Use tabular numerals for changing values and locale-aware formatting for dates and money.

Use the four-pixel spacing rhythm and intentional two-pixel half step. Radii are control, panel, dialog and pill. Ordinary buttons, including small/icon variants, have at least 44×44px targets. `size="inline"` is the deliberate inline-link exception; give it surrounding space. Glyphs remain 16–24px. Let long labels wrap; never force user text into a fixed height.

## Composition and state

Headers wrap actions without clipping titles. RowMeta aligns values, statuses and actions to a common trailing edge. Forms own labels, stable IDs, hints, constraints and errors. FormDialog guards duplicate submissions, disables fields/dismissal during save, focuses failures and retains drafts. Its `initial` values are read on mount; key or remount the dialog when switching records. Confirmation requires explicit domain wording; the destructive button variant is styling, not authorization or a transaction.

Use `Modal sidebar={...}` for related record context: separate desktop scroll columns, a single stacked scroll view below 1000px, and no sidebar in print. The title receives initial focus. Keep actual record actions in the main column.

Distinguish initial loading, refresh with retained data, empty, no results, permission denial and failure. Only show saved/sent/paid after the corresponding server or provider confirmation. Demo fixtures must say they are examples.

## ThemeScope

`appearanceStyle(accent)` accepts a six-digit opaque hex color, falls back to the default and selects readable foreground text. Apply its result to the DOM container **and** supply it to ThemeScope; context alone does not style normal descendants. Nested scopes merge tokens. Dialog, Sheet, Select, DropdownMenu, Popover, AlertDialog, ContextMenu, HoverCard and Tooltip content consume the context across their portals. Other optional portal libraries need an explicit adapter before promising scoped branding. Global light/dark mode belongs on the document root.

```tsx
const tokens = appearanceStyle(accent);
<ThemeScope tokens={tokens}>
  <section style={tokens}>{children}</section>
</ThemeScope>
```

Keep status and focus colors independent of customizable action colors. This helper provides visual overrides only; saving workspace preferences still needs server authorization and validation. Recheck all affected contrast pairs when changing the global palette.

## Motion and continuity

Use fast/normal timing for feedback, shorter overlay exits, and transform/opacity for spatial motion. Keep keyboard highlighting immediate. Reduced motion disables transitions. `preloadOnce` shares an import promise between intent warmup and rendering and retries failed imports. Warm on intent only when useful, respect data-saving connections for idle preloads, and keep large features outside the shell. SectionBoundary contains a failed lazy feature without removing navigation.

If adding page memory, scope it to origin, signed-in account and workspace; clear private caches on signout/access removal. Never store private mutable state at module scope during SSR. Do not implicitly restore open dialogs, pending actions or drafts.

## Review and guardrails

Open `/components/foundation` or Storybook's `Foundation/Quality lab`; `/components/effects` retains the effects guide. Stories render the real components, not gallery-only replicas. Review default, hover, focus, selected, disabled, pending, failed, empty and long-content states. Use light/dark and 100%/200% text controls, narrow/wide layouts, keyboard and reduced motion.

Run `npm run check:ui` for static guards and builds; `npm run test:ui` for browser behavior, or `npm run check:ui:full` for both. Install Chromium once with `npx playwright install chromium`. Static checks do not establish browser correctness, geometry checks are not screenshot baselines, and desktop emulation does not establish real-device or assistive-technology compatibility. See VALIDATION.md for actual results.

## Nested overlay compatibility

`components/ui/portal-container.tsx` carries the nearest Dialog/Sheet content container. Nested Select and Popover content mount within that boundary so the outer focus trap permits keyboard and calendar interaction; outside an overlay, they retain body portals. Keep caller refs and focus restoration intact when extending these primitives.

`@radix-ui/react-dismissable-layer` is pinned directly to `1.1.19` so the shared Radix Dialog/Select/Popover stack resolves one physical instance and coordinates outside-click/Escape dismissal. A separate compatible dependency stack may exist for cmdk. Preserve the lockfile; dependency updates must verify that one Escape closes only the top menu/calendar, the next closes the dialog, and focus returns correctly. Do not disable the outer focus trap to hide a duplicated-context bug.

## One library, Invariant styling

`app/tokens.css` owns Invariant's palette, shadows, geometry and motion. `app/typography.css` owns its rem type scale with phone input minimums. `packages/invariant-ui/tokens/theme.css` contains compatibility aliases, not another palette. Both app and isolated preview import these same owners.

Import from `components/library` or individual modules. Button, Switch/Toggle, TextInput/Input and Textarea use the same production primitives. Compatibility wrappers preserve original Invariant prop names. Specialized Invariant components remain at their source locations; they consume the unified tokens and type scale. Use FormDialog for pending/error-protected forms. Legacy showcase URLs continue to work; the catalogue no longer splits by collection. `docs/INVARIANT-INTEGRATION.md` records provenance and limits.

Checkbox and RadioGroup also delegate to the shared Radix primitives. Their Invariant selection artwork sits inside 44px targets; labels, keyboard selection, disabled state and form behavior use the shared implementations.

## Glass material

Raised Foundation cards and `data-surface="raised"` retain the original glass wash, translucent fill, highlight rim, inset finish and bounded blur. Invariant controls and typography share the same system without flattening this material. Dark mode retains the original opaque material adaptation; reduced transparency uses opaque surfaces. Overlay content retains its opaque base for readability. `app/tokens.css` owns the glass recipe.
