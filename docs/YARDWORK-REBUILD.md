# Yardwork rebuild map

## Intent

Use Yardwork as a functional specification and business-rule reference. **Do not port its existing frontend composition, CSS, dashboard decoration or navigation.** Build a new interface with the Playground-derived components and interaction rules in this package.

Reference repository: https://github.com/Templecrash/yardwork (private; inspected read-only). Its README describes a gardening-business office with schedules, customers, quotes, invoices, team assignments and follow-up reminders. The package includes no customer data or copy of that repository.

## Separate identity migration from visual rebuilding

Yardwork currently uses Sites authentication and user-keyed workspace JSON with revisions. This starter uses Better Auth and normalized workspace memberships. That is **not** a drop-in auth/database swap. Decide whether to retain Sites initially or migrate to standalone accounts. If migrating, create a verified mapping from old user identity to new account/workspace, preserve document ownership and validate counts/relationships before enabling writes. Never match private ownership solely by a browser-supplied email.

Keep the old deployment unchanged during the rebuild. Use a new staging database/bucket and synthetic fixtures. A data migration, if later authorized, needs backups, dry-run reports, reconciliation and a cutover/rollback plan.

## Suggested information architecture

- Today: next jobs, unresolved issues and actions needing attention. Prioritize useful work over a decorative summary dashboard.
- Schedule: week/day views, job details, crew filtering and route context.
- Customers: searchable customer/property list, contact permissions, notes and history.
- Money: quotes and invoices as clear separate tabs, with document detail/review flows.
- Team and Settings: crew availability, assignments, business identity and integrations.

Validate mobile navigation with actual field workflows. Avoid showing all of these as equal prominent actions in every toolbar. The foundation shell is illustrative, not a final Yardwork navigation design.

## Preserve and adapt these domain areas

| Yardwork sources | Preserve | Rebuild around |
| --- | --- | --- |
| `lib/yardwork.ts`, `lib/workspace-server.ts` | Actions, validation, optimistic revision behavior | Typed module services and explicit workspace boundaries |
| `lib/customer-followups.ts`, `tests/customer-followups.mjs` | Contact consent, cooldowns, snooze/followed-up rules | Customer detail and a focused follow-up queue |
| `lib/lead-outreach.ts`, `lib/social-leads.ts`, `tests/day-leads.mjs` | Day capacity, outreach eligibility, privacy constraints | A deliberate find-work flow with reviewed drafts |
| `lib/business-documents.ts`, `lib/document-delivery.ts`, `lib/request-quotes.ts` | Totals, immutable snapshots, delivery state, approval semantics | Quote/invoice editor and review sheet |
| `lib/booking-approvals.ts`, `lib/booking-sms.ts`, `lib/booking-store.ts` | Verified approval before booking, conflict protection | Clear customer response and office confirmation states |
| `lib/team.ts`, `lib/schedule-capacity.ts` | Crew assignments, availability and workload | Compact schedule rows and job sheets |
| `lib/route-map.ts`, `lib/traffic.ts`, `lib/weather.ts` | Provider boundaries, optional location and fallbacks | Lazy-loaded map; schedule usable without it |
| `lib/chat-photo-store.ts`, `lib/chat-photos.ts` | Private authorization and attachment validation | Shared attachment/file components |
| `lib/service-connectors.ts`, `lib/connector-contract.mts` | Explicit configured adapters and honest status | Settings panels, not implied universal sync |

These paths are migration pointers from inspection, not copied modules in this kit. Read the source and tests before porting logic; don't recreate edge cases from a screenshot.

## Keep honest service boundaries

Yardwork payments are manually recorded; don't relabel them as provider-confirmed payments. Its Ask surface has guided commands/image attachments, not a connected general AI service. Follow-up reminders prepare drafts; they are not automatically sent. Native integration parity and full two-way sync are not implemented. The rebuilt interface must not imply otherwise.

Outbound messages and financial actions need review and explicit authorization. Use fixtures and mocked providers while rebuilding. Preserve Twilio signature verification, quote public-token boundaries, tenant scoping and document delivery idempotency when those integrations are migrated.

## Implementation sequence

1. Inventory routes, actions, permissions, data shapes, documents and provider state. Run existing domain suites against synthetic fixtures.
2. Establish product navigation, typography, density and responsive layouts using the new components. Keep the original frontend out of the import graph.
3. Build read-only Customers and Schedule views against an adapter. Validate long names, empty days, large lists and poor networks.
4. Port mutations one module at a time, preserving tests and expected revision behavior. Add cross-tenant and role-based checks.
5. Rebuild quotes/invoices with snapshot/review states before enabling delivery or approvals.
6. Add maps, attachments, connectors and notifications as lazy optional modules with honest unavailable states.
7. Audit mobile keyboard, safe areas, keyboard focus, zoom, private caching, cold/warm load and failure recovery.
8. Plan any identity/data migration and release separately. Do not deploy or send customer messages as part of visual development.

## Definition of done

A field worker can find today's job, read the correct property notes, record an allowed update and see whether it saved. An office user can locate a customer, create/review a quote, understand its delivery/approval state and manage invoices without guessing. Permissions hold under direct API requests; no stale page silently overwrites newer work; no customer data appears in another workspace. Screens are usable on a phone with the keyboard open, at 200% zoom and with reduced motion.
