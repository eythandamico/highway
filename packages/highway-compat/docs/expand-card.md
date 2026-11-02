# ExpandCard

Card that expands to reveal content with blur-in animation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | — | Card header text |
| children | `ReactNode` | — | Expandable content |
| icon | `string` | — | Icon name in header |
| defaultExpanded | `boolean` | `false` | Start expanded |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<ExpandCard title="Details" icon="settings">
  Content revealed on click.
</ExpandCard>
```

## CSS Variables Used

`--inv-surface`, `--inv-heading`, `--inv-muted`, `--inv-body`, `--inv-shadow`, `--inv-shadow-sm`
