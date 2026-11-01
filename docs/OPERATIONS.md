# Setup and operations

## Personal Cloudflare deployment

This repository targets `Me@eythandami.co’s Account` (`2aebaf88ef9bbc427b720771d94a8efc`). Its resources are independent of Yardwork:

- Worker: `app-foundation`
- URL: https://app-foundation.winter-lake-b4eb.workers.dev
- D1: `app-foundation-db` (`293f31a0-b2e9-4b18-a377-9b794028f72b`)
- Private R2 bucket: `app-foundation-files`
- Repository: https://github.com/eythandamico/highway

`wrangler.jsonc` holds production bindings and public configuration. Local development uses ignored `.dev.vars` overrides with `APP_ENV=development`, `AUTH_DELIVERY=console`, and a matching local `SITE_ORIGIN`. The current local instance runs at `http://localhost:5190` with `npm run dev -- --port 5190`; a fresh setup defaults to port 5188.

The Worker uses a separately generated authentication secret. Live sign-in additionally requires `SENDGRID_API_TOKEN` and `FROM_ADDRESS` for a verified sender; these must be supplied as Worker secrets, never committed. Until both email secrets are configured, the live sign-in dialog shows a temporary availability message and the sign-in endpoints return 503. Local console-code sign-in remains available. Adding the email secrets restores the existing sign-in flow without a code change. No automatic deployment is configured. Publish manually after validation using `npm run build` followed by `npx wrangler deploy --config dist/server/wrangler.json`.

## Isolated environments

The starter has no source-app account IDs, domains, remote bindings or production secrets. Its placeholder D1 ID is for local development only. Every new app needs its own development, staging and production data boundaries. Never point this kit at Playground or Yardwork's existing storage as a shortcut.

Local: install, setup, migrate, dev. `.dev.vars` is generated with restrictive permissions and ignored by Git. Console email delivery is local only. If authentication says it is unconfigured, confirm setup was run. If pages report missing tables, apply local migrations. Use http://localhost:5188 consistently; 127.0.0.1 is a different origin. Stop a previous process before reusing that port.

## Manual production setup

1. Create a new Cloudflare Worker application, D1 database and private R2 bucket in the intended account.
2. Replace the generic names and placeholder database ID in wrangler.jsonc. Do not copy another app's bindings or routes.
3. Set APP_ENV=production, AUTH_DELIVERY=email and SITE_ORIGIN to the exact HTTPS origin.
4. Provision BETTER_AUTH_SECRET, SENDGRID_API_TOKEN and FROM_ADDRESS as private runtime settings. Verify the sender/domain through the email provider. Use a fresh high-entropy auth secret.
5. Apply append-only migrations to the intended remote database. Take a backup before later schema changes and verify the target account/database first.
6. Replace legal/support/brand text, review permissions and complete `docs/RELEASE-CHECKLIST.md`.
7. Run checks and build. Use the generated `dist/server/wrangler.json` when manually publishing this Vinext build, following your hosting setup.
8. Verify the actual deployed hostname: cookies, origin checks, redirects, private cache headers, real email delivery and all required integrations.

The package deliberately contains no automatic deploy workflow. `check:release` does not verify secrets, remote migrations, email sender approval or legal content; its scope is public configuration.

## Database evolution

Apply migrations in order. Never edit a migration already applied remotely. Existing auth tables use Drizzle's expected column mapping; new product modules can use parameterized D1 queries or a matching Drizzle schema. Keep schema ownership explicit. A migration should include indexes for tenant and sort predicates, constraints for valid states, and an upgrade/rollback plan.

Request-limit tables and expired auth records need scheduled cleanup in a real long-running app. Keep cleanup separate from customer-facing request latency and use bounded batches. Production scheduled tasks are not enabled in the starter.

## Diagnostics

Use correlation IDs and structured event names when adding observability. Do not log request bodies or raw provider payloads by default. Expose human-readable failure states in the UI, but keep stack traces server-side. Distinguish provider rejection, retryable transport failure and uncertain acceptance.

## Recovery

Keep the previous working build and known migration state. Roll back code independently of data only when schemas remain compatible. Test restores with synthetic data in staging. Back up both database records and object-storage policy; database restoration alone may not restore deleted files.

## Git and packaging

The delivered ZIP is allowlisted and includes a SHA-256 inventory. It excludes dependencies, build output, local databases, secrets, logs and Git history. After unpacking, initialize a new repository and commit the package. Run `npm run package` to create another clean archive after modifying it; inspect the inventory before distributing.

## Highway public site and example

The documentation site and synthetic Yardwork example deploy independently of the optional authenticated starter. They use the personal account above and have no D1/R2 bindings:

- `highway`: https://highway.winter-lake-b4eb.workers.dev
- `highway-demo`: https://highway-demo.winter-lake-b4eb.workers.dev/demo

Run `npm run deploy:demo` and `npm run deploy:showcase` after validation. These explicitly use each app's `vite.cloudflare.config.ts` and generated `dist/server/wrangler.json`; ordinary preview builds remain independent of Cloudflare. The site build regenerates versioned plugin ZIP downloads. Production links are configured in the deployment configs, and can be overridden with `HIGHWAY_DOCS_URL`/`HIGHWAY_DEMO_URL`.

Do not deploy the root starter configuration when publishing the Highway showcase. Skill licensing remains undecided; no new public reuse license is granted by this deployment.
