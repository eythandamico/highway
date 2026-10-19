# SplitPane

Resizable two-pane layout with a draggable divider and pull tab. Supports horizontal and vertical splitting.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| left | `ReactNode` | — | Content for the first pane |
| right | `ReactNode` | — | Content for the second pane |
| direction | `'horizontal'\|'vertical'` | `'horizontal'` | Split direction |
| defaultSplit | `number` | `50` | Initial split percentage (0-100) |
| minSize | `number` | `20` | Minimum pane size as percentage |
| height | `number\|string` | — | Container height |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<SplitPane
  left={<div className="p-4">Left pane</div>}
  right={<div className="p-4">Right pane</div>}
  height={400}
/>

<SplitPane
  direction="vertical"
  left={<div className="p-4">Top pane</div>}
  right={<div className="p-4">Bottom pane</div>}
  height={500}
  defaultSplit={30}
/>
```

## CSS Variables Used

`--inv-bg-alt`, `--inv-muted`, `--inv-heading`
