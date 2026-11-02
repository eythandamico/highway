# New app foundation instructions

- This is an independent project. Do not read from or write to another application's database, bucket, repository or deployment.
- Establish the new product's users, purpose and brand before replacing the neutral starter screens. Use the refreshed shared design contract. The owner explicitly authorized copying Yardwork’s demo screens and interactions into this independent demo on October 19, 2026; preserve their appearance, but do not copy credentials, live data, or production adapters.
- Reuse package-owned components in `packages/highway-react/src/components/ui` and semantic tokens. Avoid one-off controls, duplicated modal logic, new fonts or arbitrary typography sizes.
- Keep input text at least 16px on phones. Preserve browser pinch zoom, safe areas, keyboard access, focus restoration and reduced-motion behavior.
- Server verification determines identity. Scope every resource read/write to authorized workspace membership; never trust userId, role or workspace from a client without checking.
- Private data must not enter public SSR, caches, analytics, logs, demo data or screenshots. Never show OTPs outside local development.
- Add append-only migrations for schema changes. Keep business actions explicit, validate input and use concurrency/idempotency where needed.
- Preserve data and scroll position during refreshes. Use initial server data, abort stale requests and lazy-load features rather than the entire shell.
- Do not compromise original artwork to hit a performance score. Measure transfer, loading and interaction behavior separately.
- Keep external services as server-side adapters. Do not mark messages sent, jobs booked or payments paid merely because a button was clicked.
- No automatic deployment or outbound customer messaging. Follow the user's explicit release instructions.
- Tests must exercise meaningful user/security behavior. Report untested flows honestly. Do not delete or weaken assertions to pass checks.
- When using Codex sub-agents, delegate test writing/execution/debugging to gpt-6-luna with xhigh reasoning; report unavailability rather than silently substituting a different model.

## Design foundation contract

- Read `docs/DESIGN-SYSTEM.md` and `.impeccable.md` before UI work. The inherited lime/forest palette and warm material are editable starter defaults, not a requirement for every future product.
- `packages/highway-styles/src/tokens.css` owns shared colors, spacing, radii, layers and motion; `packages/highway-styles/src/typography.css` owns type. Features consume them rather than defining competing scales.
- Reuse `packages/highway-react/src/components/ui` and `packages/highway-react/src/components/foundation/patterns.tsx`, feedback and status. Shared surface fixes belong in `packages/highway-styles/src/foundation.css`, button geometry in `packages/highway-styles/src/controls.css`.
- Apply scoped appearance to both a DOM container and ThemeScope; portaled controls must receive it. Preserve semantic status/focus colors independently of brand customization.
- Preserve values after failure, use immediate duplicate-submit guards and keep pending dialogs from dismissing. Only claim success after the domain operation confirms it.
- New shared patterns need real component examples covering long content, disabled, pending, failure, keyboard and mobile states. Never make a gallery-only copy of a production interaction.
- Run `npm run check:ui:full` for shared design changes, plus visible review of affected flows. Fix the owning layer when a guard fails; do not weaken assertions or add broad exemptions.
- Report unverified real-device keyboards, assistive technology and performance honestly. Tests remain delegated to gpt-6-luna with xhigh reasoning.

## Public component selection

- `catalog/components.json` is the canonical public export and showcase availability map. Update it when package exports or gallery entries change. See `catalog/README.md` for selection rules.
- Use exact package exports in consuming projects; preserve host behavior and brand through `HighwayTheme`. Internal source examples and demo-only compositions are not installable package APIs.
- Validate package changes with `npm run check:packages:clean`; this installs fresh tarballs outside the repository and checks types, production build, SSR and browser behavior.

## Application boundaries

- `apps/showcase` owns the guide, showcase and component previews. `examples/yardwork` owns the synthetic office demo. Both run without Cloudflare or authentication setup.
- Keep package runtime imports inside `packages/highway-react/src`; core styles belong to `packages/highway-styles/src`. Legacy files are compatibility shims; edit their canonical owners.
- Default `dev` starts docs; default `build` builds packages/docs/demo. Use `dev:starter` and `build:starter` for the optional root backend. Preserve compatibility routes and manual deployment.

## Application typography adoption

- Use the owner-approved eight-role scale from `docs/PACKAGES.md` for host content as well as packaged controls. Default UI is 14/20 at 400; dense tables use 13/20. Do not introduce another scale when branding.
- Apply `highway-type-{role}` or `data-highway-type` to custom content and map competing host styles. Preserve rem scaling, browser zoom, and editable phone input minimums.

- Analytics dashboards: tabular numeric figures; weights400/500/600 only; muted14px secondary labels; dense desktop tables13/20 with approximately40px rows that grow for content; primary KPI30px and secondary KPI24px. Use the packaged analytics helpers documented in `docs/PACKAGES.md`.

## Component craft preservation

- Highway canonical packages are the source of truth. Use original Invariant only as a historical comparison; never add a second runtime styling source.
- Preserve component-specific visible geometry, materials, emphasis, and timing. Do not force compact indicators, authored menus, or media controls into generic button dimensions or opaque surfaces.
- Complete type roles need explicit `highway-weight-*` emphasis when authored weight differs from the role default.
- Any shared CSS change must be checked against all affected component families visually. Keep keyboard, focus, reduced-motion, and host behavior fixes; visual restoration is not permission to roll back functional safeguards.
