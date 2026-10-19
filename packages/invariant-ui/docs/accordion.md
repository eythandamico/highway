# Accordion

Collapsible content sections with blur-in animation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `Array<{title, content}>` | `[]` | Accordion items |
| multiple | `boolean` | `false` | Allow multiple open sections |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<Accordion items={[
  { title: 'Section one', content: 'Content here' },
  { title: 'Section two', content: 'More content' },
]} />
```

## CSS Variables Used

`--inv-heading`, `--inv-body`, `--inv-muted`, `--inv-border`
