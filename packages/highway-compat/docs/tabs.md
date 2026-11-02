# Tabs

Horizontal tab bar with sliding underline indicator. Supports optional count badges.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | `Array<{ id, label, count? }>` | `[]` | Tab definitions |
| activeTab | `string` | — | Active tab id |
| onTabChange | `function` | — | Called with selected tab id |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Tabs
  tabs={[
    { id: 'all', label: 'All', count: 24 },
    { id: 'active', label: 'Active', count: 12 },
    { id: 'archived', label: 'Archived' },
  ]}
  activeTab="all"
  onTabChange={setTab}
/>
```

## CSS Variables Used

`--inv-heading`, `--inv-muted`, `--inv-border`
