# Menu, MenuItem, MenuDivider

Composable menu primitives for building dropdown menus, context menus, and action lists.

## Exports

- `Menu` — rounded container with menu background and shadow
- `MenuItem` — individual action row with icon, label, optional description and selection state
- `MenuDivider` — horizontal separator line

## Props

### Menu

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | — | MenuItem and MenuDivider elements |
| className | `string` | `''` | Additional CSS classes |

### MenuItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Item text |
| icon | `string` | — | Icon name from `lib/icon.jsx` |
| danger | `boolean` | `false` | Red danger styling |
| description | `string` | — | Secondary text below label |
| selected | `boolean` | `false` | Shows checkmark |
| onClick | `function` | — | Click handler |
| className | `string` | `''` | Additional CSS classes |

### MenuDivider

No props.

## Dependencies

- `lib/icon.jsx`
- `lib/popover.js`
- `tokens/theme.css`

## Usage

```jsx
<Menu>
  <MenuItem icon="edit" label="Edit" onClick={handleEdit} />
  <MenuItem icon="copy" label="Duplicate" onClick={handleDuplicate} />
  <MenuDivider />
  <MenuItem icon="close" label="Delete" danger onClick={handleDelete} />
</Menu>
```

## CSS Variables Used

`--inv-menu-bg`, `--inv-menu-shadow`, `--inv-menu-text`, `--inv-menu-text-active`, `--inv-menu-hover-bg`, `--inv-menu-divider`, `--inv-accent`
