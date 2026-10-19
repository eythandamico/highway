# Latest standalone demo validation — October 19, 2026

The owner-requested Yardwork demo extraction adds `/demo`, `/guide`, and `/showcase` while retaining the independent personal Cloudflare and GitHub configuration. No original Yardwork services or data were accessed.

- TypeScript, ESLint, semantic design checks, production build, and Storybook build passed.
- Existing Playwright foundation suite: 28 passed, 8 intentional matrix skips.
- Focused demo isolation tests: 3 passed, covering in-memory mutations, rejecting request/field transports, synthetic map coordinates, and demo photo-upload guards.
- Browser review compared the original and restored Today dashboard in light/dark; phone emulation reviewed navigation and a customer profile. The new showcase’s interactive button and theme toggle were checked.
- Production dependency audit: zero vulnerabilities. Full audit reports nine high findings in pre-existing development-tool dependency chains; none were introduced by the new production dependencies.
- Public OpenStreetMap tiles remain an intentional third-party asset source in the optional Route view. Live email, payments, customer messaging, and AI providers are not configured or verified. Real-device keyboards and assistive technology were not tested.

The following sections retain the earlier starter validation history.

# Validation

## October 19, 2026 — starter 0.2.0

Validation was run against the refreshed standalone folder, using gpt-6-luna with xhigh reasoning for test work. No deployment, paid API call or external email delivery was performed.

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Shared design guard | Passed: 107 application/shared component files and 8 stylesheets |
| Semantic token/contrast checks | Passed |
| Production application build | Passed; built Worker serves the app successfully |
| Storybook build | Passed |
| Playwright design suite | 28 passed; 8 project-specific skips |
| Narrow 320px / 200% heading regression | Passed: visible heading `scrollWidth` stays within `clientWidth` |
| Built effects CSS verification | Passed |
| Local Worker/API integration | Passed on final clean run |

The eight skips are intentional matrix routing: phone-only assertions skip desktop/reduced-motion projects, the 320px enlarged-text assertion skips other widths, and reduced-motion assertions run only in their dedicated project. They are not disabled failures. The suite exercises light/dark, desktop/390px/320px, enlarged text, reduced motion, control geometry (including one-character small buttons), form draft retention/pending dismissal, themed portals, native date entry, lazy calendar selection, nested Select/Calendar Escape behavior, Sheet dismissal and focus restoration. Static checks are not substitutes for rendered browser checks.

The API integration covers development OTP sign-in, tenant separation, viewer permissions, origin rejection, stale revision conflicts, record archive/list behavior and private upload/download/delete. Tests bind and request `127.0.0.1:5188`, while sending the configured `http://localhost:5188` Origin for trusted-origin coverage. This keeps test requests away from an unrelated IPv6 localhost development listener. Stop any process occupying the test's IPv4 endpoint before running the suite. Only the test's isolated `.wrangler/test-state` is reset.

A foreign-Origin check once received 500 instead of expected 403 during this pass. This same intermittent mismatch was recorded in the original starter validation. A direct authenticated reproduction returned the expected 403, and the final full API rerun passed without weakening the assertion or changing the backend. This remains an observed intermittent limitation rather than a claim that the issue was fixed.

## Regression fixes covered

- The calendar is loaded only when opened; its eager import caused a production-only SSR failure despite development/Storybook working.
- Nested selects/calendars stay within the parent modal focus boundary, and the shared dismissable-layer dependency resolves to one compatible instance. Escape dismisses the top layer before its parent.
- Menus/calendars render above their parent dialog. Dialog/sheet decorative layers do not blur/sample underlying page text.
- Shared headings have a zero minimum inline size and wrap long words; the 320px / 200% browser assertion catches clipped text that document-level overflow checks miss.
- Shared ordinary buttons enforce minimum width and height; the inline variant opts out explicitly.
- The integration harness fails promptly on server 500s and uses the intended IPv4 worker rather than another localhost listener.

Final screenshots are kept outside the package under `artifacts/validation-screenshots/`: `quality-lab-light-desktop.png`, `quality-lab-dark-desktop.png`, `quality-lab-narrow-320px-200pct.png`, and `quality-lab-dialog-settled.png`. The gallery uses synthetic examples only. Real mobile keyboards, screen readers, low-end-device performance, production email, remote D1/R2 and deployment are not verified. Vinext remains the pinned beta framework. This pass is not a fresh dependency-security audit.

## Reproduce

```sh
npm ci
npm run setup
npx playwright install chromium
npm run check:ui:full
npm test
npm run package
```

`npm test` requires the production build generated by `check:ui:full`. Packaging rebuilds `PACKAGE-MANIFEST.json` and the source ZIP, excludes credentials/local state/dependencies/test output, and includes the design context, guides and Playwright configuration. Archive verification checks hashes, required entries and excluded paths.

## Historical validation from the original starter

The following notes describe the earlier package, not additional checks performed on this refresh.


Run the checks from a clean checkout with Node.js 22.13 or newer:

```sh
npm ci
npm run setup
npm run typecheck
npm run lint
npm run build
npm run build-storybook
npm test
```

`npm test` expects the production build in `dist/server/wrangler.json`. It starts a local Wrangler Worker on port 5188, applies the D1 migrations to isolated local state, exercises the API against local D1 and R2, and then stops the Worker. Port 5188 must be free. The test resets only `.wrangler/test-state`; it does not use remote Cloudflare resources or send email. It uses two `.test` fixture users and BetterAuth's local console delivery to verify sign-in, workspace membership boundaries, viewer permissions, CSRF origin checks, optimistic revision conflicts, archive/list behavior, and private file upload/download/delete handling.

`npm test` also checks the built gallery CSS for matching standard and WebKit blur/mask declarations, all three masked blur layers, edge directions, gradients, unsupported-blur and reduced-transparency fallbacks, and reduced-motion rules. CI runs install, local setup, typecheck, lint, build, and `npm test` on Node.js 22.13.

Validation for the visual effects addition: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run build-storybook` passed. The first full `npm test` run hit one transient foreign-origin CSRF assertion (500 instead of 403); the standalone API integration rerun and a subsequent full `npm test` both passed. The CSS verifier reported 12 blur rules and 10 masked layers across the production stylesheets.

The local effects gallery was opened in Chrome for Testing. The rail recipe and left edge changed the preview and its code label; the foreground action incremented through the decorative overlay; the save toggle and StateIcon control changed state. DevTools responsive emulation was set to 390px, where the gallery remained rendered. DevTools showed the expected built blur tokens (4/10/20px and 2/6/12px for the panel recipe). This was a manual browser check, not a real-device test; because the browser window changed during the final theme check, dark-preview rendering and full computed-style sampling for every edge were not confirmed. The gallery's dark toggle is present, and all four edge directions are covered by the built CSS verifier.

The sign-in sheet was previously inspected in Chrome's iPhone 16 Pro Max emulation at 440×956. It was full-width and bottom-anchored (x=0, width=440, bottom=0); legal-page navigation was also checked. Real-device keyboard and assistive-technology behavior have not been tested. Real email delivery, remote D1/R2, and Cloudflare deployment have not been exercised. Vinext is a pinned beta dependency.

The production dependency audit on 2026-10-08 reported zero vulnerabilities after the dependency refresh. This is a point-in-time audit result, not a guarantee about future advisories.
