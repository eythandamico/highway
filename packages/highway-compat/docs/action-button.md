# ActionButton

Button that morphs from label to spinner to checkmark on action.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | `'Save'` | Button text |
| icon | `string` | — | Icon name shown before label |
| loadingDuration | `number` | `2000` | Loading time in ms |
| onAction | `() => void` | — | Called on click |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<ActionButton label="Save" icon="check" onAction={() => save()} />
```

## CSS Variables Used

`--inv-heading`, `--inv-bg`, `--inv-accent`
