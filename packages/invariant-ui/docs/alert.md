# Alert

Inline notification banner with icon, title, description, and optional dismiss. Animates out on dismiss with scale + fade.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'info'\|'success'\|'warning'\|'error'` | `'info'` | Color variant |
| title | `string` | — | Alert heading |
| description | `string` | — | Secondary text |
| dismissible | `boolean` | `false` | Show dismiss button |
| onDismiss | `function` | — | Called after dismiss animation |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`

## Usage

```jsx
<Alert variant="success" title="Saved" description="Your changes have been saved." dismissible />
<Alert variant="error" title="Error" description="Something went wrong." />
```

## CSS Variables Used

`--inv-bg-alt`, `--inv-heading`, `--inv-muted`, `--inv-surface`, `--inv-accent`
