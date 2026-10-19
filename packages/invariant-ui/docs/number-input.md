# NumberInput

Numeric input with +/- stepper buttons, min/max bounds, and step size.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Input label |
| value | `number` | `0` | Current value |
| onChange | `function` | — | Called with new number |
| min | `number` | — | Minimum value |
| max | `number` | — | Maximum value |
| step | `number` | `1` | Increment/decrement step |
| disabled | `boolean` | `false` | Disable input |
| error | `string` | — | Error message |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`

## Usage

```jsx
<NumberInput label="Quantity" value={qty} onChange={setQty} min={0} max={99} />
<NumberInput value={temp} onChange={setTemp} step={0.5} />
```

## CSS Variables Used

`--inv-heading`, `--inv-muted`, `--inv-surface`, `--inv-shadow-sm`, `--inv-shadow-sm-hover`, `--inv-accent`
