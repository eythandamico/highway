# Dialog

Small centered confirmation popup with title, description, and action buttons. Closes on backdrop click and Escape key.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | `boolean` | — | Controls visibility |
| onClose | `function` | — | Called when dismissed |
| title | `string` | — | Heading text |
| description | `string` | — | Secondary text |
| actions | `ReactNode` | — | Action buttons (typically Button components) |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/popover.js`
- `lib/use-click-outside.js`
- `tokens/theme.css`

## Usage

```jsx
<Dialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Delete project?"
  description="This action cannot be undone. All data will be permanently removed."
  actions={
    <>
      <Button label="Cancel" variant="ghost" onClick={() => setShowConfirm(false)} />
      <Button label="Delete" variant="danger" onClick={handleDelete} />
    </>
  }
/>
```

## CSS Variables Used

`--inv-surface`, `--inv-shadow`, `--inv-heading`, `--inv-muted`
