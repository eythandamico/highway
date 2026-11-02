# SegmentedControl

Tab switcher with sliding indicator animation. Supports text labels, icons, or both.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | `Array<{id, label?, icon?}>` | `[]` | Tab definitions |
| activeTab | `string` | — | Active tab id |
| onTabChange | `(id) => void` | — | Tab change callback |
| variant | `'default'\|'subdued'` | `'default'` | `default`: white bg + hover indicator. `subdued`: bg-alt track + raised white indicator |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<SegmentedControl
  tabs={[
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'archived', label: 'Archived' },
  ]}
  activeTab="all"
  onTabChange={setTab}
/>
```

## CSS Variables Used

`--inv-surface`, `--inv-heading`, `--inv-muted`, `--inv-nav-hover-bg`, `--inv-shadow-sm`, `--inv-accent`
