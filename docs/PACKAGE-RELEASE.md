# Package release procedure

This procedure is for @highway/react and @highway/styles. The optional application's database/auth/deployment checklist is separate in RELEASE-CHECKLIST.md. See [adoption validation](ADOPTION-VALIDATION.md) for the installer evidence and limits.

1. Record changes under Unreleased in CHANGELOG.md. Before distributing changed package bytes, choose a new matching version for both package manifests, the React styles peer, catalog, consumer dependencies and documentation. Never overwrite a distributed version.
2. Create docs/releases/VERSION.md with status, changes, migration steps, compatibility, verification limits and rollback. Changelog is the cumulative record; release notes are the short consumer upgrade guide.
3. Run npm ci and install Playwright Chromium. Run npm run check:release:packages. This validates metadata, fresh archives/consumer behavior, adoption safety and supported React endpoints. Shared design/runtime changes also require npm run check:ui:full and visible review. CI runs the relevant checks without publishing.
4. Rebuild npm run package after final documentation. The release gate writes artifacts/highway-VERSION-manifest.json with matched tarball sizes and SHA-256 values; archive it with the notes. Commit consumer lockfiles. The source ZIP is a maintainer distribution, not a required consumer dependency.
5. Exercise the actual destination application's business flows. Automated isolated fixtures cover representative adoption, not every application. Record unverified real devices, assistive technology and framework integrations.
6. Only distribute/publish/deploy on an explicit release request. Mark notes distributed only when that action succeeds. Registry scope ownership and private-source permissions must be established before registry publication.

Supported runtime: stable matching React/React DOM ^19.2.0, ESM. CI tests the minimum 19.2.0 and the locked 19.2.8 endpoint; that is not a promise that every future 19.x release was tested. CSS-only installation has no React dependency. Use the manual guide for non-npm package managers and monorepos.

## Companion MCP release

When shipping the agent-facing companion, install its locked dependencies with `npm ci --prefix packages/highway-mcp --ignore-scripts`, then run `npm run pack:mcp`. This rebuilds the UI declarations and MCP snapshot, runs protocol and outside-repository package tests, and packs the companion. Run the existing UI release gate as well when UI packages change. Bump `packages/highway-mcp/package.json` and its lockfile for subsequent companion releases, including updated bundled guidance. See [MCP maintenance](MCP.md).
