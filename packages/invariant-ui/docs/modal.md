# Modal

Larger content container with header, close button, and scrollable body. Closes on backdrop click and Escape key.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | `boolean` | — | Controls visibility |
| onClose | `function` | — | Called when dismissed |
| title | `string` | — | Header text |
| children | `ReactNode` | — | Modal body content |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `lib/popover.js`
- `lib/use-click-outside.js`
- `tokens/theme.css`

## Usage

```jsx
<Modal
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
  title="Settings"
>
  <div className="flex flex-col gap-4">
    <TextInput label="Display name" placeholder="Your name" />
    <TextInput label="Email" placeholder="you@example.com" />
    <div className="flex justify-end gap-2 pt-2">
      <Button label="Cancel" variant="ghost" onClick={() => setShowSettings(false)} />
      <Button label="Save" variant="primary" onClick={handleSave} />
    </div>
  </div>
</Modal>
```

## CSS Variables Used

`--inv-surface`, `--inv-shadow`, `--inv-heading`, `--inv-muted`, `--inv-nav-hover-bg`
