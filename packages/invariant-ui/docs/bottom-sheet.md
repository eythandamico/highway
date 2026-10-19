# BottomSheet

iOS-style bottom sheet with pull-to-dismiss, viewport shrink effect, and backdrop. The page scales down and rounds its corners when the sheet opens.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | `boolean` | — | Controls visibility |
| onClose | `function` | — | Called when dismissed (backdrop click, escape, or pull down) |
| title | `string` | — | Header text |
| children | `ReactNode` | — | Sheet content |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<BottomSheet
  isOpen={showSheet}
  onClose={() => setShowSheet(false)}
  title="Settings"
>
  <div className="flex flex-col gap-4">
    <p className="inv-body">Sheet content goes here.</p>
    <Button label="Done" onClick={() => setShowSheet(false)} />
  </div>
</BottomSheet>
```

## CSS Variables Used

`--inv-bg`, `--inv-surface`, `--inv-heading`, `--inv-border`, `--inv-shadow`
