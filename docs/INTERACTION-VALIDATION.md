# Interaction release validation

Release candidates: `@highway/react` and `@highway/styles` 0.3.0, `@highway/mcp` 0.2.0. Validated locally on October 28, 2026. Publication and deployment are separate, manual steps.

## Coverage

Nine new public compositions use Highway's existing tokens and overlay primitives: Combobox, MultiSelect, DateRangePicker, FilterToolbar, InlineEdit, ButtonGroup, SplitButton, CopyButton and CommandPalette. Existing Button, ActionButton, Select, Table and Toast behavior was corrected alongside them.

Interaction checks exercise keyboard navigation, disabled options, portaled menus, real asynchronous completion, immediate duplicate-action guards, retained drafts after failure, retry, clipboard failure, stable table selection, modal dismissal guards, and toast timer pausing. Controlled test promises make pending and failure assertions independent of machine speed.

## Results

- `systems:update` and `verify`: passed; 111 public contracts, 101 declaration modules, four systems tests, clean lint, package boundaries and catalog checks.
- `test:packages`: passed; 36 browser cases passed and 60 intentionally skipped by project applicability. Package archive validation, example TypeScript/production build, browser-test types and SSR smoke checks passed.
- Final date-range regression: passed after the narrow-screen correction. Every calendar day remains inside the popup at 320px; narrow cells retain approximately 41px width and 44px height, with 44×44px desktop targets. Measurements wait for entrance animations to settle and allow fractional-pixel rounding.
- `check:dependencies`: passed; zero reported production dependency vulnerabilities in both the root and MCP package.

- `check:ui:full`: passed; type/lint/design checks, starter and Storybook builds, 28 browser tests passed and eight expected project-specific skips.
- `check:release:packages`: passed on the final source; external clean install, strict TypeScript, production build, SSR, 36 browser tests passed/60 applicability skips, all eight adoption scenarios, release metadata and manifest generation. Fresh install audit reported zero vulnerabilities.
- Bundle checks: full consumer JavaScript 144,291 bytes gzip; minimal Button/HighwayTheme consumer 70,893 bytes gzip. Both remain within the checked budgets; the minimal consumer excludes calendar code.
- `check:mcp`: passed all eight tests, including the six-topic guidance catalog and matching package contracts.

## Visual review and corrections

| Before | After | Why |
| --- | --- | --- |
| Date popup fit the viewport but clipped its final calendar column | Calendar uses responsive widths with 44px-tall day buttons; all seven columns checked | Outer bounds alone did not prove the content was usable |
| Short mock delays could finish before pending assertions | Explicit test completion/rejection controls | Reliably verifies duplicate guards and failure retention |
| New Button event handlers crossed a server-component boundary | Explicit client boundary and homepage regression | Prevents a server-rendered homepage error |
| `useToast()` declarations inferred an unusable context | Explicit public controller/context typing | Strict consumers can call the installed API |

Reviewed desktop and phone long-option screenshots, the corrected 320px calendar, and the phone toast. Evidence is retained under `artifacts/validation-screenshots/`. Toast programmatic-focus screenshots do not establish keyboard focus-ring appearance.

## Limits and host adoption

These results are browser automation and local visual review, not certification on physical devices or with assistive technology. The quality system retains 103 documented legacy exceptions. Production dependency auditing excludes development tools.

Host applications must still validate their own workflows, fonts/brand mapping, persistence, form submission guards and navigation. Components do not introduce infrastructure or silently perform domain actions. Install matching React/styles versions in an isolated host branch and retain the previous artifacts and lockfile for rollback. See [interaction contracts](INTERACTIONS.md) and [release notes](releases/0.3.0.md).
