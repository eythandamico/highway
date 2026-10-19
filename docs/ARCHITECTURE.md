# Architecture and boundaries

## Three layers

**Foundation**: shared components, typography/theme, shell, session lifecycle, API errors, tenant authorization, storage boundaries and build tooling. Keep this small and stable.

**Product modules**: customers, schedules, documents or whatever the new app actually does. Each module should have domain types, pure business rules, persistence operations, route handlers and a screen. The generic records feature demonstrates this shape; it is not an all-purpose database design.

**External adapters**: email, SMS, maps, accounting and payments. Keep provider credentials, request signing, retry policy and delivery state outside screen components. Test adapters with fixtures, then verify configured providers separately.

## Request flow

1. The root layout asks Better Auth for the verified session before rendering account controls. No guest banner appears while the server already knows a user is signed in.
2. Protected pages load the verified user and authorized workspace, then deliver initial content with HTML.
3. Client screens initialize from that content rather than clearing it to refetch it immediately.
4. Mutations validate same-origin, session, workspace role, bounded input and business rules, in that order where practical.
5. D1 updates include workspace identity in their WHERE clauses. Record mutations compare revisions.
6. Responses use no-store for private routes. User-visible errors avoid database messages and credentials.

## Files and folders

- `app`: route composition, metadata, API endpoints and route-level states.
- `components/ui`: primitive controls; shared geometry and accessible behavior.
- `components/foundation`: shell, auth, account and example workspace screens.
- `lib`: server boundaries plus explicitly named client utilities. Type-only imports avoid pulling server modules into browser bundles.
- `db/auth-schema.ts`: Better Auth's Drizzle schema.
- `migrations`: the actual D1 schema source for the starter. Add new SQL migrations for product tables; no automatic schema reset.
- `worker`: response policy wrapper around the framework handler.
- `config`: non-secret product identity.

## Extension contracts

Authentication is exposed through `getUser` and `requireUser`; product modules should not depend on provider cookie details. Workspace authorization is exposed through `workspaceAccess`. A future switch to organizations must preserve those contracts and retest membership removal and role changes.

The new-account personal workspace ID is deterministic to make creation retry-safe. Workspace rows and membership rows are created in a D1 batch. Team membership management is not shipped: adding it requires invitation acceptance, owner invariants, role-change audit records and revocation tests.

The files module treats all content as private downloadable attachments. It is intentionally not an image-processing pipeline, public asset CDN or executable website host. Add those as separate policies rather than relaxing this endpoint.

## Things to remove when starting a product

Replace the illustrative home copy and records feature once real workflows exist. Keep the UI primitives you use; unused primitives are source files and do not enter a production bundle unless imported. Keep Storybook in development. Remove the public `/components` route before release if you do not want an online catalog.

## Things not bundled

Playground's Studio, sandbox runner, code editor, AI-agent protocol, remix graph, creator marketplace, project processor, deployment pipelines and artwork are product-specific and intentionally excluded. Their architecture can inform later modules; they are not hidden runtime dependencies of this starter.
