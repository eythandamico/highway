# PromptBar

Multi-line prompt input with model selector, file upload, mic with voice visualizer, and send button.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | `string` | `'Ask anything...'` | Input placeholder |
| models | `Array<{id, label, description?, icon?}>` | `[]` | Model options |
| activeModel | `string` | — | Selected model id |
| onModelChange | `(id) => void` | — | Model change callback |
| onSubmit | `(text) => void` | — | Send callback |
| onUpload | `() => void` | — | Upload button callback |
| onMicPress | `() => void` | — | Mic button callback |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `lib/popover.js`
- `lib/use-click-outside.js`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<PromptBar
  models={[
    { id: 'sonnet', label: 'Sonnet 4' },
    { id: 'opus', label: 'Opus 4' },
  ]}
  activeModel="sonnet"
  onModelChange={setModel}
  onSubmit={(msg) => send(msg)}
/>
```

## CSS Variables Used

`--inv-surface`, `--inv-heading`, `--inv-muted`, `--inv-accent`, `--inv-border`, `--inv-nav-hover-bg`, `--inv-menu-bg`, `--inv-menu-text`, `--inv-menu-text-active`, `--inv-menu-hover-bg`, `--inv-menu-shadow`, `--inv-shadow-sm`
