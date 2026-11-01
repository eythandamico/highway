# Changelog

## 0.3.0 — 2026-10-28

- Correct duplicate and clipped focus indicators; previews now use package focus ownership, composite fields highlight their shell, and ring controls retain forced-colors outlines. See [focus audit](docs/FOCUS-STATE-AUDIT.md).

- Restore Invariant component-owned geometry, emphasis, materials and motion after auditing all 50 files. Fix collapsed dropdowns, stretched step indicators and flattened Thinking text; see [detail restoration](docs/INVARIANT-DETAIL-RESTORATION.md).

- Refine mixed checkboxes, selection spacing, split-button sizing, menu keyboard navigation, narrow modal/toast layouts, and reduced-motion toasts. Larger proposals are documented in the [component-family review](docs/COMPONENT-FAMILY-REFINEMENT.md).

- Added VoiceRecorder, ContextTray, and ReviewApplyCard with local audio, controlled context previews, host-confirmed application, showcase examples and MCP contracts.
- Use a minimal, seekable audio waveform for voice playback, with progress highlighting and keyboard access.
- Smooth voice-recorder expansion and control transitions; preserve waveform levels across pause/resume and keep controls stable while preparing playback.

- Add nine host-controlled interaction compositions, with catalog contracts, live examples and MCP guidance.
- Await real ActionButton operations; preserve loading focus, handle failures and prevent duplicate activation.
- Keep table selection stable through sorting; add accessible sorting/checkboxes and controlled keys.
- Complete Select keyboard behavior through shared Radix primitives; pause toast dismissal for interaction and document visibility.
- Add reusable async, selection, timer, announcement and reserved-label transition utilities.
- Refine control/surface family geometry, menu row targets, long-content card/dialog layouts and close controls while preserving materials.
- Correct collapsed accordion and bottom-navigation focus, menu disabled/keyboard behavior, alert lifecycle cleanup, and media/bottom-sheet reduced motion.
- Centralize inherited specialty motion durations without changing their values; add real-component family review pages and regression coverage.
- See [upgrade behavior and rollback](docs/releases/0.3.0.md).

All notable changes to the installable Highway packages are recorded here. Both packages use matching versions. Entries describe local releases unless explicitly marked distributed; a changelog entry does not publish a package.

## Unreleased

### Adoption tooling and documentation

- Preview-first npm adoption command for React and styles-only hosts, with additive theme wiring, versioned vendor tarballs and consumer-local selection guidance.
- Strict exact-component implementation contract and project acceptance checklist.
- Release metadata checks, adoption regressions and minimum/current supported React validation.
- Separate package release notes and upgrade guidance from optional starter deployment checks.

The adoption-tooling items above are repository changes; subsequent runtime and declaration changes are recorded in their versioned entries. Release automation validates and packages; it never publishes or deploys.

## 0.2.3 — 2026-10-28 (local release candidate)

- Added named motion recipes preserving Tabs, SliderInput and ExpandCard choreography; keyboard and reduced-motion paths are immediate.
- ExpandCard now has a native accessible trigger, inert collapsed content and observed dynamic height. Child actions no longer collapse it.
- Enabled strict null checking in package declarations and explicit prop interfaces for previously inferred array APIs.
- Cancelled toast-owned frames and dismissal timers on teardown; fixed image-carousel callback dependencies and removed unused state.
- Added engineering contracts, compiled examples, API drift reports, guarded legacy exceptions, safe draft generation, bundle budgets and verification commands.
- MCP 0.1.1 and showcase expose the same canonical contracts, declarations and checked examples.
- Patched optional starter production dependencies; no deployment or publication performed.

## 0.2.2 — 2026-10-21 (local release candidate)

### Fixed

- BottomSheet no longer implicitly transforms the host root or changes its background. An explicit pageTarget enables the page effect and restores owned styles.
- Closed menus are inert; keyboard navigation, dismissal and focus restoration are supported.
- NumberInput supports keyboard activation and cleans up held-input timers.
- SliderInput and SplitPane support keyboard and touch. Slider snapping handles nonzero minima and decimal steps, preserves quick-click motion, and cleans up cancelled drags.
- Tabs handles quoted IDs and keeps its underline aligned after text resizing.
- Progress reports normalized percentages and immediately settles under reduced motion.
- Ten audited APIs have explicit exported TypeScript prop interfaces.
- Minimal Button + Theme imports no longer emit the optional calendar graph.

### Typography

- The package and host adoption contract use the approved eight-role scale: 14px default UI, 13px dense tables, 400/500/600 weights, tabular metrics, expandable dense rows and meaningful primary/secondary KPI hierarchy.

### Upgrade attention

BottomSheet's page transformation is now opt-in. Correctly typed declarations may expose invalid consumer props that previously passed. See docs/releases/0.2.2.md for installation and migration steps.

Earlier local iterations are documented in repository history and the original package audit; no complete historical release record is asserted here.

## Component families — 2026-10-29

- Added typed Combobox multiple mode, expandable SearchBar and horizontal Stack; retained MultiSelect, SearchToggle and Row compatibility exports.
- Shared authored dialog shells and menu keyboard navigation without replacing their materials or motion.
- Organized component discovery into families with variant selection and preserved direct links.
- Added variant-aware MCP tools and catalog-driven selection guidance.
