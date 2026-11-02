# Badge

Pill label with three variants: dark, subdued, and outline.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Badge text |
| variant | `'dark'\|'subdued'\|'outline'` | `'dark'` | Visual style |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Badge label="Active" variant="dark" />
<Badge label="Pending" variant="subdued" />
<Badge label="v2.1.0" variant="outline" />
```

## CSS Variables Used

`--inv-heading`, `--inv-bg`, `--inv-bg-alt`, `--inv-border`
