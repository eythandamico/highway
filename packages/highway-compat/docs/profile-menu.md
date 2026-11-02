# ProfileMenu

Avatar button with dropdown menu for profile actions.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| avatarUrl | `string` | — | Profile image URL (required) |
| profile | `{name, email}` | — | User info shown in menu |
| profileItems | `Array<{label, icon, onAction}>` | `[]` | Menu action items |

## Dependencies

- `lib/icon.jsx`
- `lib/popover.js`
- `lib/use-click-outside.js`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<ProfileMenu
  avatarUrl="/avatar.jpg"
  profile={{ name: 'Jane', email: 'jane@example.com' }}
  profileItems={[
    { label: 'Settings', icon: 'settings', onAction: () => {} },
    { label: 'Log out', icon: 'logout', onAction: () => {} },
  ]}
/>
```

## CSS Variables Used

`--inv-shadow`, `--inv-outline`, `--inv-accent`, `--inv-menu-bg`, `--inv-menu-text`, `--inv-menu-text-active`, `--inv-menu-hover-bg`, `--inv-menu-divider`, `--inv-menu-shadow`
