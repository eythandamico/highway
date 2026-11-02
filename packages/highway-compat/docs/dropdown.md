# Dropdown

Overflow menu with trigger button and 12 placement options.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| trigger | `ReactNode` | — | Custom trigger element (defaults to vertical dots button) |
| items | `Array<{label, icon?, danger?, onAction?} \| {divider: true}>` | `[]` | Menu items |
| placement | `string` | `'bottom-left'` | Menu position (see placements below) |
| className | `string` | `''` | Additional CSS classes |

### Placements

`bottom-left`, `bottom-center`, `bottom-right`, `top-left`, `top-center`, `top-right`, `left-top`, `left-center`, `left-bottom`, `right-top`, `right-center`, `right-bottom`

## Dependencies

- `lib/icon.jsx`
- `lib/popover.js`
- `lib/use-click-outside.js`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<Dropdown
  placement="bottom-right"
  items={[
    { label: 'Edit', icon: 'edit', onAction: () => {} },
    { divider: true },
    { label: 'Delete', icon: 'close', danger: true, onAction: () => {} },
  ]}
/>
```

## CSS Variables Used

`--inv-surface`, `--inv-muted`, `--inv-heading`, `--inv-nav-hover-bg`, `--inv-menu-bg`, `--inv-menu-text`, `--inv-menu-text-active`, `--inv-menu-hover-bg`, `--inv-menu-divider`, `--inv-menu-shadow`, `--inv-shadow-sm`, `--inv-shadow-sm-hover`, `--inv-accent`
