# Showcase validation

## Coverage

- Audited all 80 visible sidebar routes from the 82-entry showcase catalog. The `inv-button` and `inv-toggle` aliases are intentionally absent from the sidebar; their direct routes resolve to the canonical Button and Switch entries.
- On every sidebar route, checked the selected navigation item, matching article heading, exactly one article/H1/TOC, absence of collapsed documentation details, and a visible preview. All 48 iframe previews loaded their preview main region. Native-to-iframe-to-native navigation, browser back/forward, and both alias routes were exercised.
- Checked for page errors and duplicate React key warnings during the route sweep; none were observed.
- Exercised the desktop TOC with keyboard activation, focused section targets, hash/history updates, active marker movement, and smooth scrolling. Reduced-motion mode used instant scrolling. On mobile, opening a TOC link closed the disclosure and moved focus to the section.
- Ran representative component interaction tests alongside the docs navigation checks.

## Results

- `npm run typecheck` and `npm run lint` passed.
- `npm run check:ui:full` completed its typecheck, lint, design/contrast, starter build, and Storybook build stages. Its browser suite reported 54 passed and 77 skipped, with one narrow Calendar test failure. The isolated rerun of that Calendar test passed; the failure was not reproduced.
- Focused package-browser route/TOC checks passed, including the exhaustive 80-route scan. The focused installed-package usage smoke passed after restarting the example Vite server with `--force` to clear its stale dependency optimization cache.

## Uncovered parity issue

The focused installed-package visual parity test exposed an unresolved Card corner-radius mismatch: the source showcase renders `16px`, while the installed consumer renders `14px`. No package runtime files were changed here.

## Screenshot

Desktop VoiceRecorder documentation with the API section selected in the TOC: [showcase-sections-toc-desktop.png](../artifacts/validation-screenshots/showcase-sections-toc-desktop.png).

## Concise component documentation update

- Rechecked all 80 routes: TOC hashes resolve, Usage snippets contain no stale placeholders or local source imports, and API declarations parse. JSX examples parse in fragment context when they intentionally show sibling components; separate CSS examples parse as CSS. The VoiceRecorder API shows its own types without ContextTray or ReviewApplyCard declarations.
- The focused desktop/mobile TOC, typography, and copy-wrapping checks passed. The systems suite passed 4/4; `npm run typecheck` and `npm run lint` passed.
- Representative API reference screenshot: [showcase-voice-recorder-api-desktop.png](../artifacts/validation-screenshots/showcase-voice-recorder-api-desktop.png).
