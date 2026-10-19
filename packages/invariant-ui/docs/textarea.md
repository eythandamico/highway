# Textarea

Multiline text input with optional auto-grow, character count, label, and error state.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Input label |
| placeholder | `string` | `''` | Placeholder text |
| value | `string` | — | Controlled value |
| onChange | `function` | — | Change handler |
| maxLength | `number` | — | Character limit (shows counter) |
| rows | `number` | `3` | Visible rows (ignored when autoGrow) |
| autoGrow | `boolean` | `false` | Auto-expand height to fit content |
| disabled | `boolean` | `false` | Disable input |
| error | `string` | — | Error message |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Textarea label="Bio" placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} />
<Textarea placeholder="Notes..." autoGrow value={notes} onChange={(e) => setNotes(e.target.value)} />
```

## CSS Variables Used

`--inv-heading`, `--inv-muted`, `--inv-surface`, `--inv-shadow-sm`, `--inv-shadow-sm-hover`, `--inv-accent`
