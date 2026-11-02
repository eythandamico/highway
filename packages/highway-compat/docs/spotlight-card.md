# SpotlightCard

Card with cursor-following gradient glow effect.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | — | Card content |
| className | `string` | `''` | Additional CSS classes |
| spotlightSize | `number` | `300` | Glow radius in px |
| spotlightOpacity | `number` | `0.08` | Glow intensity |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<SpotlightCard className="w-64">
  <div className="p-5">
    <h3>Title</h3>
    <p>Content</p>
  </div>
</SpotlightCard>
```

## CSS Variables Used

`--inv-surface`, `--inv-accent`, `--inv-outline`, `--inv-shadow-sm`
