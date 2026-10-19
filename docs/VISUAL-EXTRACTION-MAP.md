# Visual extraction map

Source: Playground main `e1b44965fd8a4554dfcad99ca8ea926b16dd6779`, inspected read-only. This correction adds the visual layer missing from the first standalone package. It does not claim that every product stylesheet or animation is portable unchanged.

| Source | Standalone destination | Treatment |
| --- | --- | --- |
| `app/globals.css`, `.gallery-topbar-glass` | `components/visual/progressive-blur.tsx`, `visual-effects.css`, header recipe | Original 4/10/20px layers, mask stops and tint; edge generalized. |
| `app/interface.css`, `.gallery-rail-glass` | ProgressiveBlur rail recipe | Original rail masks/tint; horizontal and vertical placement documented. |
| `app/interface.css`, composer backdrop and information header | ProgressiveBlur panel recipe | Original 2/6/12px layers and top/bottom tint variants; parent supplies size/position. |
| `app/interface.css`, ribbon edge fade | `edge-fade.tsx` | Original fade stops; optional vertical axis. |
| `app/globals.css`, onboarding/upload/profile/workspace surfaces | `gradient-surface.tsx` | Original gradient geometry/colors; dark values mapped to starter semantic surfaces. |
| `app/globals.css`, gallery media details | `media-scrim.tsx` | Source scrim, optional 8px blur, touch fallback. |
| `app/controls.css`, image-action | `visual-effects.css`, `.image-action` | Source circle, translucent fill, blur, border and focus styling. |
| Source dialog backdrop | `.fx-overlay` | Reusable 6px blur/tint recipe, opt-in. |
| `lib/avatar-identity.ts` | `lib/gradient-identity.ts` | Stable palette/hash implementation copied. |
| `components/playground/profile-images.tsx`, DefaultAvatar | `gradient-avatar.tsx` | Original three SVG radial blooms; generic label/size interface. |
| `app/controls.css`, StateIcon | `app/controls.css` | Required icon animation CSS restored beside the existing primitive. |
| Source shared control support | `app/controls.css` | Disabled InteractiveSurface, notices, optical play adjustment and code syntax tokens. |
| Source layered elevation | `.fx-elevated` | Three-layer shadow recipe. |

The gallery at `/components/effects` and `stories/VisualEffects.stories.tsx` are new independent examples. They demonstrate the effects with synthetic artwork, not customer projects. The starter's ordinary pages remain deliberately restrained; including a style does not mean applying it indiscriminately across every surface.

## Product-specific modules not bundled

The WebGL refractive discovery ribbon, vinyl sticker peel shaders/textures and manifesto scroll choreography are not general-purpose app primitives. They depend on Playground's art direction, assets, curated project data and page structure. This package includes their broadly reusable edge-fade, gradient, media and motion principles, but **not** those complete effects. Logos, artwork and hosted projects remain excluded.

If the new product later needs one of these modules, port it as a separate feature with its own source review: replace project data with a typed public interface; supply properly licensed artwork; isolate the renderer behind a lazy import; pause it when offscreen or the page is hidden; dispose GPU resources on unmount; provide a static reduced-motion/context-loss fallback; and measure it on a real phone. Keep the ordinary app navigation and forms independent of renderer success. Do not copy the entire Playground stylesheet to recover one effect.

## What this package is and is not

It is a reusable implementation foundation plus visual recipes and executable guides. It is not a pixel-identical Playground clone, a full migration of all Playground business logic, or a finished Yardwork redesign. New routes, public content, domain schemas, permissions and legal text still need product-specific implementation and review. The complete UI primitive inventory is in `COMPONENT-INVENTORY.md`.
