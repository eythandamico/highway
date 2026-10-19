# PinInput

Row of individual digit boxes for 2FA/OTP codes. Auto-advances focus on input, supports paste, and arrow key navigation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| length | `number` | `6` | Number of digit boxes |
| value | `string` | `''` | Current value |
| onChange | `function` | — | Called with full string on change |
| error | `string` | — | Error message |
| disabled | `boolean` | `false` | Disable all inputs |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<PinInput value={code} onChange={setCode} />
<PinInput length={4} value={pin} onChange={setPin} error="Invalid code" />
```

## CSS Variables Used

`--inv-heading`, `--inv-surface`, `--inv-shadow-sm`, `--inv-shadow-sm-hover`, `--inv-accent`
