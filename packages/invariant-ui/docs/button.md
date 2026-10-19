# Button

Standard button with variants, sizes, icons, and loading state. Uses `forwardRef`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Button text |
| variant | `'primary'\|'secondary'\|'ghost'\|'danger'` | `'primary'` | Visual variant |
| size | `'small'\|'default'\|'large'` | `'default'` | Button size |
| iconLeft | `string` | — | Icon name on the left |
| iconRight | `string` | — | Icon name on the right |
| disabled | `boolean` | `false` | Disabled state |
| loading | `boolean` | `false` | Shows spinner |
| onClick | `() => void` | — | Click handler |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<Button label="Save" variant="primary" iconLeft="check" />
```

## CSS Variables Used

`--inv-heading`, `--inv-bg`, `--inv-surface`, `--inv-nav-hover-bg`, `--inv-accent`, `--inv-shadow-sm`
