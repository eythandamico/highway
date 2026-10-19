# Checkbox

Single checkbox with optional label. Uses accent color when checked.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | `boolean` | `false` | Checked state |
| onChange | `function` | — | Called with new boolean |
| label | `string` | — | Label text |
| disabled | `boolean` | `false` | Disable checkbox |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`

## Usage

```jsx
<Checkbox checked={agreed} onChange={setAgreed} label="I agree to the terms" />
<Checkbox checked={darkMode} onChange={setDarkMode} label="Dark mode" />
```

## CSS Variables Used

`--inv-heading`, `--inv-accent`, `--inv-surface`, `--inv-shadow-sm`
