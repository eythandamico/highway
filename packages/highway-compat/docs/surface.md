# Surface

Card/container with consistent elevation, radius, and padding.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| padding | `'none'\|'sm'\|'md'\|'lg'` | `'md'` | Inner padding |
| elevation | `'none'\|'sm'\|'md'` | `'sm'` | Shadow level |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Surface padding="md" elevation="sm">
  <h2>Card title</h2>
  <p>Card content</p>
</Surface>
```

## CSS Variables Used

`--inv-surface`, `--inv-shadow-sm`, `--inv-shadow`
