# Card

Content card with two variants: default (optional header image) and gradient (full generative gradient background with white text).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| image | `string` | — | Header image URL (default variant only) |
| title | `string` | — | Card heading |
| description | `string` | — | Secondary text |
| children | `ReactNode` | — | Additional body content |
| variant | `'default'\|'gradient'` | `'default'` | Card style |
| gradientSeed | `string` | — | Seed for gradient generation (falls back to title) |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
{/* Default with image */}
<Card
  image="/cover.jpg"
  title="Project Alpha"
  description="A brief description."
/>

{/* Gradient variant */}
<Card
  variant="gradient"
  gradientSeed="unique-name"
  title="Project Alpha"
  description="White text on generative gradient background."
/>
```

## CSS Variables Used

`--inv-surface`, `--inv-shadow-sm`, `--inv-heading`, `--inv-muted`
