# Focus-state audit

October 28, 2026. Local package and showcase changes.

## Findings and fixes

| Before | After | Why |
| --- | --- | --- |
| Preview added an outline to every focusable element | Preview uses package focus styles | The preview must show the installed component, not a modified focus state |
| Unlayered package fallback overrode input outline suppression | Base-layer fallback yields to component-owned focus | Composite inputs can use one visible shell indicator |
| Authored shadow rings appeared beside the fallback outline | Ring owners explicitly use a transparent outline, retained in forced colors | One visible normal-color focus indicator with a high-contrast fallback |
| Menu rows received a second forced outline | Authored menu-row ring owns focus | Preserve keyboard indication without duplicate rings |
| SearchToggle child outlines were clipped by its morphing shell | Input focus belongs to the shell; child buttons use inset outlines | Keep the complete indicator visible |
| ExpandCard, AskBar buttons and calendar day indicators could hit clipped edges | Focus indicators sit inside the affected control | Keep focus visible without changing resting geometry |
| Calendar day had both library ring and shared Button outline | Button owns its single inset outline | Avoid duplicate focus treatments |
| PromptBar/AskBar inner fields suppressed outlines without a strong keyboard shell indicator | Focus-visible field state highlights the shell | A composite field still needs a visible focus location |
| PIN invalid style could conceal the focused digit | Invalid state retains a separate inset focus indicator | Error and focus communicate different states |

The source scan covered canonical Invariant components, native primitives, shared styles and the preview stylesheet. No blanket removal of keyboard focus was introduced. Focus-specific classes and selectors preserve resting design, geometry and motion.

## Validation

Focused Chromium checks use keyboard Tab on the direct preview routes. The SearchBar input stays unoutlined while its wrapper draws one 2px accent ring. SearchToggle keeps the collapsed trigger's outline inset in its clipped shell; when expanded, the shell owns the input ring. Invariant TextInput and Button retain visible focus outlines in normal and forced-colors modes.

The focused Playwright regression in `tests/component-browser/focus-states.spec.ts` passed 1/1. Normal and forced-colors screenshots show the single SearchBar wrapper indicator:

- [Normal keyboard focus](../artifacts/validation-screenshots/invariant-search-focus-normal.png)
- [Forced-colors keyboard focus](../artifacts/validation-screenshots/invariant-search-focus-forced-colors.png)

Validation results:

- `npm run check:ui:full` passed: typecheck, lint, design/contrast checks, starter build, Storybook build, and UI browser tests (55 passed, 77 conditionally skipped).
- `npm run check:systems` passed: 114 contracts, 102 declaration modules, quality guard, and contract typecheck.
- `npm run check:mcp` passed 8/8. The MCP archive and `artifacts/highway-0.3.0-manifest.json` were refreshed; release metadata validation passed.
- `npm run check:packages:clean` passed package catalog/archive checks, clean-consumer install/typecheck/build, audit (0 vulnerabilities), bundle checks, and SSR smoke, then its browser suite hit 11 showcase failures from Vite's stale shared optimizer (`504 Outdated Optimize Dep` on Lezer modules); 35 browser checks passed and 74 were conditionally skipped. The 11 failed route cases passed on a fresh forced server. For `5196` isolation, the package Playwright server now uses its own Vite cache under `node_modules`; one representative route passed with that cache (1/1). An initial isolated cache outside `node_modules` caused RSC parse errors and was discarded. The complete clean-package suite was not rerun after the final cache-path adjustment.

The isolated test cache is scoped to the package Playwright server so it does not overwrite the preview apps' shared default Vite cache. The test preview stays on port 5190; port 5196 was not used.
