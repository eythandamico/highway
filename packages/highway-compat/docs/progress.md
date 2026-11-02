# Progress

Linear progress bar with animated fill, optional label, value counter, shimmer effect, and three sizes.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `number` | `0` | Current value |
| max | `number` | `100` | Maximum value |
| label | `string` | — | Label text |
| showValue | `boolean` | `false` | Show percentage counter |
| size | `'small'\|'default'\|'large'` | `'default'` | Bar thickness |
| animated | `boolean` | `true` | Animate fill and counter |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Progress value={65} label="Upload" showValue />
<Progress value={100} label="Complete" size="large" />
<Progress value={30} size="small" />
```

## CSS Variables Used

`--inv-bg-alt`, `--inv-heading`
