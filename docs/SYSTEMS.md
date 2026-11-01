# Highway engineering systems

Highway's craft is part of its contract. Preserve the actual glass, typography, geometry, choreography and event semantics when consolidating code. Shared systems make those decisions repeatable; passing automation alone does not establish visual quality.

## Ownership and contracts

- `catalog/components.json` owns public availability, selection guidance and each export's family/motion/material mapping.
- `catalog/standards.json` owns review states and behavior requirements. Requirements are not evidence that every component is certified.
- `packages/highway-styles/src/tokens.css` owns timing, easing, colors and geometry. Distinct named motion recipes live in `packages/highway-react/src/lib/motion.js`.
- `catalog/api-report.json` records generated declaration signatures. Changes must be reviewed; never accept the baseline just to make CI green.
- `examples/contracts` contains executable TypeScript usage examples. The generator and MCP consume their original files, not hand-copied snippets.
- `docs/COMPONENT-CONTRACTS.md` is generated from catalog metadata. The showcase and MCP consume the same component contracts.

## Motion without flattening the design

Use press, overlay, selection, slider and expansion recipes for their specific interactions. Tabs retain their 300ms emphasized curve; SliderInput retains its 250ms spring and 80ms quick-click threshold; ExpandCard keeps 350ms height, delayed 250ms content entrance and 150ms exit. Do not globally shorten deliberate sheet or toast choreography to match a button.

Keyboard selection and dragging track directly. Reduced motion removes transitions from migrated controls. CSS transitions retarget naturally during rapid reversals. Measurements use observers with cleanup; every owned timeout, frame, listener and subscription needs teardown. Portals retain their focus/layering owner. Never hide an accessibility defect by disabling an outer focus trap.

`inherited-specialty` identifies retained behavior requiring individual review before conversion. New specialty motion must document its communication purpose, trigger, interruption behavior, accessibility alternative and performance evidence. Existing recipe timings are a reference, not a universal speed limit.

## Styling and exceptions

Brand through semantic tokens; preserve the eight-role type scale and weights400/500/600. Glass and opaque surfaces are separate materials. Decorative colors and artwork can legitimately differ from control tokens.

`quality-guard.mjs` blocks new transition-all, literal timed easing, six-digit colors and heavy utility/font weights in package JS/TS, and application imports. `quality-exceptions.json` is an exact file/rule/value/count inventory of inherited cases. It is deliberate migration debt, not a claim that the library is free of these patterns. New occurrences fail. Remove entries when resolved; new exceptions require a reviewed reason. The existing design guard additionally checks CSS and shared typography/spacing rules. These static checks are conservative detectors, not a complete CSS correctness proof.

The framework-independent package uses native images. Its Next/Image lint exemption avoids imposing a host framework. Broad UI-directory hook/purity/unused-variable exemptions have been removed; remaining rule exceptions explain the exact external-system synchronization at the source line.

## Add a component

```sh
npm run component:new -- --name SummaryPanel --family display
npm run component:new -- --name SummaryPanel --family display --apply
```

The first command only previews. The second creates a typed composition, example, draft catalog entry and TODO test scaffold. Action/field families compose the actual Button/Input. It refuses existing names, file collisions, path traversal and symlinked destinations. It does not publish or export a draft. Complete its behavior, stories/visual review and tests, then follow the promotion checklist in the draft record. TODO scaffolds are explicitly unfinished work.

## Verification and release

```sh
npm run systems:update  # rebuild, regenerate docs/API baseline; review the diff
npm run verify          # build, lint, catalog/contracts, examples and drift checks
npm run verify:full     # fast gate + UI checks, fresh install/adoption checks and MCP tests
```

Install root dependencies and the separate MCP dependencies first (`npm ci`, `npm ci --prefix packages/highway-mcp --ignore-scripts`). The full gate requires Playwright Chromium (`npx playwright install chromium`). All commands run locally without deployment. CI checks generated files without updating them.

The full gate audits production dependencies for high/critical advisories in the root starter, MCP and isolated installed UI consumer. It requires registry access and fails closed on audit errors. Development-tool advisories still need separate review.

The installed-consumer gate enforces gzip budgets for a minimal Button+Theme app and the fuller fixture; these include React. Budgets are regression limits, not performance guarantees. Retain the actual measured output and review any increase. Package checks cover types, ESM imports, SSR, scoped host styling and behavior. Visual review must still inspect glass, optical alignment and motion with ordinary and reduced motion. Device emulation does not certify physical devices or assistive technology.

## Remaining reviewed work — October 28, 2026

The initial style inventory contained 105 exact inherited file/rule/value exceptions; the 0.3.0 interaction pass removes two resolved entries, leaving 103. The subsequent control-family refinement removes one segmented-control literal-motion entry, leaving 102. They are intentionally retained pending visual migration rather than broadly restyled. The rule blocks new occurrences; the inventory is not a zero-debt certification.

Production dependency audits are clean after patching Next, Better Auth and Zod. A full audit including development tools still reports 11 toolchain advisories (6 moderate, 4 high, 1 critical), including Storybook and Vite/Vinext/Cloudflare dependencies. These need a coordinated toolchain upgrade and rebuild validation; no force/downgrade resolution has been applied. Run `npm audit` for current advisory details, since registry findings change.


## Shared interaction implementation

`packages/highway-react/src/lib/interaction` owns async action state, stable selection operations, enabled-option navigation and dismissal timers. These helpers remain internal until a standalone public contract is warranted. `LiveStatus` centralizes polite announcements; `ContentTransition` provides optional label transitions with reserved geometry and reduced motion. Normal buttons do not allocate a ResizeObserver.

Use existing Radix wrappers for menus, selects, popovers and modal focus boundaries. Search compositions use an active-descendant listbox and the shared navigation helper. Preserve the host's data and callbacks. Do not turn a loading timer into business success, register global shortcuts implicitly, or infer infrastructure from a UI component.

The public compositions and controlled/default values are documented in [INTERACTIONS.md](INTERACTIONS.md). Catalog selection constraints distinguish form values, actions, and navigation. Demo operations are explicitly local; consumers supply real handlers.

The surface-family precision pass centralizes remaining literal CSS animation durations and resolves alert color/motion and accordion motion exceptions. The exact retained inventory is now 68 entries, primarily inherited artwork/colors and unrelated style debt. Motion values are preserved during centralization.
