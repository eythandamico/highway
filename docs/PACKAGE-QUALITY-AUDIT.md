# Package quality audit and remediation — October 21, 2026

> Historical report: versions, paths, and commands below record the audit at that time. For current installation use [PACKAGES.md](PACKAGES.md); for current checks use [SYSTEMS.md](SYSTEMS.md). Do not use historical commands as installation instructions.

Scope: the installable `@highway/react` and `@highway/styles` packages, for adoption into an existing application. This is an audit, not a redesign or a certification of every export. Existing uncommitted cleanup work was preserved. The original review below records the pre-fix baseline. The owner subsequently authorized remediation; current results are recorded above that baseline. No deployment or registry publication is included.

## Remediation — Highway 0.2.2

All **4 P1 and 5 P2 findings** have been addressed in the canonical package sources, preserving the approved visual design and eight-role typography scale. The original findings and score below remain a historical baseline, not a current score or a whole-library certification.

| Finding | Resolution | Regression evidence |
| --- | --- | --- |
| P1: BottomSheet host mutation | Removed implicit `#root` targeting and body background changes. Added explicit `pageTarget`; restores owned inline declarations, longhands and priorities. Shared focus/scroll locks support nested specialized dialogs. | Default host isolation, explicit target restoration on close and unmount, nested close retaining the body lock; custom corner radius and overflow axis retained. |
| P1: Invisible menu actions | Closed Dropdown, ProfileMenu and WorkspaceSwitcher menus are inert and hidden from the accessibility tree. Shared keyboard navigation, dismissal and trigger focus restoration. | Closed actions skipped by Tab; arrows/Home/End, Escape, Tab dismissal, reopening and empty-menu dismissal. |
| P1: NumberInput keyboard activation | Native click activation supports Enter/Space; pointer hold repeats without a release double-step. Labelled stepper group and numeric status; owned timers stop on disable/unmount. | Click/Enter/Space single changes, hold/release, disabling while held, and unmount cancellation. |
| P1: Mouse-only range controls | SliderInput uses slider semantics and pointer capture; SplitPane uses a focusable separator. Both support keyboard and touch. | Arrow/Home/End adjustments, range/separator attributes, touch slider and splitter gestures. |
| P2: Slider arithmetic and drag cleanup | Min-relative, decimal-safe snapping. No body cursor/selection writes. Slider retains its quick-click spring and clears the delayed drag timer on cancellation/unmount. | `min=3, step=5` midpoint emits 8; decimal increments; pointer cancellation and host styles; quick click versus sustained drag. |
| P2: Tabs IDs and indicator | View-button group with `aria-pressed`; safe element lookup. Fractional measurements after resize delivery, border-box observation and font-load updates keep the underline aligned. | Quoted IDs, selected state, and alignment at 150% root type size in normal/reduced-motion modes. |
| P2: Progress correctness/motion | Normalized percentage display and progressbar semantics. Live reduced-motion preference bypasses the JavaScript counter and shimmer; Skeleton shares the same preference hook. | `5/10` exposes/displays 50%; reduced-motion final value renders even when animation-frame callbacks never execute. |
| P2: Type declarations | Explicit exported prop interfaces for the ten audited APIs; runtime-optional props stay optional and callbacks/options have concrete types. | Strict installed-consumer valid usages and expected-invalid callback/option cases, including Select. Other legacy JS exports may still have inferred declarations. |
| P2: Unused calendar output | Safe purity annotations allow the consumer bundler to remove unused lazy/context/ref factories; removed the import-time Skeleton media query. | A mandatory Button + HighwayTheme production build rejects retained calendar/date-picker output. |

The 2px scaled-text drift found during remediation was caused by rem-based gaps settling after ResizeObserver delivery. Deferring measurement to the next frame fixes that timing issue; the alignment assertion remains within 0.5px. No broad test exemptions or runtime styling overrides were added.

### Distribution and validation

Matched local artifacts: `artifacts/highway-react-0.2.2.tgz` and `artifacts/highway-styles-0.2.2.tgz`. Installation/API guidance and the showcase descriptions reflect the new contracts. No GitHub push, Cloudflare deployment, or registry publication is included.

- Full UI gate: typecheck, lint, design/contrast guards, starter build, Storybook build, and browser checks passed (28 passed, 8 conditional skips). Lint has 0 errors and 18 pre-existing warnings.
- Fresh installed-package gate passed: regenerated tarballs, catalog/archive validation, external strict TypeScript consumer, production build, SSR smoke, and browser checks (20 passed, 37 conditional project skips).
- Independent application boundaries passed: 91 showcase modules and 92 demo modules have no Cloudflare/auth backend dependency.
- Targeted checks include keyboard, real browser touch events, nested focus/scroll locks, held-input cleanup, custom ranges, typography scaling, and JavaScript reduced motion.
- Visible review confirmed the original slider shell and keyboard focus treatment in the local showcase.

Bundle measurements are whole production consumers, including React and dependencies, not incremental Highway overhead. The same-entry historical comparison is optional when old tarballs are unavailable; rejecting calendar output in the current minimal build is mandatory. The original full-fixture measurement below predates the added analytics Table fixture, so it is not an apples-to-apples comparison with the current full fixture.

| Production consumer | JavaScript raw / gzip | CSS raw / gzip |
| --- | --- | --- |
| Button + HighwayTheme, 0.2.2 | 225,181 / 70,486 bytes | 143,724 / 22,683 bytes |
| Full installed fixture, 0.2.2 | 461,072 / 142,466 bytes | 144,607 / 22,911 bytes |

The same minimal entry built against 0.2.1 retained the calendar graph; 0.2.2 excludes it. These are emitted asset totals, not measured initial downloads or runtime frame timings.

Physical-device keyboards, real assistive-technology testing, real-device frame timings, React 18 and non-React component execution remain unverified. This remediation closes the nine recorded findings; it does not certify every possible host application or every library export.

## Original audit verdict (before 0.2.2 fixes)

The intentional Invariant styling, glass materials, and shared component ownership are worth preserving. There is no reason to replace their appearance. However, the library has uneven behavioral quality: passing representative installation tests does not make every specialized control production-ready. Resolve the P1 findings before broad adoption.

Provisional code-review health score: **13/20**. This is a prioritization rubric, not a WCAG conformance or performance certification.

| Dimension | Score | Evidence and limitation |
| --- | --- | --- |
| Accessibility | 1/4 | Specialized controls have keyboard and hidden-focus failures; shared form primitives are substantially stronger. |
| Performance | 3/4 | ESM, side-effect metadata, bounded effects, and optional CSS entries; some specialized indicators animate layout properties. No real-device frame-time measurement. |
| Responsive behavior | 2/4 | Shared mobile rules exist, but slider/split-pane interaction is mouse-only. |
| Theming | 3/4 | Canonical semantic tokens and scoped portals; some specialized artwork and error treatments still use literal colors. |
| Design anti-patterns | 4/4 | The approved glass, geometry, and material system are deliberate. This audit does not classify the user's chosen aesthetic as a defect. |

## Original findings

### P1 — BottomSheet mutates the host application outside HighwayTheme

`packages/highway-react/src/invariant/components/bottom-sheet.jsx:57` looks up the global `#root` and rewrites its transform, filter, radius, height, overflow, and transition. It also changes the body background. Cleanup clears properties instead of restoring their prior values. In a typical Vite application this can alter the entire host UI, including content outside the themed subtree, and discard its existing inline styles. Make page transformation an explicit opt-in target owned by the caller; preserve and restore prior styles and coordinate scroll locking. The existing isolated-host test does not exercise BottomSheet. Suggested follow-up: `/harden`.

### P1 — Closed menus remain keyboard-interactive

`packages/highway-react/src/invariant/components/dropdown.jsx:47`, `profile-menu.jsx`, and `workspace-switcher.jsx` hide menus using opacity and pointer events through `lib/popover.js`. They do not remove closed actions from keyboard navigation or the accessibility tree. A keyboard user can encounter invisible actions. Use inert/hidden state consistent with exit motion, implement menu keyboard behavior, and restore focus on dismissal. Suggested follow-up: `/harden`.

### P1 — NumberInput ignores keyboard activation

`packages/highway-react/src/invariant/components/number-input.jsx:94` attaches the action to `onMouseDown`, with no click activation. Native Enter/Space activation therefore does not invoke the increment/decrement action. The displayed label also lacks an association to a value control. Implement click activation plus pointer hold without double stepping, label/value semantics, and cleanup when disabled or unmounted. Suggested follow-up: `/harden`.

### P1 — SliderInput and SplitPane are mouse-only

`packages/highway-react/src/invariant/components/slider-input.jsx:77` and `split-pane.jsx` expose draggable divs with mouse listeners but no keyboard model, focusability, range/separator semantics, or touch pointer handling. Users who cannot drag a mouse cannot operate them. Preserve the visual shell while using accessible range/separator behavior and pointer capture. Suggested follow-up: `/harden`.

### P2 — Slider arithmetic and drag cleanup can affect host behavior

`slider-input.jsx:31` rounds against zero instead of `min`; for `min=3, step=5`, the implementation can emit values outside the expected 3, 8, 13… sequence. Its effect cleanup removes listeners but does not restore the previous body text-selection style or clear the delayed drag timer. SplitPane has the same body-style restoration issue for selection/cursor. Restore the exact previous values during cancellation/unmount and use min-relative step arithmetic with decimal-safe handling. Suggested follow-up: `/harden`.

### P2 — Tabs does not expose selection and uses unsafe selector interpolation

`packages/highway-react/src/invariant/components/tabs.jsx:17` interpolates arbitrary tab IDs into a CSS selector. Quote-containing IDs can throw. Buttons expose no selected/pressed state; the component needs a documented choice between a view-button group and a complete tab/panel pattern. Indicator measurement only runs on active-tab change, so font, content, or container resizing can leave it stale. Use element references or direct dataset comparisons, appropriate selection semantics, and resize observation. Suggested follow-up: `/harden`.

### P2 — Progress mislabels non-default ranges and ignores reduced motion in JavaScript

`packages/highway-react/src/invariant/components/progress.jsx` computes fill from `value/max` but renders the raw value followed by `%`. With `value=5, max=10`, the fill is 50% and the label is 5%. It has no progressbar semantics, and its requestAnimationFrame counter does not consult reduced motion; CSS cannot stop that JavaScript loop. Render the normalized percentage or explicitly label raw units, expose progress semantics, and bypass the counter under reduced motion. Suggested follow-up: `/harden` and `/animate`.

### P2 — Specialized TypeScript declarations are permissive and sometimes incorrectly required

Generated `NumberInput` declarations require `min`, `max`, and `error` even though runtime usage treats them as optional. Callback and option types in several JavaScript-origin components are `any`. A consumer can face spurious errors while genuine integration mistakes go undetected. Add explicit public prop types/JSDoc and compile valid minimal usages plus expected-invalid cases. Preserve the existing component APIs. Suggested follow-up: `/harden`.

### P2 — Minimal imports retain unnecessary build output

A temporary production consumer importing only Button and HighwayTheme still emitted a 71.72 kB calendar chunk (21.08 kB gzip). The bundled public entry contains the DateInput module's top-level `lazy()` call even when that component is unused. Review preservation of module boundaries, safe purity annotations, and explicit subpath exports; prove unused controls disappear with a minimal-consumer build. Emission does not mean this lazy chunk is downloaded on initial load. Suggested follow-up: `/optimize`.

## Strengths to retain

- Core source ownership excludes application infrastructure and demo data.
- Styles-only consumption is available without React; React is a peer dependency.
- Shared form dialogs guard duplicate submission, retain failed drafts, and focus error feedback.
- ThemeScope and HighwayTheme carry branding through supported portals.
- Shared CSS provides reduced-motion, forced-colors, and reduced-transparency accommodations.
- Installation checks compare installed bytes against freshly built tarballs rather than trusting a same-version cache.

## Original audit validation

- `check:packages:clean`: passed fresh tarball installation, strict consumer TypeScript, production build, SSR, and 8 applicable browser checks (16 conditional matrix skips).
- Root TypeScript: passed.
- Lint: 0 errors, 18 existing warnings.
- Design/token contrast and independent application boundary checks: passed.
- These gates cover representative paths, not every public component. The findings above come from additional canonical-source review; browser reproduction evidence is recorded separately when available.

Targeted browser reproduction against freshly installed tarballs confirmed:

- SliderInput with min 3/max 13/step 5 emitted 10 at the midpoint instead of 8; no slider role or tab stop exists.
- NumberInput remained at 5 after Enter and Space on Increase.
- Tab reached a closed Dropdown action while its menu had opacity 0; Enter invoked the invisible action.
- BottomSheet overwrote preset root transform/filter/height/overflow and body background, then cleared the original inline values on close.
- Progress with value 5/max 10 displayed `5%` with a 50% fill and no progressbar role.

Measured production fixture output (decimal kB): full example main JS 331.94 / 107.21 gzip, calendar chunk 71.72 / 21.08 gzip, CSS 140.19 / 22.06 gzip. Button-plus-theme main JS was 312.98 / 100.85 gzip, with the same calendar and CSS output. These are whole consumer bundles including React and shared dependencies, **not** incremental Highway overhead in an existing application. No runtime performance or network-transfer guarantee is inferred from bundle sizes.

## Original release recommendation

The review identifies **4 P1 findings and 5 P2 findings**, with no P0 or P3 findings recorded. First `/harden` the host-isolation and interaction issues and the concrete correctness/type gaps, then `/optimize` unused build output and `/animate` the JavaScript reduced-motion behavior, and finish with `/polish`. Keep the original visual design. Re-run the installed-consumer audit after fixes, including keyboard, touch, dismissal, drag cancellation, custom ranges, and minimal TypeScript usage.

React 19.2+ is the declared compatibility range. React 18, other UI frameworks, and a full Next.js application are not certified by the Vite/SSR smoke. Real assistive-technology and physical-device testing remain outstanding. Changes distributed after an earlier tarball should receive a new matched package version.

References: [WAI keyboard interface guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), [slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), and [tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). APG is implementation guidance; the scores above are not a formal conformance assessment.
