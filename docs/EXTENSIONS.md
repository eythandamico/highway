# Extension recipes — not connected features

This document distinguishes reusable engineering patterns from working modules. The starter includes accounts, workspace membership checks, records and private attachments. The following are **design/implementation recipes**, not enabled services.

## Team invitations and workspace switching

Add invitations with a cryptographically random token stored as a hash, intended email, workspace, role, expiry, inviter and consumed timestamp. Require sign-in with the invited email and atomically consume the invitation. Owner/admin rules must be explicit; never let an admin remove the final owner. Audit membership changes. List workspaces from verified memberships; changing the active workspace must clear old query state and private caches.

Yardwork employees may be assigned to a job without having login access. Model crew assignment separately from account membership. Office-only financial fields should be filtered server-side, not merely hidden in the UI.

## Notifications and activity

Start with an append-only domain-event or activity table scoped to workspace and actor. Separate events from per-user read state and delivery attempts. Provide mark-read and pagination, avoiding a growing unbounded JSON array. Toasts are immediate UI feedback; they are not a durable notification system.

For email/SMS, store template/version, recipient consent, request key, status, provider ID, timestamps and bounded diagnostic information. Draft/review/send should be distinct operations. Keep unsubscribe/contact preferences and cooldown rules on the server.

## Public sharing and approvals

Use random high-entropy public tokens whose hashes are stored with scope, expiry and revocation. Share a frozen document snapshot; do not unintentionally publish a live mutable workspace. Public routes expose only that snapshot, not account data. Accepting/declining must be idempotent, check current state and produce an audit record. Signing or approving a quote and actually booking a job are separate transitions.

## Provider connectors and webhooks

Use adapters with typed request/result contracts, timeouts and bounded retries. Validate webhook signatures against raw bodies, reject stale/replayed events, store provider event IDs for deduplication and reconcile uncertain outcomes. Don't interpret the presence of a token as proof that a connection works. Never fetch arbitrary user-provided webhook URLs without an SSRF policy.

## Billing and financial records

Payment provider acceptance is not payment settlement. Store ledger-like immutable events for payment, refund and adjustment, with currency and integer minor units. Calculate totals server-side. Don't conflate manually marked paid, invoice sent and provider-confirmed paid. Do not reuse a source app's payment products, webhook secrets or accounts.

## Scheduling and background work

Use an outbox plus jobs with lease/claim state, retry count, next attempt and a stable idempotency key. Crash-safe work needs durable state, not a component effect or a timer in an open browser. UI reminder refreshes are not unattended scheduled jobs. Decide timezone behavior before implementing recurring work or daylight-saving transitions.

## Offline field work

Start by caching safe app assets, then design read-only offline access with a clear data-retention policy. Offline mutation queues need client IDs, ordering, server revisions, retry backoff, conflict resolution and visible pending/failed states. Never silently replay a customer message or charge after connectivity returns.

## Search and analytics

Use tenant-indexed server search first. Add full-text search when real query patterns justify it. Derive aggregate metrics from authoritative domain events, not client guesses. Don't fill dashboards with decorative numbers. Limit access to financial/team summaries by capability.

## Maps, files and rich media

Maps should be a lazy module with a useful list fallback. Explicitly enable geolocation only after consent and only when needed. Upload photos through private authorization; validate/strip metadata and create safe display derivatives in a separate pipeline. Malware scanning and public media delivery are not included in the starter.

## Optional Playground concepts

The shared component library includes chat bubbles, attachment and scrolling primitives, charts, tables, calendars and command menus. Those are rendering tools; AI providers, business integrations, notification services and payment backends remain separate work. Executable project hosting, remixing and agent connections are outside the generic foundation.

## Lessons validated in Yardwork, to implement deliberately in a new app

These remain extension contracts, not shipped starter endpoints.

**Invitations:** bind tokens to intended verified email, workspace and capability; store only hashes, expiry and audit metadata. Replacement invalidates the previous token. Recheck inviter authority and active target in the acceptance transaction. Cancellation/expiry must take effect at acceptance. Replaying an already accepted invitation must never re-grant subsequently removed access. Keep ordinary staff records distinct from login permissions.

**Native clients:** reuse web tokens/components when the platform supports them, but give credentials, storage, transport, camera and push explicit platform adapters. Use versioned, bounded DTOs filtered server-side by capability; hiding fields in the client is not access control. Native bearer sessions should expire, be revocable and be restricted to the intended API. Web writes still enforce exact origin; avoid wildcard credentialed CORS. Native Keychain/Keystore storage must not silently fall back to unencrypted browser storage.

**Offline actions:** persist the exact action before submission; retries reuse the same ID and body. Transactionally commit the domain change and receipt. Reject the same ID with a different payload. Stop on stale revisions; never silently rebase changed records or show queued work as confirmed. A conservative one-pending-action-per-workspace policy is appropriate until multi-action reconciliation is designed. Partition caches/outboxes by origin, user and workspace and clear them on signout or known access loss. Explain that an offline device cannot instantly learn remote revocation.

**Services:** separate platform-owned credentials from tenant configuration. Show setup prerequisites and readiness without exposing secrets. Store durable delivery attempts and provider IDs, verify webhooks against raw signed payloads and deduplicate events. A request accepted by a provider is not final delivery; manual payment marking is not a charge. Background work requires a durable claim/retry/recovery path and explicit activation.

**Onboarding:** establish owner workspace deliberately, accept team access through verified invitations, and keep empty states truthful. Never seed plausible customers, transactions or metrics into a new production account to make it look complete.
