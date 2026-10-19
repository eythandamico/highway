# Overlay

Fullscreen backdrop with black tint and blur. Used behind dialogs, modals, and other floating layers.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | `boolean` | — | Controls visibility and pointer events |
| onClick | `function` | — | Called when backdrop is clicked |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Overlay isOpen={showModal} onClick={() => setShowModal(false)} />
```

## CSS Variables Used

None (uses hardcoded `black/40` for the tint).
