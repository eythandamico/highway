# AgentAvatar

Circular avatar with deterministic mesh gradient generated from name. Supports thinking and inactive states.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | `string` | — | Agent name (used for gradient generation and tooltip) |
| avatarUrl | `string` | — | Optional image URL |
| size | `number` | `40` | Avatar size in px |
| state | `'default'\|'thinking'\|'inactive'` | `'default'` | Visual state |
| onClick | `() => void` | — | Click handler |

## Dependencies

- `lib/popover.js`
- `tokens/theme.css`

## Usage

```jsx
<AgentAvatar name="Nova" size={48} state="thinking" />
```

## CSS Variables Used

`--inv-accent`, `--inv-nav`, `--inv-nav-text-active`, `--inv-shadow`, `--inv-outline`
