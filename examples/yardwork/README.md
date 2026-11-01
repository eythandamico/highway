# Yardwork reference demo

From the repository root, run `npm ci` then `npm run dev:demo`. Open http://localhost:5191/demo. Build with `npm run build:demo`; output stays in this example's `dist` folder.

The original office screens and synthetic domain state live under `src/components/yardwork` and `src/lib/yardwork`. The demo has no sign-in or live transport. Changes are in-memory and reset on reload; no customer messages, payments or uploads are sent.

Shared UI comes from Highway's package-owned source. `HIGHWAY_DOCS_URL` configures the guide/showcase links; the default is http://localhost:5190. This is a repository example with shared installation/tooling, not a separate repository or deployment.
