# Highway

Highway is a standalone starter extracted and adapted from the Playground foundation, packaged for a different product. React 19, Next-compatible App Router via Vinext, Cloudflare Workers, D1, R2, Better Auth, Drizzle, Tailwind and shared Radix-based components. This is **a separate package**, refreshed with the reusable Yardwork design foundation on October 19, 2026. See [the refresh inventory](docs/STARTER-REFRESH.md) for scope and provenance.

## Explore the demo and library

- `/demo` — the original Yardwork office demo, with synthetic customers, visits, quotes, invoices, teams, and the Ask launcher. Local-only actions; no account required.
- `/guide` — how to run, customize, and build with this foundation, including instructions for AI agents.
- `/showcase` — searchable live component previews, source locations, and copyable examples.
- `/examples/records` — the earlier generic records/files example.

The owner requested this standalone demo extraction on October 19, 2026. See `docs/DEMO-EXTRACTION.md` for provenance and isolation details. Demo changes reset on reload. Original Yardwork resources are never used.

## Start locally

Use Node 22.13+ and npm. Unzip the whole folder, then:

```sh
npm ci
npm run setup
npm run db:migrate
npm run dev
```

Open **http://localhost:5188**. Use that exact hostname: the configured origin protects writes. The setup command creates an ignored `.dev.vars` with a fresh secret. During local development only, email codes appear in the server terminal as `[LOCAL SIGN IN]`. No real email is sent in console mode. Do not expose the dev server publicly.

Open Workspace, sign in, create a record, archive/restore it, search, upload a private file, switch themes, and sign out. A new user gets a separate empty workspace. Nothing is seeded with customer data.

```sh
npm run typecheck
npm run lint
npm run build
npm test
npm run start
npm run storybook
```

Stop the dev server before running npm test or starting the production-build preview on the same port. The integration suite uses a separate disposable local database and requires a completed build. Both commands use local Cloudflare bindings. Local state stays in `.wrangler/state`; do not package or commit it. A pinned `package-lock.json` belongs in your new repository. Read `docs/VALIDATION.md` for checks actually performed, including limitations.

## What is implemented

- Shared UI primitives, semantic light/dark tokens, warm raised surfaces and consistent 44px controls.
- Reusable forms, pending-safe dialogs, feedback/status components, themed date/select controls and scoped portal branding. Open `/components/foundation` for the quality lab.
- An opt-in visual effects layer: progressive header/rail/composer blurs, soft gradients, edge fades, media scrims, glass controls and deterministic gradient avatars. Open `/components/effects` for the interactive visual guide.
- Desktop navigation, compact mobile navigation, accessible modal/sheet primitives, skip navigation and responsive sign-in bottom sheet.
- Six-digit email-code authentication; hashed, expiring, attempt-limited codes; server-verified sessions; no intermediate signout page.
- Local console delivery and a production SendGrid adapter. Production credentials are deliberately absent.
- Protected workspaces with membership checks and owner/admin/member/viewer roles. Each new user gets a personal workspace; team invitation and workspace switching UIs are extensions.
- Example records: create, list, search, page, archive and restore. Revision checks reject stale writes instead of silently overwriting them.
- Private R2 uploads, member-authorized attachment downloads and deletion. Upload limits and origin checks are enforced on the server.
- Account name editing and persistent system/light/dark appearance.
- Public About, FAQ, Help, Terms and Privacy page structures, metadata, robots and sitemap. Legal/support text is explicitly placeholder content.
- Loading/error/empty states, abortable requests, stale response protection and one lazy-loaded feature example.
- Storybook examples, checks, package inventory and a release checklist.

## Where to start changing it

| Area | Location |
| --- | --- |
| Name and description | `config/app.ts` |
| Colors, spacing, radii, layers and motion | `app/tokens.css` |
| Layout and responsive behavior | `app/globals.css` |
| Fields, surfaces and overlays | `app/foundation.css` |
| Button geometry | `app/controls.css` |
| Forms, details and feedback | `components/foundation/patterns.tsx` |
| Typography scale | `app/typography.css` |
| Reusable controls | `components/ui/` |
| Shell and account flows | `components/foundation/` |
| Your product pages | `app/` |
| Auth and identity | `lib/auth.ts`, `lib/session.ts` |
| Authorization | `lib/workspace.ts` |
| API boundary and limits | `lib/http.ts` |
| Database initialization | `migrations/` |
| Private files | `app/api/files/` |
| Deployment bindings | `wrangler.jsonc` |

Use the records feature as a worked example, not the permanent schema for every app. Do not rename records to customers and then squeeze schedules, payments and quotes into a generic text field.

## Included documentation

1. `docs/ARCHITECTURE.md` — boundaries, request flow and extension seams.
2. `docs/DESIGN-SYSTEM.md` — visual conventions and component usage.
3. `docs/UX-PATTERNS.md` — mobile, keyboard, overlays, forms, loading and account transitions.
4. `docs/SECURITY-AND-DATA.md` — tenant isolation, requests, files and data lifecycle.
5. `docs/PERFORMANCE.md` — loading principles and measurement procedure.
6. `docs/OPERATIONS.md` — local setup, manual deployment, migrations and recovery.
7. `docs/EXTENSIONS.md` — notifications, invitations, sharing, integrations, billing and jobs.
8. `docs/YARDWORK-REBUILD.md` — functional migration map; do not copy Yardwork's old UI.
9. `docs/COMPONENT-INVENTORY.md` — the complete reusable UI inventory.
10. `docs/RELEASE-CHECKLIST.md` — concrete acceptance checks.
11. `docs/VALIDATION.md` — results and scope of this package's validation.
12. `docs/PROVENANCE.md` — origins, licenses and what's intentionally excluded.
13. `docs/VISUAL-EFFECTS.md` — executable examples, exact blur recipes, gradients, layering, accessibility and performance.
14. `docs/VISUAL-EXTRACTION-MAP.md` — source-to-package coverage and product-specific effects intentionally excluded.

15. `docs/STARTER-REFRESH.md` — October 19 extraction inventory and excluded product features.

`AGENTS.md` and `.impeccable.md` carry implementation guardrails into the new repository. It does not impose Playground's business model on the next app.

## Consistency checks

```sh
npx playwright install chromium
npm run check:ui:full
npm run package
```

The design guard, contrast checks and browser suite supplement the local API tests. Storybook has light/dark and 100%/200% text controls. Packaging includes source, docs and the file-hash manifest, excluding installed dependencies, test output, local state and credentials. The previous ZIP is retained separately in `artifacts`.

## Move it into a new repository

```sh
# Run inside this unpacked folder, after reviewing the included files.
git init
git add .
git commit -m "Start from app foundation"
git branch -M main
git remote add origin YOUR_NEW_REPOSITORY_URL
git push -u origin main
```

No remote is preconfigured. No source Git history, customer records, artwork, production domains, account IDs or secrets are included. Do not copy Playground's `.env`, `.dev.vars`, `.wrangler`, deployment bindings or private assets into the new app.

## Production is a separate step

Create your own D1 database and private R2 bucket; configure your own HTTPS origin, authentication secret, verified email sender and SendGrid token; apply migrations; replace placeholder public content and complete the release checklist. `npm run check:release` checks public configuration only and deliberately fails on the unconfigured starter. Nothing in setup or packaging deploys an app.

Vinext is pinned to the version used by the source foundation and is a beta dependency. Validate framework upgrades explicitly. This starter preserves that stack rather than promising compatibility with every Next.js deployment host.

### One library, Invariant styling

The library combines Invariant components and Foundation patterns under Invariant’s styling system. `app/tokens.css` and `app/typography.css` own the shared palette, materials, scale, and motion; `--inv-*` values are aliases. Import from `@/components/library` or direct modules. Explore `/showcase?component=inv-segmented-control` and `/guide#invariant`. Components can be imported directly into app routes; their theme is already wired up. `npm run build:invariant` rebuilds the isolated previews during development. See `docs/INVARIANT-INTEGRATION.md`.

## Project identity

The project and personal GitHub repository are named Highway (`eythandamico/highway`). Product branding is centralized in `config/app.ts`. The existing Cloudflare worker `app-foundation`, D1 and R2 bindings, local checkout directory, and theme preference key retain their internal names for continuity; the live deployment URL is unchanged.
