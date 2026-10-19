# Row

Horizontal layout with alignment and wrapping.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| gap | `'xs'\|'sm'\|'md'\|'lg'\|'xl'` | `'md'` | Gap between children |
| align | `'start'\|'center'\|'end'\|'stretch'\|'baseline'` | `'center'` | Vertical alignment |
| justify | `'start'\|'center'\|'end'\|'between'\|'around'` | `'start'` | Horizontal distribution |
| wrap | `boolean` | `false` | Allow wrapping |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Row justify="between">
  <span>Label</span>
  <Toggle checked={on} onChange={setOn} />
</Row>
```

## CSS Variables Used

None directly — uses Tailwind flex utilities.
