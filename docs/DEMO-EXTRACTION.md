# Standalone Yardwork demo and library

On October 19, 2026, the owner explicitly requested the original Yardwork demo appearance and interactions in this personal standalone application, plus an Invariant-inspired guide and component showcase.

## Routes

- `/demo`: original Yardwork office screens, navigation, charts, forms, account artwork, and Ask launcher, using `demoSuite()` synthetic fixtures.
- `/guide`: usage, local setup, component ownership, theming, agent instructions, and deployment guide.
- `/showcase`: searchable live component previews with source locations and copyable usage examples.
- `/components/foundation` and `/components/effects`: existing detailed quality lab and effects reference.
- `/examples/records`: the earlier generic browser-only records example.

## Copied and preserved

The client dependency closure of Yardwork’s `Office` and `demoSuite` was copied from the owner’s local source. It includes the office feature components, pure domain/demo rules, original generated identity artwork and orb renderers, and required client-side types. Shared starter components and accessibility fixes remain authoritative. Missing original material tokens were added without replacing the starter’s newer tokens. The added packages are Zod, Leaflet, and the Visx chart packages, with pinned versions and Leaflet types.

Invariant’s showcase and documentation were read as a reference for the searchable catalog, live preview/code layout, and human/agent instructions. The new pages render this project’s own components and styles; Invariant runtime code and assets were not imported.

## Isolation

The office provider is deliberately demo-only. `request()` rejects; `refresh()` performs no network requests; `mutate()` applies local domain actions in component memory. The field-service adapter also rejects. No Yardwork API routes, production adapter credentials, database content, storage objects, deployment identifiers, Git history, or environment files were copied. Synthetic fixtures never enter D1 or R2.

The original demo guards remain for photo upload and service setup. Actions such as sending a quote, paying an invoice, or booking work only simulate the demo flow. The optional Route view preserves public OpenStreetMap tiles and attribution with example stop coordinates; it does not connect to Yardwork or a paid routing service. External documentation and search links only navigate when chosen by the visitor.

Changes reset on a full reload. The original page-memory behavior retains navigation/scroll state within the mounted demo. Account-menu links lead to the guide and showcase and label this as a standalone demo. The generic starter’s real workspace remains separately authenticated and live email sign-in remains unavailable until configured.

## Ownership and release

Repository: `eythandamico/app-foundation-starter` (private).
Cloudflare account: `2aebaf88ef9bbc427b720771d94a8efc`.
Worker: `app-foundation`; database: `app-foundation-db`; private bucket: `app-foundation-files`.

Deployment is manual, using the generated production Worker config. Original Yardwork and Invariant source projects were read but not modified.
