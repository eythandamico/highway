# Security and data boundaries

## Implemented boundaries

Better Auth verifies the session on the server. Email codes expire, are HMAC-hashed, limited in attempts and rotated on resend. Session cookies are HTTP-only with same-site protection; production requires HTTPS. The auth route exposes only the intended email-code/session/name/signout endpoints, checks the request origin and applies atomic D1 rate counters before auth POSTs. Better Auth's own rate limits remain enabled too.

Local console-code delivery requires development mode and a loopback canonical origin. Production configuration refuses console delivery. Console logs containing local codes stay out of the archive. Use a new secret and email sender for every app/environment.

Every record list/mutation and file operation verifies membership. The client may propose a workspace ID; that does not confer access. The default roles permit read-only access for viewers and writes for members/admins/owners. This generic policy is insufficient for an employee-versus-office-worker business policy—introduce explicit capabilities before onboarding real teams.

Mutating routes require an Origin matching SITE_ORIGIN. API errors are bounded and generic. JSON and upload bodies have enforced byte limits; records use bounded strings and server-generated IDs. File downloads are attachments with `nosniff`, no-store and no inline active content. A guessed file ID still requires current membership.

## Data lifecycle

Private records and attachments belong to a workspace. Removing a membership immediately blocks later authorized reads because membership is checked on each request. Deleting an object requires workspace write access. Add audit trails and stricter permissions if deletion should be owner-only.

The starter does not implement self-service account deletion, export, retention jobs, virus scanning, storage quotas per tenant, billing limits or recovery workflows. Before real customer use, define these policies and implement them. Uploads have per-request/rate limits, not a complete storage-billing control system. File listing shows the most recent 100; add pagination for larger workspaces.

A successful R2 write followed by a failed database insert triggers compensating deletion. Deletion failures and rare object/database inconsistencies still need operational reconciliation as usage grows. Treat backups and restore exercises as part of launch, not a later feature.

## Concurrency

Archive/restore uses an expected revision in the SQL predicate and returns 409 on stale writes. Do not “fix” this by ignoring the conflict and overwriting data. Reload current data, preserve the user's draft and provide an explicit resolution. For external effects use durable idempotency keys and state transitions, not optimistic UI flags.

## Deployment checks

All HTML uses private no-store because the root layout includes server-verified account state, even on public page URLs. Public static files remain eligible for normal asset caching. Worker headers set nosniff, framing restrictions, referrer policy, private no-store, private noindex and production HSTS. The CSP is deliberately a minimal framing/object/base policy, not a complete strict script policy. Add nonce-based script/style rules after inventorying actual integrations. Geolocation, camera and microphone are disabled by default; Yardwork's optional location feature needs an explicit policy change and permission UX.

Do not put secrets in NEXT_PUBLIC variables, config/app.ts, client imports, screenshots, git history or error strings. No analytics are included. If introduced, strip customer details, tokens, code payloads and file contents before collection.

## Threat-driven acceptance

Test unauthenticated requests, cross-user/cross-workspace reads and writes, viewer writes, forged origins, stale revisions, guessed file IDs, large bodies, duplicate submissions, code reuse/expiry, session expiry and signout. Use synthetic accounts and local delivery. Separate these from live provider acceptance testing.
