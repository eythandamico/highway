# App Foundation design contract

Updated October 19, 2026 from Yardwork's reusable foundation. This contract replaces the original extraction notes. The starter is for building a new product: establish its audience, tasks and brand before replacing neutral screens. The owner selected Invariant's styling system across the unified component library. Yardwork supplies only the independent synthetic demo and its artwork.

## One owner per concern

| Concern | Owner | Contract |
| --- | --- | --- |
| Colors, space, radius, layers and motion | `packages/highway-styles/src/tokens.css` | One semantic scale, with light/dark pairs. |
| Typography | `packages/highway-styles/src/typography.css` | Named rem sizes, leading and weights; honor browser text size. |
| Button geometry and interaction | `packages/highway-styles/src/controls.css` | Button emits semantic classes; avoid competing utility sizes. |
| Fields, raised surfaces, menus, overlays, accessibility | `packages/highway-styles/src/foundation.css` | Shared rules work without any product stylesheet. |
| Primitive behavior | `packages/highway-react/src/components/ui` | Reuse Button, Input, Textarea, NativeSelect, Dialog and Sheet. |
| Forms and page compositions | `packages/highway-react/src/components/foundation/patterns.tsx` | Fields, FormDialog, Confirm, Modal, Heading, RowMeta, Empty, SearchField and view-choice buttons. |
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

Use the owner-approved Highway application scale: display 30/36 at 600; heading-xl 24/32 at 600; heading-lg 18/28 at 600; heading-md 16/24 at 600; body 14/20 at 400; body-sm 13/20 at 400; caption 12/16 at 400–500; micro 11/16 at 500. Values are pixel equivalents at a 16px root, implemented in rem. Body is the default for standard UI/navigation, body-sm is for dense tables/filters, caption is metadata, and micro is dense secondary labels only. Never use 12px as the primary-data default. Keep this scale on phones; editable inputs have a separate 1rem minimum. Use tabular numerals for changing values and locale-aware formatting for dates and money. Complete roles are available as `highway-type-{role}` classes or `data-highway-type` attributes. Brand font family without inventing another scale. See `docs/PACKAGES.md` for the installation contract.

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

`packages/highway-styles/src/tokens.css` owns Invariant's palette, shadows, geometry and motion. `packages/highway-styles/src/typography.css` owns its rem type scale with phone input minimums. `packages/invariant-ui/tokens/theme.css` contains compatibility aliases, not another palette. Both app and isolated preview import these same owners.

Import from `components/library` or individual modules. Button, Switch/Toggle, TextInput/Input and Textarea use the same production primitives. Compatibility wrappers preserve original Invariant prop names. Specialized Invariant components remain at their source locations; they consume the unified tokens and type scale. Use FormDialog for pending/error-protected forms. Legacy showcase URLs continue to work; the catalogue no longer splits by collection. `docs/INVARIANT-INTEGRATION.md` records provenance and limits.

Checkbox and RadioGroup also delegate to the shared Radix primitives. Their Invariant wrappers retain authored 24px shells and grow/shrink marks; labels, keyboard selection, disabled state and form behavior use the shared implementations.

## Glass material

Raised Foundation cards and `data-surface="raised"` retain the original glass wash, translucent fill, highlight rim, inset finish and bounded blur. Invariant controls and typography share the same system without flattening this material. Dark mode retains the original opaque material adaptation; reduced transparency uses opaque surfaces. Overlay content retains its opaque base for readability. `packages/highway-styles/src/tokens.css` owns the glass recipe.

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


## Control-family precision

Review `/components/family` or Storybook **Foundation / Control family** beside individual component examples. This surface uses canonical package components and belongs to the showcase, not the installable runtime.

- Shell geometry comes from `--control-radius` and `--control-height`. A shared `--control-inset` defines interior spacing; `--control-inner-radius` derives concentric corners. Slider shells use the control radius plus that inset, preserving their original 16px outer/12px inner treatment. Segmented shells retain 12px outer/8px inner corners.
- Standard actions and fields share 44px minimum heights. Segmented options retain compact authored padding and 36px icon-only geometry, grow with text, and wrap inside bounded containers. Their selected indicator tracks both position and size after wrapping or font changes. These are native pressed buttons, not ARIA tabs with invented panel semantics.
- Fields retain inset focus, while actions retain an external focus ring. Both use shared focus color/width tokens. Selection blue remains independent of brand and error colors.
- Pointer selection uses the existing travel/spring tokens. Keyboard selection and reduced-motion preferences bypass decorative travel. Hover-only treatments require a fine pointer; disabled controls never gain active hover treatment.
- Slider label/value layout grows for long content; numeric values use tabular figures. The original inset fill remains, tracking the value while retaining the original 8% minimum visual nub. A second pointer cannot steal or end an active drag.

Changes to these relationships belong in package CSS and primitives. Do not copy the review surface's layout CSS into host components or equate consistency with identical animation timing for every function.


## Surface-family precision

Review `/components/surfaces` or Storybook **Foundation / Surface family** alongside the control family. Both render package-owned implementations.

- Menus use the 16px panel radius with an 8px inset and an 8px concentric row radius. Plain, checkbox, radio and submenu rows use the 32px `--space-8` minimum and expand for wrapped labels. Checkmark gutters stay reserved; destructive meaning survives highlighting. Invariant menus own their row geometry and materials independently; do not impose native row minimums, opaque fills, or trigger-relative width on them.
- GlassCard keeps its wash, rim, blur and shadow recipe. Its content can shrink and wrap; footer actions wrap; header actions move below text on narrow screens. Invariant cards retain their opaque/gradient/video identity. Decorative SVGs are hidden from assistive technology. Video cards support pause/play and respect reduced-motion autoplay preferences.
- Dialogs and sheets retain opaque readable bases, their focus-management owner and scoped portals. Native close controls retain their targets; Invariant close/media controls retain their authored geometry and keyboard access. Legacy dialog/modal panels scroll within the viewport and action groups wrap. Bottom-sheet page transforms respect reduced motion and remain scoped to the caller's pageTarget.
- Accordion expansion preserves the existing choreography while observing changing content size. Closed panels are inert and hidden from accessibility navigation; triggers announce expanded state and reference their panel.
- Alerts use semantic status colors, guard repeated dismissal and cancel owned timers on unmount. A success alert is not proof of a host operation; the host still chooses when to render it.
- Remaining inherited motion durations are centralized without changing their values. Navigation, carousel, message shimmer, progress, skeleton and toast recipes retain distinct timings. Do not use one global speed for unrelated functions.

Static contract coverage and browser cases do not certify every possible composition. Keep the original artwork and specialty interactions; validate host-specific content, device behavior and side effects separately.

## Preserve component craft

Highway's canonical packages are the only implementation source for new work, the showcase, and consumers. Historical Invariant sources are a review reference, never a runtime dependency or alternate stylesheet.

Shared tokens describe materials, type roles, and motion recipes; they do not require every component to share a silhouette, minimum layout width, background, or timing. Keep authored geometry in each component's recipe. In particular, compact step dots must not acquire button-sized layout widths, and translucent menus must not inherit an opaque menu background.

Use `highway-weight-regular`, `highway-weight-medium`, or `highway-weight-semibold` when a component needs explicit emphasis within a type role. These opt-in utilities preserve the approved 400/500/600 scale. Do not depend on a layered font utility to override an unlayered complete type role.

Native action buttons retain their established target sizes. Compact Invariant controls and media/close controls retain their authored visible geometry; assess their actual hit area, spacing, keyboard support, and mobile use per component. Do not inflate all layouts with a shared minimum-width rule. Record any accessibility tradeoff instead of claiming that visual parity proves accessibility.

Before changing shared CSS, inspect every matching component and compare representative states visually, including open menus, translucent materials, active/pressed controls, long labels, and reduced motion. Functional passes alone do not establish visual fidelity. See [the restoration audit](INVARIANT-DETAIL-RESTORATION.md).

## One focus owner per control

The package supplies a low-priority base focus outline. A component may instead own a ring or delegate its input's focus indicator to its visible shell. Do not add a showcase-only focus stylesheet or force a second outline over those component styles.

- Controls with explicit Tailwind focus rings use `focus-visible:outline-hidden`: the transparent outline avoids a second normal-color indicator while remaining visible in forced-colors mode.
- Composite inputs such as SearchBar, SearchToggle, PromptBar, and AskBar draw focus around the visible input shell. Their inner text input does not draw another rectangle. Buttons inside the same shell retain their own indicators.
- Controls inside clipped surfaces use an inset indicator where needed, including ExpandCard triggers, SearchToggle buttons, AskBar buttons, and calendar days.
- Error color communicates invalid state, not focus. Keep keyboard focus identifiable in invalid controls. Do not remove focus styles globally to hide duplicates.
- Test real Tab navigation in light/dark and forced colors. Check the installed package and preview, not only authored class names.

### Button radius by size

Text and icon-only buttons use the same proportional radius: XS (32px high) uses `--radius-control-xs` (8px), small (36px) uses `--radius-control-sm` (10px), default (44px) uses `--radius-control` (12px), and large (48px) uses `--radius-control-lg` (14px). These are rem-based tokens. For nested surfaces, derive the inner radius from the outer radius minus the inset, including borders and padding, clamped at zero. Preserve intentional pill and circular geometry.
