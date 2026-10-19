# SearchToggle

Square icon button that morphs into a full search input on click.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | `string` | `'Search anything...'` | Input placeholder |
| shortcutKey | `string` | `'⌘K'` | Shortcut badge text |
| onSearch | `(value) => void` | — | Called on input change |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `lib/use-click-outside.js`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<SearchToggle onSearch={(q) => filter(q)} />
```

## CSS Variables Used

`--inv-surface`, `--inv-heading`, `--inv-muted`, `--inv-nav-hover-bg`, `--inv-bg-alt`, `--inv-shadow-sm`
