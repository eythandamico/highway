# Release checklist

Use this as an acceptance list, not evidence that checks have been performed. See VALIDATION.md for actual package results.

## Configuration and ownership

- New app name, mark, origin, storage bindings and secrets; no source-app identifiers.
- Public legal/support content replaced and reviewed for the actual product.
- Production refuses console OTP delivery, uses HTTPS and verified sender.
- Database migrations applied to the correct environment; backup/restore verified.

## Accounts and boundaries

- Guest → code request → code verification → signed-in workspace, mobile and desktop.
- Wrong/reused/expired code, resend, rate limit and expired session.
- Signout completes without intermediate page; failed signout remains recoverable.
- Two users cannot read/write each other's records or files by changing IDs.
- Viewer writes fail; removed membership loses access; forged Origin fails.
- No private HTML/API caching; no secrets or private details in public metadata/logs.

## Data and files

- Create/search/page/archive/restore; empty and no-result states.
- Stale revision rejects overwrites; busy buttons prevent duplicate operations.
- Upload/download/delete, empty/oversized file, rejected network and revoked access.
- Retention, quotas, export, deletion and audit policy implemented for actual users.

## Interface

- Narrow 320px, typical phone, tablet, desktop and 200% zoom.
- Real iOS/Android keyboard: input remains readable and reachable; no focus zoom.
- Keyboard focus, Escape, sheet close, focus restoration and screen-reader labels.
- Dark/system theme, reduced motion, long names, dates, large amounts and error copy.
- No unintended horizontal overflow or hidden hover-only controls.

## Performance and delivery

- Build/type/lint/tests on a clean checkout with lockfile.
- Cold/warm guest and signed-in loads measured on representative data.
- Feature chunks deferred; image quality verified, not sacrificed for a score.
- Real deployment checks for headers, session cookies, email and provider callbacks.
- Error monitoring, rollback, restore and migration ownership established.
- Manual approval before deployment or outbound customer actions.

## Consistency gate

- Run `npm run check:ui:full` and review the actual affected screen plus the shared lab.
- Review light/dark, 320/390/wide viewports, enlarged text, keyboard focus/restoration and reduced motion.
- Verify opaque overlays, portaled accent tokens, 44px actions, long text wrapping and field errors.
- Confirm pending forms cannot submit twice or dismiss and failures preserve values.
- Check changed colors for contrast; semantic status colors must survive brand customization.
- Keep credentials/local state out of the archive and regenerate the manifest/ZIP after final changes.
