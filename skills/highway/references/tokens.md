# Highway tokens for the nine design passes

This replaces Unslop's generic token values. Read the installed Highway styles and MCP guidance for the exact version. Do not create a second palette, type scale or button geometry to satisfy an upstream example.

## Typography

Apply `highway-type-{role}` or `data-highway-type` to app content. Pixel equivalents at a 16px root:

| Role | Size / line height | Weight |
| --- | --- | --- |
| display | 30 / 36 | 600 |
| heading-xl | 24 / 32 | 600 |
| heading-lg | 18 / 28 | 600 |
| heading-md | 16 / 24 | 600 |
| body | 14 / 20 | 400 |
| body-sm | 13 / 20 | 400 |
| caption | 12 / 16 | 400 |
| micro | 11 / 16 | 500 |

Use supported weight utilities when emphasis differs. Primary content stays out of micro/caption roles. Preserve rem scaling and at least 1rem editable mobile inputs. Keep a real brand font; do not choose a novelty font merely to make the app different. Tabular numbers and consistent locale formatting serve comparison.

## Spacing and geometry

Use installed `--space-*` tokens, generally a four-pixel rhythm with two-pixel optical adjustments. Smaller gaps within groups than between them. Columns align icons, text baselines and numeric values. Rows grow for long content rather than clipping text to enforce identical heights.

Use shared Button sizes and radius tokens: xs 32/8, sm 36/10, default 44/12, lg 48/14 (height/radius pixel equivalents). Preserve accessible targets; don't shrink sidebar controls to match upstream's generic 32–36px recommendation. Component props own internal padding and icons. App CSS owns layout, width and external spacing.

For custom nested surfaces, derive inner radius from outer radius minus inset; do not override already-correct shared components. Use panel/control/pill tokens for the intended role rather than rounding everything equally.

## Color, surfaces and scope

Use installed semantic variables through `HighwayTheme`. Verify names from the installed stylesheet instead of guessing a token. Preserve a user's brand; keep status colors semantic. Warm neutral surfaces are Highway's default, not a mandatory recoloring of existing products.

Prefer spacing and quiet separators before cards. Secondary buttons and raised surfaces use shared elevation. Retain Highway's intentional glass, gradient artwork, true avatar cutouts and filled status icons where chosen. Do not replace those with opaque borders or generic flat controls. Check dark mode and portaled content in the same theme scope.

## Layout

Choose proportions from content and workflow, not a fixed dashboard recipe. A sidebar needs enough width for its labels; a data view needs room for comparison; a short form may be a narrow column. On mobile, preserve reading order and usable controls. Do not squeeze a desktop screenshot down to fit.

## Motion

Use component-provided transitions first and installed duration/easing tokens for custom state changes. Preserve purposeful springs, resizing, number roll and copied feedback. Avoid duplicate animations, arbitrary loops and layout shifts during feedback. Respect reduced motion and interrupted transitions. Check actual motion, not only a settled screenshot.

For further component-specific rules, read [design-decisions.md](design-decisions.md). Upstream reference images demonstrate composition and craft, not values or implementations to copy.
