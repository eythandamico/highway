# Component-family refinement

October 28, 2026. Local work only; not published or deployed.

## Scope and review boundary

The goal is a coherent Highway family: consistent proportions, icon alignment, surface hierarchy, typography, motion, and functional states. Preserve Highway’s glass materials and approved type scale.

Compatible fixes may be applied in this pass. Default density changes, API migrations, replacement of artwork/materials, and substantial component redesigns are proposals for owner review. Functional tests are necessary but do not establish visual quality by themselves.

The session permits four active agents, including the coordinator. Fifteen assignments are grouped across three specialists; this is not fifteen simultaneous agents.

## Assignments

| # | Area | Owner |
| --- | --- | --- |
| 1 | Buttons and actions | Control specialist |
| 2 | Text and numeric fields | Control specialist |
| 3 | Selection controls | Control specialist |
| 4 | Icons and optical alignment | Control specialist |
| 5 | Control motion and states | Control specialist |
| 6 | Cards and materials | Surface specialist |
| 7 | Menus and popovers | Surface specialist |
| 8 | Dialogs and sheets | Surface specialist |
| 9 | Feedback and status | Surface specialist |
| 10 | Layout, navigation, and Invariant compatibility | Surface specialist |
| 11 | Keyboard and focus | Validation specialist |
| 12 | Responsive layout and typography | Validation specialist |
| 13 | Motion and reduced motion | Validation specialist |
| 14 | Installed package parity | Validation specialist |
| 15 | Showcase, docs, and MCP parity | Validation specialist |

## Applied refinements

- **Checkbox primitive:** mixed state uses a minus; checked state uses a check. This includes the Table’s partially selected “Select all” control. Existing size and motion remain; the public Invariant Checkbox API stays boolean-only.
- **ChoicePicker:** selection marks reserve space so long labels do not rewrap on selection. Disabled options use the shared opacity and cursor.
- **SplitButton:** the alternatives trigger uses the standard 44 × 44 icon-button geometry.
- **Menus:** Dropdown separators expose their semantic role. BottomNav menus support arrow keys, Home, and End, skipping disabled items. Destructive actions retain their error color on hover.
- **Modal:** long titles wrap while the close control keeps its size.
- **Toast:** narrow screens constrain its width; reduced-motion preferences remove animated blur, scale, and transitions.
- **PageSection:** content can shrink inside flex and grid layouts without forcing overflow.

These changes live in canonical package sources. No public API migration, default density change, or replacement of Highway’s glass materials was introduced.

**Package parity finding:** the source Card used the correct 16px radius, while an outdated installed archive lacked the card override and fell back to a 14px utility. Rebuilding and reinstalling the current package is the correction; changing the design token would mask the stale artifact.

## Proposed major changes — not applied

| Proposal | Current behavior | Review decision |
| --- | --- | --- |
| Optional compact density | Ordinary controls keep a 44px minimum target. | Decide whether an opt-in desktop density is useful; preserve accessible defaults. |
| Content-driven Card heights | Some Invariant gradient, video, and subdued variants enforce a 420px minimum. | Decide whether height should follow content or remain an explicit showcase/artwork treatment. |
| BottomNav indicator measurement | Indicator positioning assumes 48px items and uses a snapshot width measurement. | Review a measured indicator that follows actual item geometry and resizes without drift. |
| BottomNav asynchronous submission | Draft text clears immediately after submission. | Define pending, failure, and retry behavior before changing the host callback contract. |

None of these proposals was applied. They affect layout expectations or interaction contracts and should be reviewed together.

## Validation

### UI and behavior

- Typecheck and lint passed on the frozen source before the final docs-snippet and spacing-token guard fixes. The first `check:ui:full` attempt stopped at the design guard, which found two raw brand-color literals in the scoped-theme example and a literal sidebar indent. After those fixes, `check:design` passed (252 application/shared components, 32 stylesheets, contrast check), `build:starter` passed, `build-storybook` passed, and `test:ui` passed with 55 tests and 77 project-guard skips. The Storybook build emitted its existing large-chunk advisory.
- Focused family regressions passed: Dropdown keyboard navigation and destructive hover (desktop); BottomNav Home/End and Escape focus return (phone); Toast immediate dismissal and no blur under reduced motion; Modal close target and PageSection overflow at 320px. The BottomNav test scrolls its nested preview into view. Modal geometry is sampled after the entrance scale settles; its close target remains at least 44px.
- The clean-package consumer first exposed an invalid test fixture that passed `"indeterminate"` to the public legacy boolean Checkbox wrapper. The fixture now reaches the canonical Checkbox primitive through the public Table Select All mixed-selection state. Fresh package archives passed typecheck, full/minimal production builds, package validation, production dependency audit, and React SSR smoke. Its 120-test browser run had 43 pass, 74 guard skips, and 3 failures; after fixing theme-transition sampling and making the long-label keyboard target exact, all three failed cases passed in a targeted rerun (Button/Card source parity on desktop; MultiSelect on desktop and phone). The mixed Checkbox and installed agent-tools tests passed in the original clean run. No complete 120-case rerun was needed because package runtime sources did not change.
- `check:systems` verified 114 contracts and 102 declaration modules; the quality guard accepted its 68 inventoried legacy style exceptions. `test:systems` passed all 4 tests. `check:mcp` rebuilt the snapshot with 114 exports and 78 declarations and passed all 8 tests, including isolated tarball startup and snapshot/catalog parity.

### Installed parity evidence

- Source and freshly packed consumer Button/Card computed styles match in light and dark modes at desktop and 390px widths. Card radius is 16px in all four combinations. The initial source/consumer snapshot captured during a theme transition; the regression now polls for matching, stable computed styles before comparison.
- Screenshots are saved in `artifacts/validation-screenshots/package-parity-{button,card}-{source,consumer}-{desktop-light,desktop-dark,narrow-light,narrow-dark}.png`.
- Fresh package tarballs and the release manifest were refreshed. MCP data and archive were rebuilt and packed after the passing MCP checks.

Phone behavior was checked through Playwright viewport emulation, not on a physical handset. Voice capture tests used browser media mocks and did not request a real microphone.
