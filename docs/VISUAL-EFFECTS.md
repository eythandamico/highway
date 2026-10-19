# Visual effects guide

Open `/components/effects` in the running starter, or run `npm run storybook` and open **Foundation / Visual effects**. The gallery demonstrates light/dark surfaces, all four blur directions, three blur recipes, a scrolling header, edge fades, media controls, deterministic avatars and animated state icons. Its generated artwork is illustrative; no Playground artwork is bundled.

## Import and ownership

```tsx
import { ProgressiveBlur } from "@/components/visual/progressive-blur";
import "@/components/visual/visual-effects.css";
```

Import the opt-in stylesheet in the component or layout that owns the effect. `visual-guide.css` styles the demonstration only; do not import it into product screens. Shared controls still depend on the foundation's global typography and control styles. The effects use `--surface`, `--surface-muted`, light/dark color scheme and `--fx-surface-rgb`. Set the latter to the RGB channels of the actual canvas when rebranding; a white fade on a colored canvas creates an obvious seam.

## Genuine progressive blur

A progressive blur is three independently masked backdrop layers plus a translucent tint. It blurs content behind the surface at increasing strengths. A gradient alone only fades color; `filter: blur()` blurs the element and its children. Neither substitutes for this pattern.

`ProgressiveBlur` accepts `recipe="header" | "rail" | "panel"`, `edge="top" | "bottom" | "left" | "right"`, `className` and `style`. The edge names the opaque/strong end; the effect fades toward the opposite end. The component is decorative, aria-hidden and pointer-transparent. Give its parent a bounded size and positioned stacking context; put controls above it.

```tsx
<header className="sticky-header">
  <ProgressiveBlur recipe="header" edge="top" />
  <div className="header-controls">Your toolbar</div>
</header>
```

```css
.sticky-header { position: sticky; top: 0; z-index: 20; isolation: isolate; }
.sticky-header > .fx-progressive { bottom: -36px; }
.header-controls { position: relative; z-index: 1; padding: 16px 24px; }
```

The header must have content behind it as the page scrolls. An opaque background covering that content makes the effect look like a flat gradient. Avoid applying opacity/filter to ancestors without checking how they change backdrop sampling and stacking. Keep the fade above scrolling content and below the toolbar.

| Recipe | Blur layers | Layer masks / tint |
| --- | --- | --- |
| Header | 4 / 10 / 20px | Opaque through 65 / 40 / 10%; transparent at 100 / 85 / 65%. Tint alpha .88 → .72 at 48% → .36 at 76% → 0. |
| Rail | 4 / 10 / 20px | Opaque through 60 / 35 / 10%; transparent at 100 / 85 / 65%. Tint .96 → .82 at 50% → .36 at 76% → 0. |
| Panel | 2 / 6 / 12px | Inverse-direction masks: transparent → opaque at 45%; transparent through 25% → opaque at 75%; transparent through 50% → opaque at 100%. |

These values preserve the source recipes. Header and rail masks differ intentionally. Panel top tint uses surface → 70% surface at 55% → transparent. Panel bottom uses the source composer tint: transparent → 65% surface at 65% → solid surface.

### Header, rail and composer placement

- Sticky header: extend the decorative fade 36px below the toolbar. Controls remain sharp above it.
- Desktop rail: use `recipe="rail" edge="left"`; extend the layer 24px to the right of the rail. When navigation moves to the bottom on mobile, use `edge="bottom"` and extend 24px upward. Change direction with responsive composition rather than rotating live controls.
- Composer: use `recipe="panel" edge="bottom"`; extend its background 64px above the input area. Reserve scroll padding equal to the composer height plus 24px so the last message stays reachable.
- Information header: use `recipe="panel" edge="top"`; extend its background 24px below the header.

Use the gallery's scrolling-header example as an executable reference. The effect does not implement sticky navigation, hide-on-scroll logic, keyboard avoidance or scroll-padding measurement for you.

## Soft gradient surfaces

```tsx
import { GradientSurface } from "@/components/visual/gradient-surface";
<GradientSurface variant="onboarding" className="your-panel">...</GradientSurface>
```

Variants: `onboarding` (120° pale tint to surface at 60%), `upload` (125° tint to surface at 65%), `profile` (115° three pale blue stops), and `stage` (radial ellipse at 50% 35%, resolving to surface by 70%). These are original visual recipes adapted to semantic dark-mode surfaces. Supply your own spacing, borders and typography. The component only owns the background.

Use gradients for depth or identity, not as a default decoration on every card. Product branding can change the light colors; preserve contrast and a clear hierarchy. Dark variants deliberately become quieter rather than inverting colors.

## Edge fades

```tsx
import { EdgeFade } from "@/components/visual/edge-fade";
<div style={{ position: "relative", overflow: "hidden" }}>
  <YourDecorativeRibbon />
  <EdgeFade axis="horizontal" />
</div>
```

Both edges fade toward the canvas; the central 19–81% stays transparent. A vertical variant is available. Use for decorative ribbons or overflow hints, not over input values, required labels or focus rings. The overlay cannot receive clicks. Provide visible scrolling controls or another clear affordance when the contents are interactive.

## Media scrims and glass controls

`MediaScrim` adds the source dark gradient over media (almost clear at the top, 50% around 35%, 96% at the bottom). Place text as a sibling with `fx-media-foreground`, not inside the scrim. `softness` adds an optional 8px backdrop blur; touch devices turn that off.

```tsx
import { MediaScrim } from "@/components/visual/media-scrim";
<div className="fx-media-frame">
  <img src="/your-artwork.webp" width={800} height={600} alt="..." />
  <MediaScrim />
  <div className="fx-media-foreground">Your caption</div>
</div>
```

Your layout must position the caption where the scrim is dark enough. Test the actual artwork; this recipe does not guarantee contrast for arbitrary placement. `.image-action` on a shared Button supplies a 44px circle, dark translucent fill, white border/ink, 10px backdrop blur and visible focus ring. Keep essential mobile actions visible in a compact footer. `.fx-hover-reveal` / `.fx-hover-detail` is for optional supporting detail and supports focus-within; it never hides the detail on touch.

`fx-image-outline` provides a subtle inset boundary. `fx-overlay` supplies a 6px dialog backdrop recipe; do not blur the dialog's text. These are CSS effects, not image processing: source artwork remains intact and no image compression is performed by this layer.

## Gradient identity

```tsx
import { GradientAvatar } from "@/components/visual/gradient-avatar";
<GradientAvatar identity={user.id} label={user.name} size={48} />
```

The original stable hash chooses one of twelve palettes. Three radial SVG blooms form the avatar without a canvas or GPU renderer. Use a persistent opaque identity, not a mutable display name. Preserve palette order and the hash algorithm if existing identities must retain their appearance. A supplied label exposes an image name; without it the image is decorative. Unique SVG IDs allow many avatars on one page. Uploaded photos remain a separate image path.

## Shadows and state transitions

`fx-elevated` uses the source's three soft shadow layers, not a single heavy shadow. `StateIcon` now includes its required shared CSS: outgoing/incoming icons use opacity, scale and a small blur over 300ms. Without this stylesheet the copied component is incomplete. Keep one accessible button label that describes the current action, and use pressed state for toggles. The gallery includes a play/pause example. Reduced motion removes transition/filter animation.

## Accessibility, browser support and performance

- Standard and WebKit-prefixed backdrop-filter and mask-image declarations are paired. Inspect built CSS: source declarations alone are not sufficient evidence after minification.
- Reduced transparency disables backdrop blur and supplies solid surfaces. Reduced motion is a separate preference; it removes animation, not automatically all transparency.
- Unsupported blur falls back to opaque surfaces. Forced-colors mode removes decorative masks/scrims and uses system surface/control colors.
- Decorative layers have no focus targets, no accessible reading content and no pointer events. Foreground controls need normal labels, keyboard focus and sufficient touch area.
- Blur only narrow headers, rails, composer edges or small controls. Avoid stacking multiple large blurred surfaces, animating blur radius continuously, or adding will-change everywhere.
- Keep synthetic demos out of product bundles unless explicitly rendered. Import the reusable effects only where used.
- Verify narrow phones, touch, long labels, light/dark mode, reduced motion/transparency, forced colors and Safari on a physical device before release. Emulated checks do not replace real-device rendering and keyboard tests.

See `VISUAL-EXTRACTION-MAP.md` for source correspondence and deliberate boundaries; see `VALIDATION.md` for checks actually completed.
