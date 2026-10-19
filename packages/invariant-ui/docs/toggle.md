# Toggle

On/off switch with spring thumb animation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | `boolean` | `false` | Toggle state |
| onChange | `(checked) => void` | — | Change callback |
| size | `'default'\|'small'` | `'default'` | Toggle size |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Toggle checked={on} onChange={setOn} />
<Toggle checked={on} onChange={setOn} size="small" />
```

## CSS Variables Used

`--inv-accent`, `--inv-border`
