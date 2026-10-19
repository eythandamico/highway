# Yardwork foundation refresh — October 19, 2026

Source: `easy-launch-apps/yardwork`, commit `8271182a411ca5ff9fe25589492e518dbcb4eeb7` (October 13). Compared with the original October 10 starter copy. This is a selective extraction, not a replacement with the Yardwork application.

## Included as working code

- Semantic tokens and typography ownership; consistent button geometry, 44px targets, pending states and borderless resting fields.
- Warm raised surface wash/rim/shadows, opaque floating menus and dialogs; reduced-motion, reduced-transparency and forced-color handling.
- Date picker backed by a real date input, themed select retaining native form behavior, and updated shared primitives.
- ThemeScope across supported portals; product-independent appearance helper validating accent colors and choosing readable action text.
- Generic Fields, FormDialog, Confirm, Modal with optional sidebar, Heading, RowMeta, Empty, SearchField and view-choice buttons. No customer/visit field definitions.
- Feedback, Status and SectionBoundary; retryable shared lazy-import promise. Record creation uses the shared form; files use the section boundary.
- Authentication client loaded on demand; neutral sign-in explanation retained.
- Executable quality lab and existing effects gallery; theme/text-size Storybook controls and repeatable design/browser checks.
- Refreshed implementation guidelines, provenance and manifest/ZIP.

## Included as guidance, not enabled services

Secure invitation lifecycle, account/workspace isolation, native/mobile DTO and credential boundaries, offline retry/conflict semantics, explicit onboarding readiness, webhook reconciliation and service-delivery truth. See EXTENSIONS.md and UX-PATTERNS.md. The starter has no live team invitation, native app, payment or messaging feature.

## Intentionally excluded

Yardwork customers, jobs, schedules, quotes, invoices, crew permissions, prospecting, maps, provider accounts, production configuration, release records and personal data. The Ask assistant, mascot/orb, business navigation, product-specific charts and native mobile projects are not generic foundation components. Their general continuity and boundary lessons are documented instead.

No source environment, database, bucket, domain, account ID, Git history or original product artwork was copied. Source repository was read only. The earlier starter ZIP remains in `artifacts/app-foundation-starter-before-2026-10-19.zip`; current ZIP is `artifacts/app-foundation-starter.zip`.

See VALIDATION.md for checks performed on this refresh. Historical source test results do not certify the extracted starter.

## Fixes made during extraction validation

- Calendar loading is deferred until opening its popover, preserving native input and production server rendering.
- Nested select/calendar portals remain within Dialog/Sheet focus boundaries, with a shared compatible dismissable-layer dependency for coordinated Escape handling.
- Menus/calendars have explicit layers above dialogs; dialog/sheet highlights do not sample the page behind them.
- Ordinary buttons have minimum width as well as height; the inline variant is the documented exception.

The root dependency versions remain intentionally pinned. The lockfile was refreshed to deduplicate compatible overlay infrastructure, rather than upgrading the application framework.
