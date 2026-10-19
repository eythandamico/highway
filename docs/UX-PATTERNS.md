# Interaction patterns to keep

## Account transitions

Render the server-known user immediately. A login shouldn't reveal guest content, blank the existing grid or remount unrelated screens. The root shell stays mounted while the responsive sign-in dialog is open. A single CSS-responsive dialog avoids briefly showing a desktop form before replacing it with a mobile sheet.

Signout calls the server while the current screen stays visible; after success a fresh public document clears account-specific state. Failure stays on the current page and gives a retryable message. Don't optimistically claim the session is revoked.

The phone sign-in sheet has centered branding and welcome copy, a compact form, substantial lower padding and a real translucent overlay showing the page underneath. Input font sizes prevent iOS focus zoom without disabling user zoom. Verify with an actual mobile keyboard; desktop emulation cannot prove every keyboard behavior.

## Loading without jumps

Use initial server content, reserve media dimensions, and retain visible data while refreshing. Distinguish initial loading from refreshing, empty, failed and unauthorized states. Aborting obsolete requests and guarding response order prevents old filters or sessions from replacing newer state. Don't silently replace a failed response with an empty result list.

The records screen submits search explicitly and cancels obsolete reads. For live search, introduce a short debounce, retain a clear busy state and test rapid typing/back-navigation. Keep pagination and filters in URLs when shareable navigation becomes a product requirement; this demo uses local controls.

## Forms

Use visible labels, appropriate autocomplete/inputMode, bounded values and server validation. Keep entered data on errors. Prevent duplicate submission, announce result messages and move attention to the actual field needing repair. Disclosures containing invalid fields must open before focus moves into them. Multi-step workflows should preserve draft values when switching steps.

## Overlays

Reuse Radix focus trapping and restoration. Escape and outside click behavior should be predictable; destructive or unsaved workflows may require a specific discard action. For a dialog that becomes a phone sheet, use `DialogContent mobileSheet`. Desktop centering transforms are applied only at the desktop breakpoint; do not rely on `transform: none` to cancel Tailwind individual translate utilities. Bottom sheets must scroll within the visible viewport and respect safe-area insets. Do not block browser zoom, hide background content entirely, or stack multiple independent backdrops.

## Touch and keyboard

Nothing important should exist only on hover. Mobile row actions should remain available without dominating the content. Icon glyphs may be small; target areas should remain roughly 44px on touch devices. Keyboard focus must be visible. Use actual links for navigation and buttons for actions. Label icon-only actions and announce asynchronous results without excessive live-region chatter.

## Domain truth

Draft, requested, accepted by provider, delivered, read, approved, paid and completed are different states. A provider's HTTP 200 is not proof of delivery. A user clicking Save isn't proof of payment. Keep reversible drafts separate from external side effects and irreversible transitions.

## Time and money

For Yardwork, a job date is not always a UTC timestamp. Store business timezone explicitly; use date-only fields for intended calendar days and UTC instants for actual events. Store currency and integer minor units. Handle DST changes, partial payments, cancelled work and historical document snapshots deliberately.

## Shared forms and record details

Use `Fields` for consistent labels, IDs, hints and errors; `FormDialog` adds save state, a synchronous duplicate-submit guard, error focus and draft retention. `maxLength` bounds text; `min`, `max`, `step` apply to numeric/date controls. Always validate again at the API. Remount a form when its record identity changes. Use `Confirm` for an explicit reviewed action, with specific result-oriented wording.

`Input type="date"` retains a real date input and adds the shared calendar. `NativeSelect` retains a form select while rendering a themed trigger/listbox; multi-select and list-size controls remain native. Labels must target the visible trigger's ID. Avoid nested forms or duplicate field names.

`Modal` can accept a related-details sidebar. Keep main actions before facts, notes and other context; on narrow screens context follows the record. Pending saves block Escape, outside clicks and close buttons. Explicit `onOpenChange`/cancel handlers must also respect pending state; the content primitive cannot override a parent forcibly unmounting it.

## Onboarding and access truth

A new owner should see a deliberate setup/empty state. A teammate awaiting an invitation must not silently receive owner access. Distinguish account identity, workspace membership, employee assignment and field access. Present actual service readiness: configured, verified, pending activation, failed and unavailable are different. A copied invitation link is not an emailed invitation, and a saved preference is not a connected integration.

## Recovery and navigation continuity

Retain visible content during refresh, cancel stale reads and preserve draft input after failures. Use SectionBoundary around optional lazy features so navigation survives a rendering error. Its reload action clearly warns about losing unsaved entries. For future page-memory support, persist only view preferences under the signed-in account/workspace, not open dialogs or in-flight actions. Clear private state at identity boundaries.
