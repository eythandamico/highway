# Stack

Vertical layout with consistent gap sizes.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| gap | `'xs'\|'sm'\|'md'\|'lg'\|'xl'` | `'md'` | Gap between children (4/8/16/24/40px) |
| as | `string` | `'div'` | HTML element to render |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<Stack gap="lg">
  <h1>Title</h1>
  <p>Content</p>
  <Button label="Action" />
</Stack>
```

## CSS Variables Used

None directly — uses Tailwind gap utilities.
