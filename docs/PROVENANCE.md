# Provenance and exclusions

Packaged on October 8, 2026. Shared UI components, typography, utility functions and auth schema were extracted from the user's Playground repository at main commit `e1b44965fd8a4554dfcad99ca8ea926b16dd6779`. The starter's configuration, shell, generic workspace/API example, auth wiring, email template and documentation were adapted separately for this package. Playground's working tree was not modified by this packaging task.

The Yardwork repository was inspected read-only to identify domain migration requirements. No Yardwork source or customer data is included. Its existing frontend is specifically not a design source for the rebuild.

The package is a new implementation artifact, not a release of Playground under a new license. Application code is for the owner's reuse; no blanket open-source license is newly granted here. The copied component sources originate from the existing shared UI library, which includes shadcn/Radix-based primitives and other dependencies. Preserve upstream notices and consult dependency licenses before public redistribution. The existing vendored Tailwind stylesheet's MIT notice is retained in `vendor/`.

Excluded: all Git history/remotes, node_modules, builds, logs, caches, local/remote databases, uploaded files, screenshots of private records, secrets, deployment account IDs, admin lists, production URLs/configuration, Playground logos/artwork, curated project images, hosted projects, AI-agent runtime and business-specific integrations.

`PACKAGE-MANIFEST.json` records relative file paths, byte sizes and SHA-256 values for the delivered archive. The archive creation script uses a source allowlist, not a recursive copy of the working directory. The inventory itself and local validation outputs are excluded from the content hash list to avoid recursion/accidental state inclusion.

Package-specific hardening updates Next and its lint configuration to 16.3.8, pins transitive sharp to 0.35.5 and the legacy esbuild helper to 0.28.2, and omits the unused Drizzle schema-generator tool. These changes are not applied to the source app.

The visual-layer correction additionally extracts original blur/mask/tint recipes, gradient geometry, avatar palette/hash/SVG patterns and missing shared control styling from the same source commit. Public component APIs and the demonstration gallery are adapted for this independent starter. Exact mapping and exclusions are recorded in `VISUAL-EXTRACTION-MAP.md`. No source artwork or Playground working-tree changes were introduced.

## October 19, 2026 foundation refresh

Adapted reusable design code and implementation contracts from `easy-launch-apps/yardwork` at `8271182a411ca5ff9fe25589492e518dbcb4eeb7`. These build on the starter's Playground foundation. Shared warm surface and avatar-rim recipes retain their source comments; no Shotcall/Yardwork artwork or mascot is bundled. Product selectors and field definitions were removed from extracted compositions. See STARTER-REFRESH.md for the exact included/excluded scope. Existing third-party license notices remain applicable. This provenance record is not a new license grant for unrelated product assets.

## Owner-authorized demo addition — October 19, 2026

The original exclusion of Yardwork product UI is superseded for the owner-requested standalone demo. Its client screens, synthetic fixtures, pure demo rules, and generated artwork are now included. No production services or customer data were imported. See `DEMO-EXTRACTION.md` for the exact boundary. Invariant supplied the guide/showcase reference, not runtime dependencies.
