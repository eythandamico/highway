# IconButton

Square button with a single icon. Two sizes, optional elevation via shadow.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | `string` | — | Icon name from `lib/icon.jsx` |
| label | `string` | — | Accessible label (aria-label) |
| size | `'small'\|'default'` | `'default'` | Button size (36px or 44px) |
| elevated | `boolean` | `false` | Adds shadow for raised appearance |
| onClick | `function` | — | Click handler |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`

## Usage

```jsx
{/* Flat */}
<IconButton icon="edit" label="Edit" />

{/* Elevated */}
<IconButton icon="plus" label="Add" elevated />

{/* Small */}
<IconButton icon="close" label="Close" size="small" />
```

## CSS Variables Used

`--inv-surface`, `--inv-muted`, `--inv-heading`, `--inv-accent`, `--inv-nav-hover-bg`, `--inv-shadow-sm`, `--inv-shadow-sm-hover`
