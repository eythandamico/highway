# TextInput

Text input with label, error state, disabled state, and optional leading icon. Uses `forwardRef`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Label above input |
| placeholder | `string` | `''` | Placeholder text |
| error | `string` | — | Error message (shows red ring) |
| disabled | `boolean` | `false` | Disabled state |
| icon | `string` | — | Leading icon name |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<TextInput label="Email" placeholder="you@example.com" icon="mail" />
<TextInput label="Website" error="Invalid URL" />
```

## CSS Variables Used

`--inv-heading`, `--inv-muted`, `--inv-surface`, `--inv-accent`, `--inv-shadow-sm`, `--inv-shadow-sm-hover`
