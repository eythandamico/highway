# Invariant UI in App Foundation

This locally integrated copy supplies the styling system and specialized components for the unified Foundation library. The upstream MIT license is retained. See [integration notes](../../docs/INVARIANT-INTEGRATION.md) for provenance and changes.

## Use in this app

```tsx
import { Button, TextInput, SegmentedControl } from "@/components/library";

<TextInput label="Project name" placeholder="A new beginning" />
<Button onClick={saveProject}>Save project</Button>
```

The public Button uses children. The legacy `packages/invariant-ui/components/button.jsx` import continues to accept `label`, `primary`, `danger`, and the original size names. Both render the shared Button. Toggle similarly delegates to Switch; text-field wrappers use shared input primitives.

All 50 Invariant component APIs remain available. Explore the combined catalogue at `/showcase`, and the practical guide at `/guide`.

## Styling and reuse

`app/tokens.css` owns the Invariant palette, radii, shadows and motion. `app/typography.css` owns its rem type scale. This folder's `tokens/theme.css` maps the original `--inv-*` names onto those shared tokens. Change the canonical tokens rather than adding a second palette. The root supports `.dark` and `data-theme="dark"`.

This integrated copy depends on the Foundation project: do not copy only `tokens/theme.css` or a compatibility wrapper into another app. Reuse the starter, or bring the component's complete import graph and shared CSS owners (`tokens`, `typography`, `controls`, `foundation`, compatibility aliases). The app uses React 19, Tailwind 4, Radix and lucide-react; preserve the root lockfile. Original per-component API docs live in `docs/`.

The showcase's isolated documents import those same styles. Rebuild their assets with `npm run build:invariant`; development startup and production builds include this automatically.

## License

[MIT](LICENSE)

Checkbox and RadioGroup also delegate to the shared Radix primitives. Their Invariant selection artwork sits inside 44px targets; labels, keyboard selection, disabled state and form behavior use the shared implementations.
