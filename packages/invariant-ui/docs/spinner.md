# Spinner

Animated loading circle. Inherits `currentColor` for stroke color.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `number` | `20` | Width and height in pixels |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css` (for Tailwind `animate-spin`)

## Usage

```jsx
{/* Inline in a button */}
<Spinner size={16} />

{/* Standalone */}
<Spinner size={24} className="text-[var(--inv-accent)]" />
```
