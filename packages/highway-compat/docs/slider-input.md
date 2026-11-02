# SliderInput

Progress-bar style range slider with a draggable divider, label on the left, and value on the right. The filled portion represents the current value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Label text (displayed left side) |
| value | `number` | `0` | Current value |
| onChange | `function` | — | Called with new number |
| min | `number` | `0` | Minimum value |
| max | `number` | `100` | Maximum value |
| step | `number` | `1` | Step increment |
| suffix | `string` | `''` | Unit suffix after value (e.g. `'px'`, `'%'`) |
| disabled | `boolean` | `false` | Disable slider |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<SliderInput label="Width" value={width} onChange={setWidth} min={0} max={500} suffix="px" />
<SliderInput label="Opacity" value={opacity} onChange={setOpacity} min={0} max={1} step={0.01} />
```

## CSS Variables Used

`--inv-bg-alt`, `--inv-surface`, `--inv-muted`, `--inv-heading`, `--inv-shadow-sm`
