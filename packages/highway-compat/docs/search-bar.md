# SearchBar

Styled search input with icon and keyboard shortcut badge.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | `string` | `'Search...'` | Input placeholder |
| shortcutKey | `string` | `'⌘K'` | Shortcut badge text |
| className | `string` | `''` | Additional CSS classes |
| onSearch | `(value) => void` | — | Called on input change |
| autoFocus | `boolean` | `false` | Auto-focus on mount |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<SearchBar placeholder="Search anything..." onSearch={(q) => filter(q)} />
```

## CSS Variables Used

`--inv-surface`, `--inv-heading`, `--inv-muted`, `--inv-bg-alt`, `--inv-border`, `--inv-outline`, `--inv-accent`
