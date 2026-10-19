# Select

Classic dropdown select with label, slide animation, and checkmark on selected option.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Label above the select |
| options | `Array<{id, label}>` | `[]` | Options list |
| value | `string` | — | Selected option id |
| onChange | `(id) => void` | — | Change callback |
| placeholder | `string` | `'Select...'` | Placeholder text |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `lib/popover.js`
- `lib/use-click-outside.js`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<Select
  label="Model"
  options={[
    { id: 'sonnet', label: 'Sonnet 4' },
    { id: 'opus', label: 'Opus 4' },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

## CSS Variables Used

`--inv-heading`, `--inv-muted`, `--inv-surface`, `--inv-accent`, `--inv-shadow-sm`, `--inv-shadow-sm-hover`, `--inv-menu-bg`, `--inv-menu-text-active`, `--inv-menu-hover-bg`, `--inv-menu-shadow`
