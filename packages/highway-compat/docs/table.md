# Table

Data table with sortable columns, row selection, and hover highlighting. Uses subdued bg-alt background.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | `Array<{ key, label, sortable?, render? }>` | `[]` | Column definitions. `render(value, row)` for custom cells |
| data | `Array<object>` | `[]` | Row data keyed by column keys |
| selectable | `boolean` | `false` | Enable row checkboxes |
| onSelectionChange | `function` | — | Called with array of selected indices |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`

## Usage

```jsx
<Table
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', render: (v) => <Badge label={v} /> },
  ]}
  data={[
    { name: 'Alice', role: 'Engineer', status: 'Active' },
    { name: 'Bob', role: 'Designer', status: 'Away' },
  ]}
  selectable
/>
```

## CSS Variables Used

`--inv-bg-alt`, `--inv-surface`, `--inv-heading`, `--inv-muted`, `--inv-accent`, `--inv-shadow-sm`
