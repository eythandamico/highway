# Control-family refinement

Validated October 28, 2026 against the local 0.3.0 React/styles release candidate. No deployment or publication is included.

## Changes

| Before | After | Reason |
| --- | --- | --- |
| Segmented control used independent timed easing and compact targets | Shared travel tokens, 44px targets and derived inner corners | Consistent geometry without losing Highway's character |
| Indicator assumed a single horizontal row | Measures each option's position and size, including wrapping and font resize | Long labels and narrow layouts retain accurate selection |
| Slider used absolutely positioned label and value | Content-aware layout, wrapped label and tabular value | Prevents text overlap |
| Additional touches could interrupt an existing slider gesture | One active pointer owns the drag and its ending | Predictable touch interaction |
| Keyboard selection could retain pointer animation | Immediate keyboard feedback and reduced-motion handling | Functional navigation remains responsive |
| Disabled and hover treatments varied | Shared disabled opacity for actions/selection, readable disabled fields, fine-pointer hover rules | Related states remain deliberate across the family |

The warm neutral surfaces, blue selection accent, original slider fill, switch artwork, glass material and inherited motion character remain. No dependencies were added. The family review surface is showcase-only; it is not shipped in the core packages.

## Review surface

Open `/components/family`, linked from the showcase, or Storybook **Foundation / Control family**. It renders canonical package components. Light/dark controls, a 200% scale control, long labels and explicit disabled/pending/error examples support future reviews.

Screenshots: `artifacts/validation-screenshots/family-light.png`, `family-dark.png`, and `family-narrow.png`. Light/dark were reviewed in the running browser; saved light/narrow captures were also inspected. The 320px capture shows all selection content inside the viewport.

## Validation

- Final `verify`: passed after the review-wrapper semantic correction; 111 contracts, 101 declaration modules, lint/boundaries/catalog and four systems tests. Example lockfile integrity matches both fresh 0.3.0 package archives.

- Focused family tests: six passed, ten project-applicability skips. Covers native segmented activation and disabled options, selection accessible names, minimum targets and wrapping, slider keyboard/pointer operation, reduced motion and active-pointer ownership.
- Full UI gate: typecheck, lint, design guards/contrast, starter and Storybook builds passed; 34 browser cases passed, 18 expected project-applicability skips.

- Clean package gate: fresh archive/catalog validation, external dependency install, consumer types/production build, minimal-import build and SSR passed; 36 consumer browser cases passed, 60 expected project-applicability skips.
- MCP gate: build and all eight tests passed; the local MCP archive was refreshed with the new contracts and guidance.
- Local development recovery: long-running showcase servers became unresponsive during validation. The stale checkout-owned processes were restarted; browser checks then completed. This is a development-server recovery, not a component regression. The preview was checked for HTTP 200 afterward.

The final review wrapper uses a div within the showcase layout's existing main landmark to avoid nested main elements; its layout and control implementation are unchanged.

## Adoption notes

SegmentedControl adds optional `label`, `disabled`, and per-option `disabled` props. Existing controlled callbacks remain unchanged. Its larger usable targets can increase the height of dense host toolbars; review those layouts during adoption. It remains a group of native pressed buttons rather than an ARIA tablist.

These checks do not certify physical-device keyboards, assistive technology, every host integration, or all remaining library components. There are 102 inventoried legacy style exceptions outside this refinement. Install matching React/styles artifacts and validate the host's actual workflows before release.
