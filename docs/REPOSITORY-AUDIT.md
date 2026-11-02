# Highway repository audit and cleanup map

> Historical report: versions, paths, and commands below record the audit at that time. For current installation use [PACKAGES.md](PACKAGES.md); for current checks use [SYSTEMS.md](SYSTEMS.md). Do not use historical commands as installation instructions.

Audited October 20, 2026 against commit `f548ef4`. The checkout was clean before this report. Scope: the Highway repository (`app-foundation-starter`), not the separate Taste Index or In Mind repositories.

## Decision

Keep the design implementation. Separate the application scaffolding. Resolve component selection ambiguity before adding an installer or product UI.

The repository currently combines four responsibilities: reusable UI, component documentation/quality labs, a Yardwork reference application, and a Cloudflare application starter. The published packages are already independent at runtime, but their source/build process and developer entry point are not independent of the starter repository.

This was a read-only source, configuration, import-reference and artifact review. No application files, dependencies, infrastructure, secrets, remote resources or deployment were changed. No tests/builds were run for this audit. Existing build-manifest evidence is identified as such; static-reference findings are candidates, not proof that a file can be deleted.

## Keep / separate / defer / remove

| Area | Decision | Evidence and reason | Condition before change |
| --- | --- | --- | --- |
| `app/tokens.css`, `typography.css`, `controls.css`, `foundation.css` | **Keep; move ownership into styles package** | Canonical material/geometry/type consumed by `scripts/highway/build.mjs`; Invariant token names alias these values. | Preserve computed styles, themes, glass and reduced-motion behavior. |
| `components/ui`, shared `components/foundation` patterns | **Keep selected canonical implementations** | Public library exports use these for buttons, fields, dialogs, forms and feedback. Do not treat the whole Foundation folder as app infrastructure. | Separate reusable patterns/status/feedback from providers/auth/shell. |
| `packages/highway-compat/components` and relevant helpers | **Keep; consolidate under public UI ownership** | 50 tracked component files feed `components/library/index.ts`. These are working implementation assets, not disposable inspiration. | Keep MIT attribution; preserve API compatibility or deprecate explicitly. |
| `components/visual`, AskBar, theme and portal machinery | **Keep** | Public exports and package dependency graph include these. They carry effects and important interaction behavior. | Retain failure, pending, keyboard, mobile and portal-theme checks. |
| `packages/highway-react`, `packages/highway-styles`, package build/pack scripts | **Keep; make the primary product boundary** | Existing packages expose React components and CSS without application dependencies. | Make source physically package-owned and add package CI before moving consumers. |
| Showcase, guide, Invariant preview sandbox | **Separate into a documentation app** | `components/library`, `app/showcase`, `app/guide`, `packages/highway-compat/preview`; currently reached through the Cloudflare/auth root layout. | Run without auth/database setup; preserve searchable examples and component behavior. |
| Storybook and quality labs | **Keep as development verification** | `stories`, `.storybook`, `/components/foundation`, `/components/effects` exercise states and contracts. Different purpose from a customer showcase. | Share examples/fixtures where possible rather than delete coverage. |
| Yardwork demo and domain helpers | **Separate into a reference app** | 36 tracked files under `components/yardwork`, 26 under `lib/yardwork`, plus `app/demo`. Showcase currently imports a Yardwork bookings chart. | Keep appearance/interaction reference; remove core/showcase dependency on demo domain data by using an example-only boundary. |
| `packages/mobile-client/src/contracts.ts` | **Move with Yardwork; not dead code** | Imported by `components/yardwork/field-brief-editor.tsx`. | Do not delete as an apparently unused standalone package. |
| Auth, workspaces, records/files, email, D1/R2 | **Defer from product core; preserve as optional starter** | `lib/auth*`, `session`, `workspace`, `records`, `email`, `db`, `migrations`, `app/api`, workspace/settings and records example routes. | Move with corresponding security tests and configuration; no remote resource deletion. |
| Cloudflare/Vinext deployment and operations | **Separate with hosted apps/starter** | `vite.config.ts` installs Cloudflare plugin; `app/layout.tsx` imports Cloudflare env and session loading; `worker/index.ts` handles HTTP policy. | Keep existing deployment working during transition. No need to remove Cloudflare from the deployed site just to isolate UI packages. |
| Dormant copied UI primitives | **Review for removal or optional catalog** | Static import scan found 46 of 75 tracked `components/ui/*.tsx` without an incoming resolved static import. Examples: chart, carousel, combobox, source-code-viewer, sidebar, command and input-group. | Check exports, source/example references, intended API and dynamic usage individually. No bulk deletion. |
| Legacy whole-starter ZIP packaging | **Retire or scope to optional starter** | `scripts/package.mjs` recursively walks `packages/` then rejects any `dist` path; package builds create nested `packages/*/dist`. It also omits `examples/` and `playwright.package.config.ts` from its explicit lists. | Choose tarball distribution as the primary path; preserve a deliberately separate starter archive only if useful. |
| Stale inventories and starter-first copy | **Replace with generated inventory and current guidance** | README starts with Cloudflare/auth setup; inventory says 70 components while tracked UI source has 75. `.impeccable.md` includes both no-Yardwork-artwork wording and later authorization to preserve it. | Keep historical provenance/validation separately, not mixed with current instructions. |
| Generated local outputs and caches | **Optional local cleanup only** | `node_modules`, `dist`, Storybook output, example dependencies and generated previews are ignored. These are not equivalent to consumer download weight. | Do not erase `.wrangler` local state or secrets under a generic cleanup command. |

## Highest-priority findings

### 1. Runtime separation works; source ownership does not yet

`packages/highway-react/src/index.ts` reexports implementations from outside its package, including `components/library/index.ts` and `components/ui`. `scripts/highway/build.mjs` reads `app/*` CSS and extracts sections of `app/globals.css` by string boundaries (`@custom-variant`, `* {`, `.brand {`). This is fragile: an unrelated app stylesheet reorganization can change package output.

The existing generated build manifest lists 89 source modules and eight external runtime packages, including React/React DOM. The published React manifest has six regular UI dependencies. No Next, Vinext, auth, database or Cloudflare dependency is declared in the consumer package. Preserve this successful runtime boundary while moving source ownership into packages.

**Proposed change:** packages own their implementations/styles; all apps import those packages. Replace substring extraction with explicit shared stylesheet inputs. Convert the repository to a workspace structure incrementally, not through a wholesale rewrite.

### 2. Several public names represent different implementations

`components/library/index.ts` exports Invariant `Card`, `Dialog` and `Textarea`. The package entry additionally exports Foundation `GlassCard`, `FoundationDialog` and `NativeTextarea`. The separate source tree also contains other duplicate concepts such as accordion, tabs, checkbox and progress. These are not automatically equivalent or interchangeable.

The package does not export `InputGroup`, although the source inventory lists it. A consumer or AI can therefore see a component in the repository and assume it is supported in the installed package. This contributed to local recreation during integration.

**Proposed change:** create one machine-readable catalog with canonical export, supported use cases, alternative/legacy status, composition recipes, constraints and examples. Deprecate ambiguous alternatives only with a migration plan. Keep different materials where intentional; do not flatten glass into a generic card.

### 3. Consumer-package verification is missing from CI

`.github/workflows` runs starter API checks, design guards, Storybook, source UI tests and Invariant tests. It does not invoke `pack:packages` or `test:packages`.

`test:packages` also assumes tarballs and an installed `examples/highway-vite` consumer already exist. The example points to `../../artifacts/*.tgz`. A fresh root install alone does not prepare that check.

**Proposed change:** add a CI job that builds/packs, installs a clean external consumer, verifies declarations/SSR/import boundaries and runs browser parity/interaction checks. Retain the consumer example: it is more valuable for compatibility than another visual gallery.

### 4. Developer entry points still describe the old starter

Default development builds the Invariant preview, then starts a Vinext/Cloudflare app. The root layout loads the user/session even for documentation pages. README onboarding asks developers to set up environment variables and database migrations before exploring the product.

**Proposed change:** make documentation/library development the default entry point with no backend setup. Give the optional starter and Yardwork example separate commands. Clarify `pack:packages` versus legacy `package`, and separate UI-library release checks from Cloudflare deployment checks.

### 5. Type and styling contracts need stronger release discipline

Declaration generation permits unchecked JavaScript and sets `strictNullChecks: false`; the vendored JSX exports consequently have permissive contracts. The stylesheet is scoped to `.highway`, but scoping is not Shadow DOM isolation. Consumer selectors can still override internals; some CSS names such as keyframes/properties are document-wide.

**Proposed change:** type the supported public APIs incrementally, document allowed theme inputs and disallowed internal overrides, and keep real consumer parity tests. Do not promise “any framework” from the current React 19.2+ package. Evaluate CSS entry splitting after measurement rather than removing accessibility or motion code to shrink it.

## Dependency decisions

- Split dependencies by actual owner before removing them. Root has 38 regular dependencies covering the starter, demo, optional copied primitives and UI system; the consumer package has six regular UI dependencies plus React/style peers.
- Dependencies attached to dormant copied features (for example CodeMirror, charts, carousel, command palette) should move with those features or be removed only when their source owners are removed.
- The scan found no direct static import for `date-fns`; review peer/transitive needs before removing the root pin.
- **Keep the explicit `@radix-ui/react-dismissable-layer` pin for now.** `docs/DESIGN-SYSTEM.md` explains that it coordinates nested dialog/select/popover dismissal. A no-import result does not make it unnecessary.
- Preserve lockfiles and attribution. No fresh vulnerability, legal or licensing audit was performed here; the private `UNLICENSED` package metadata is not a finished public-product licensing policy.

## Proposed destination structure

```text
packages/
  highway-react/       # owns reusable components and theme/portal APIs
  highway-styles/      # owns tokens, typography, materials and motion
  highway-catalog/     # future selection rules + supported compositions
apps/
  docs/                # showcase, guide, examples
examples/
  yardwork/            # reference application, synthetic domain data
  vite-consumer/       # independent install/parity fixture
starters/
  cloudflare/          # optional existing auth/workspace/D1/R2 starter
```

This is a target map, not an instruction to create empty packages now. Keep tests beside their owner and maintain cross-package consumer tests. Do not duplicate canonical UI source while moving apps.

## Taste Index boundary

Taste Index should own curated evidence and decision criteria: reference provenance, audience/task context, design rationale, appropriate/inappropriate uses, and reviewed design directions. Highway should own executable components, compositions and their contracts.

Connect them through stable catalog identifiers. A Taste Index direction can recommend component/composition IDs and supported theme inputs. It should not carry copied component implementations or arbitrary CSS overrides. The preview and implementation should resolve the same versions and selections.

Do not build an installer, marketplace, visual editor or account system yet. First establish the catalog and source boundaries so the next product layer cannot choose between conflicting implementations by accident.

## Safe cleanup sequence and acceptance gates

1. **Document the supported API:** canonical catalog, intentional variants, missing exports and deprecations. Acceptance: every supported showcase entry says whether/how it is installable.
2. **Protect distribution:** clean-consumer package CI and deterministic versioned artifacts. Acceptance: fresh clone can pack/install/verify without undocumented manual steps.
3. **Move ownership:** shared implementations and CSS into packages; existing apps become consumers. Acceptance: component visual/behavior parity and existing demo behavior remain intact.
4. **Separate apps:** docs without auth setup; Yardwork and Cloudflare starter optional. Acceptance: package build and docs dev do not require database/email/Cloudflare bindings.
5. **Prune confirmed dead code:** decide each dormant component and its dependency owner. Acceptance: no lost public API, showcase functionality, meaningful test or attribution.
6. **Introduce Taste Index integration:** stable component/composition IDs and one curated, implemented direction. Acceptance: the same selected direction works in two different consumer apps without hand-built lookalikes.

No removal is approved by this report. The next concrete implementation should be steps 1–2, followed by a controlled ownership move—not deleting the starter and hoping the library still builds.

## First implementation pass — October 20, 2026

The follow-up implements the first two recommendations: a canonical component catalog and clean installed-package CI. See `catalog/README.md` and `npm run check:packages:clean`. The showcase now gives public import names and distinguishes mixed/demo-only references from package components. The historical inventory is explicitly source-only.

Package source ownership, standalone documentation hosting, demo isolation and deletion candidates remain future work. No application domain code, database migrations, deployment configuration or public component API was changed in this pass.

Validation of this pass: catalog contract (102 runtime exports, 70 showcase mappings), package archive boundaries, fresh external consumer install, strict TypeScript, Vite production build, React SSR and installed-file equality against fresh tarballs all passed. Package browser matrix: 8 passed, 16 intentional project-specific skips. Root typecheck passed; lint had 0 errors and 18 existing Invariant warnings. The local glass showcase and its import guidance were visually reviewed. Full framework certification and real-device/assistive-technology testing were not performed.

## Ownership separation pass — October 20, 2026

The next approved pass moves runtime source into `packages/highway-react/src` and CSS into `packages/highway-styles/src`, with thin compatibility reexports at the old paths. The package build uses explicit shared CSS files and rejects runtime graph inputs outside the package. It no longer extracts sections from the starter stylesheet.

The showcase/guide/Invariant preview now live in `apps/showcase`; synthetic office screens and domain logic live in `examples/yardwork`. Each has its own Vinext entry and production output, without Cloudflare/auth setup. Default development opens docs; the original backend remains available via explicit starter commands. Three labelled demo illustrations remain intentional showcase dependencies, and quality labs remain shared development fixtures.

The demo's unreachable live-files Settings branch was removed while retaining its existing demo message. No deployed resources, migrations or credentials changed. Root dependencies/tooling and compatibility shims are retained; pruning them is a later verified step.

Validation of the ownership move: package, standalone showcase, standalone demo, optional starter and Storybook production builds passed. Root typecheck, lint (0 errors; 18 existing Invariant warnings), design/token guards, catalog coverage, independent-app import boundaries and all 3 demo domain tests passed. The package graph contains 89 package-owned source modules. Fresh external consumer installation, strict types, Vite build, SSR, archive boundaries and installed-tarball equality passed; package browser coverage was 8 passed with 16 conditional matrix skips. Full design-system browser coverage was 28 passed with 8 conditional skips.

The showcase matrix initially completed with 29 passed, 77 conditional skips and 2 timing-sensitive test failures. Its iframe navigation poll was corrected to tolerate a frame before navigation, and its compact-composer test now uses staged user scrolling. Both affected cases passed on focused rerun without changing component implementation or weakening their visible-state assertions. Playwright output directories are now separate per suite to avoid diagnostic-file collisions during concurrent runs. These checks use browser emulation; no claim of real-device, assistive-technology or full host-framework certification is made.

Final focused verification also passed: all 50 isolated previews after waiting for hydrated navigation links; compact AskBar scrolling/focus transfer; standalone guide package instructions and cross-app links; and demo Today → Schedule → Today navigation plus a conflict-free in-memory assignment save. The demo correctly rejected an initially conflicting assignment during test development. All applicable original showcase cases have passing evidence from the full run plus focused reruns, and the added guide/demo smoke cases passed. No backend integration, remote deployment or live service action was performed for this separation.
