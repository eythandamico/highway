# Surface-family precision

Local Highway 0.3.0 React/styles candidate, October 28, 2026. No publication or deployment is implied.

## Scope and changes

| Family | Refinement | Preserved |
| --- | --- | --- |
| Menus | Shared shell/inset/row geometry across plain, checkbox/radio and submenu rows; full targets, long-content wrapping and destructive highlighting | Existing materials, anchored positioning and Radix behavior |
| Legacy menus/navigation | Disabled actions, roving keyboard navigation, hidden-layer inertness, Escape/Tab focus return | Bottom navigation artwork and distinct morphing choreography |
| Cards/surfaces | Bounded content, wrapping footers, responsive header actions, full media-control targets | Glass wash/rim/blur/shadow, opaque and gradient artwork |
| Dialogs/sheets | Viewport-bounded legacy panels, wrapping actions, full close targets and described dialogs | Opaque readable bases, focus traps, nested portals and host save behavior |
| Expansion | Dynamic height observation, expanded/controls semantics and inert closed content | Original expansion timing and visual treatment |
| Feedback | Semantic alert colors, single dismissal and unmount cleanup | Host ownership of success/failure; original feedback layouts |
| Media/gestures | Explicit video Play/Pause, reduced-motion autoplay handling, bottom-sheet reduced-motion page treatment and pointer ownership | Explicit playback, mute and the normal-motion gesture recipe |
| Specialty motion | Literal duration values moved to shared tokens across navigation, carousel, messages, inputs, progress, skeleton, spotlight, steps and toasts | Exact inherited duration values and distinct easing curves |

The core controls were refined in the preceding pass. Data and visual-effect components continue to use their established shared type, tokens and contracts; no broad replacement of artwork, table logic or effects was introduced. Helpers and infrastructure remain outside the visual change. This is not a claim that every combination of all public exports has been visually certified.

## Review surfaces

- `/components/surfaces` and Storybook **Foundation / Surface family** render the canonical components.
- `/components/family` remains the core-control reference.
- The package catalog/declarations and MCP snapshot describe installed APIs. Card and MenuItem now have explicit optional-prop declarations; unsupported BottomNav props are not advertised.

Light/dark surfaces and the open shared dialog were reviewed in the running browser. Saved browser-test captures provide narrow/overlay evidence in `artifacts/validation-screenshots/surface-*.png`; the narrow confirmation dialog was also visually reviewed.

## Validation

- Initial typecheck, lint and Storybook build passed.
- Focused surface suite passed: six active cases and 14 project-applicability skips across desktop, phone, 320px and reduced-motion projects. Assertions cover menu disabled/roving/first-letter navigation, all menu-row target geometry, nested dismissal, card long content, accordion/step behavior, overlay bounds, hidden navigation layers, alert single-dismiss/unmount cleanup, and reduced-motion video controls.

- `systems:update` and `verify` passed: 111 component contracts, 101 declaration modules, four systems tests and 79 showcase entries; 68 inherited style exceptions remain inventoried.
- `check:ui:full` passed typecheck, lint, design/contrast guards, starter and Storybook builds, and browser checks: 40 passed, 32 project-applicability skips.
- `check:packages:clean` passed fresh-tarball validation, strict consumer types/builds, React SSR smoke, and packaged browser checks: 36 passed, 60 viewport-applicability skips. SSR smoke is not full Next.js integration coverage.
- `check:mcp` passed all eight tests. MCP tarball and the 0.3.0 release manifest were regenerated; consumer lockfiles were refreshed.
- These checks validate local release candidates. No packages were published and no remote application was deployed.

## Host review

Larger menu rows, step targets and close controls can increase dense layout dimensions; inspect those compositions in the receiving project. Video autoplay changes under reduced motion are intentional. Legacy standalone Menu does not own opening/closing. No component supplies backend operations or promises host-level correctness.

Physical-device gestures, browser-specific media policies and assistive-technology sessions remain outside this automated run. The quality inventory retains 68 precise inherited style exceptions; the migration does not claim zero design debt.
