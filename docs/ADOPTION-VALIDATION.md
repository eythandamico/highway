# Adoption validation — October 21, 2026

> Historical report: versions, paths, and commands below record the audit at that time. For current installation use [PACKAGES.md](PACKAGES.md); for current checks use [SYSTEMS.md](SYSTEMS.md). Do not use historical commands as installation instructions.

Repository tooling for the Highway 0.2.2 local candidate was exercised against isolated temporary npm hosts. No existing user application was migrated or modified during this validation.

## Installer checks

Eight scenario groups passed:

- Preview creates no files and changes no host dependencies.
- React/React DOM 19.2.0 TypeScript host: actual package installation, generated TSX provider, strict typecheck, Vite production build and server render.
- React/React DOM 19.2.8 JavaScript host: actual installation, generated JSX provider, production build and server render.
- Styles-only host: actual installation and CSS build without React.
- Unsupported, mismatched and prerelease React versions: rejected before mutation.
- Existing Highway dependencies and generated-file collisions: refused without overwriting.
- Symlinked and dangling generated paths: refused.
- Simulated npm failure: original package manifest and lock restored, generated files removed. Empty directories can remain; node_modules may require resynchronization after an actual npm failure.

Host entry files, router fixture, deployment configuration and other host-owned files were checked for preservation. Lifecycle scripts were disabled during install. These are representative fixtures already wired to use the generated provider, not proof that an arbitrary existing application's migration is complete.

Targeted script syntax and ESLint checks passed. The package browser suite separately exercises host style isolation, themed portals, keyboard navigation, touch, typography and reduced motion; see PACKAGE-QUALITY-AUDIT.md for the runtime audit scope.

## Complete release gate

`npm run check:release:packages` passed after the installer work: release metadata, catalog/archive validation, clean installed-consumer strict types/build/SSR, 20 browser checks (37 expected project skips), all eight adoption scenarios, and generation of `artifacts/highway-0.2.2-manifest.json` with SHA-256 values. The minimal Button + Theme consumer still excludes the calendar graph (70,486 bytes JavaScript gzip, including React). No shared runtime or visual component changes were made in this adoption-tooling pass.

## Limits and acceptance in a destination project

The installer adds dependencies and integration files; it does not edit the host entry or automatically restyle existing markup. Follow the generated INTEGRATION.md and IMPLEMENTATION.md, then test the actual destination's business flows and computed styles.

Supported automated setup is standalone npm, stable matching React/React DOM ^19.2.0 or styles-only. Other package managers, monorepos, React 18, full Next.js integration, non-React component adapters, physical devices and real assistive technology require separate validation. CI configuration is updated locally; a successful remote CI run is not implied.
