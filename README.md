# Highway

Highway provides the React components and styling used by its showcase, with optional application examples. The component packages contain no authentication, database or Cloudflare runtime.

## Start locally

Use Node 22.13+ and npm:

```sh
npm ci
npm run dev
```

The showcase and guide run at **http://localhost:5190** with no backend setup. In another terminal, run `npm run dev:demo` to explore the independent Yardwork reference at **http://localhost:5191/demo**. Its synthetic changes reset on reload; it sends no live messages or payments.

| Owner | Source | Command |
| --- | --- | --- |
| Core components and theme | `packages/highway-react/src` | `npm run build:packages` |
| Core styles and tokens | `packages/highway-styles/src` | `npm run pack:packages` |
| Showcase, guide, isolated previews | `apps/showcase` | `npm run dev:showcase` |
| Yardwork reference demo | `examples/yardwork` | `npm run dev:demo` |
| Clean installed-package fixture | `examples/highway-vite` | `npm run check:packages:clean` |
| Optional Cloudflare starter | root `app`, `worker`, `lib` | `npm run dev:starter` |

`npm run build` builds the packages, showcase and demo. Each app has an independent `build:showcase` or `build:demo` command. The apps share repository tooling and consume canonical package source; external projects install the built tarballs. Original import paths remain thin compatibility reexports for the optional starter and existing integrations.

See [component selection](catalog/README.md), [package installation](docs/PACKAGES.md), and [repository boundaries](docs/ARCHITECTURE.md). No directories or dependencies should be removed just because they are optional.

## Optional backend starter

The original Vinext/Cloudflare Workers application, D1, R2 and authentication remain available independently:

```sh
npm run setup
npm run db:migrate
npm run dev:starter
```

It runs at **http://localhost:5188**. Setup creates ignored local configuration with a fresh secret. Local console sign-in codes are for private local development only. Use `npm run build:starter` before `npm test` or `npm run start`; these commands exercise local Cloudflare bindings. Keep `.dev.vars` and `.wrangler/state` private. No existing deployment is changed by the standalone preview commands.

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
| Colors, spacing, radii, layers and motion | `packages/highway-styles/src/tokens.css` |
| Layout and responsive behavior | `app/globals.css` |
| Fields, surfaces and overlays | `packages/highway-styles/src/foundation.css` |
| Button geometry | `packages/highway-styles/src/controls.css` |
| Forms, details and feedback | `packages/highway-react/src/components/foundation/patterns.tsx` |
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

### One Highway design system

Highway components and Foundation patterns share one design system. `packages/highway-styles/src/tokens.css` and `packages/highway-styles/src/typography.css` own the shared palette, materials, scale, and motion; `--inv-*` values remain compatibility aliases. Consuming projects import public exports from `@highway/react`. Explore `/showcase?component=inv-segmented-control` and `/guide#invariant`. Components can be imported directly into app routes; their theme is already wired up. Previews render directly in the showcase through one shared React canvas; `npm run dev:showcase` updates them live. See `docs/INVARIANT-INTEGRATION.md`.

The implementations live in `packages/highway-react/src/components`, their helpers in `src/lib`, and their shared types in `src/types.ts`. `packages/highway-compat` contains compatibility re-exports and historical reference documents, not a second runtime library. Run `npm run test:components` for the component browser suite.

## Project identity

The project and personal GitHub repository are named Highway (`eythandamico/highway`). Product branding is centralized in `config/app.ts`. The existing Cloudflare worker `app-foundation`, D1 and R2 bindings, local checkout directory, and theme preference key retain their internal names for continuity; the live deployment URL is unchanged.

## Install the library without the application

Highway now builds `@highway/styles` and `@highway/react` directly from its shared components. Run `npm run pack:packages` for versioned installable tarballs. Consumers need neither Tailwind configuration nor Highway infrastructure. Use `HighwayTheme` for exact defaults or supported brand overrides. See [package installation and theming](docs/PACKAGES.md) and the [isolated React/Vite/TypeScript example](examples/highway-vite/README.md).

## Adopt Highway in another project

Use `npm run adopt -- --target /absolute/project` to preview setup, then add `--apply` to install. Use `--mode styles` for CSS-only hosts. The generated guide explains the explicit theme wiring step. See [implementation rules](docs/IMPLEMENTATION.md), [package installation](docs/PACKAGES.md), [changelog](CHANGELOG.md), and [package release procedure](docs/PACKAGE-RELEASE.md).

## Agent integration

Use the [Highway MCP server](docs/MCP.md) to retrieve exact public component APIs, selection constraints and version-matched installation guidance. It runs as a separate local tool and adds nothing to application bundles.

## Engineering systems

[Component, motion and quality systems](docs/SYSTEMS.md) define the authoring workflow. Run `npm run verify` for the fast gate and `npm run verify:full` before release. Use `npm run component:new -- --name SummaryPanel` to preview a typed draft.

[Interaction components](docs/INTERACTIONS.md) documents searchable selection, date ranges, inline editing, action groups, copy feedback and command palettes. See [0.3.0 upgrade behavior](docs/releases/0.3.0.md) for async actions, table selection, keyboard Select and toast changes.

## Connect your agent with the Highway plugin

Run `npm run build:plugins` to generate the Claude Code and Codex plugin archives and website downloads. Each includes the skill, a matching MCP snapshot, and bundled runtime dependencies. Unzip the archive and follow its `INSTALL.md`; Node 22.13+ is required. See [plugin packaging and installation](plugins/highway/README.md).

These are directly installable local plugins, not public directory listings or ChatGPT web connectors. Plugin installation does not install UI packages into your application.

## Other setup options

From this checkout after `npm ci`, preview a new app with:

```sh
npm run onboard -- --target /absolute/path/to/my-app --new --agent codex
```

Add `--apply` to create it. Omit `--new` for an existing standalone npm React project; choose `codex`, `claude`, or `cursor`. Setup builds and installs matching packages, adds the Highway skill, and configures project-local MCP. Existing app source stays unchanged for agent-guided integration. See [the onboarding guide](docs/ONBOARDING.md) for requirements, recovery, and the first-task prompt.
