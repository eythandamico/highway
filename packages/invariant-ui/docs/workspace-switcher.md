# WorkspaceSwitcher

Displays current workspace with dropdown to switch between workspaces.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| currentStartup | `{name, slug, initials, color, avatarUrl?}` | — | Active workspace |
| startups | `Array<{name, slug, initials, color, avatarUrl?}>` | `[]` | All workspaces |
| onStartupChange | `(slug) => void` | — | Switch callback |

## Dependencies

- `lib/icon.jsx`
- `lib/popover.js`
- `lib/use-click-outside.js`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<WorkspaceSwitcher
  currentStartup={{ name: 'Acme', initials: 'AC', color: '#6366f1', slug: 'acme' }}
  startups={workspaces}
  onStartupChange={setSlug}
/>
```

## CSS Variables Used

`--inv-heading`, `--inv-muted`, `--inv-accent`, `--inv-shadow`, `--inv-outline`, `--inv-menu-bg`, `--inv-menu-text`, `--inv-menu-text-active`, `--inv-menu-hover-bg`, `--inv-menu-divider`, `--inv-menu-shadow`
