# Toast

Notification toasts with stacking card deck effect. Uses context provider pattern.

## Components

### ToastProvider

Wrap your app to enable toasts.

### useToast

Hook returning `{ addToast, dismissToast }`.

`addToast(title, { message?, icon?, duration? })` — returns toast id.

## Props (addToast options)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | — | Toast title (first arg) |
| message | `string` | — | Secondary text |
| icon | `string` | `'check'` | Icon name |
| duration | `number` | `3000` | Auto-dismiss time in ms |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
// Wrap app
<ToastProvider>
  <App />
</ToastProvider>

// In any component
const { addToast } = useToast()
addToast('Saved', { message: 'Changes saved successfully' })
```

## CSS Variables Used

`--inv-surface`, `--inv-heading`, `--inv-muted`, `--inv-shadow`, `--inv-outline`
