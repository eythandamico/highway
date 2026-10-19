# Skeleton

Animated loading placeholder with variants for text, avatars, cards, and list items. Respects `prefers-reduced-motion`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'line'\|'circle'\|'card'\|'avatar-line'` | `'line'` | Skeleton shape |
| width | `number\|string` | — | Container width |
| height | `number\|string` | — | Container height (card variant) |
| lines | `number` | `3` | Number of lines (line variant only) |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
{/* Text placeholder */}
<Skeleton variant="line" lines={4} />

{/* Avatar placeholder */}
<Skeleton variant="circle" width={48} />

{/* Card loading state */}
<Skeleton variant="card" />

{/* List item placeholder */}
<Skeleton variant="avatar-line" />
```

## CSS Variables Used

`--inv-bg-alt`, `--inv-border`, `--inv-surface`, `--inv-shadow-sm`
