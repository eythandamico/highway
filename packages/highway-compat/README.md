# Highway compatibility imports

This directory contains source-level compatibility wrappers and archived reference documentation. It is not a separate runtime library or an installable package.

Canonical implementations live in `../highway-react/src/components`, shared helpers in `../highway-react/src/lib`, and styling in `../highway-styles/src`. Edit those owners. New applications import public APIs from `@highway/react` and `@highway/styles`.

The legacy Button wrapper still accepts `label`, `primary`, `danger`, and the original size names; it renders Highway's shared Button. Other wrappers likewise re-export or compose the canonical implementations. The `--inv-*` CSS aliases and existing showcase URLs remain compatible.

The reference documents in `docs/` record the original component APIs. Current guidance is in the [Highway package documentation](../../docs/PACKAGES.md) and [design contract](../../docs/DESIGN-SYSTEM.md).

## Upstream attribution

These wrappers and references originate from Invariant UI. Its [MIT license](LICENSE) and [integration history](../../docs/INVARIANT-INTEGRATION.md) are retained. This notice does not change Highway's licensing.
