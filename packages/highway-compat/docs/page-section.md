# PageSection

Content width constraint with responsive horizontal padding.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `'sm'\|'md'\|'lg'\|'full'` | `'md'` | Max width (576/672/1024/full) |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<PageSection width="md">
  <h1>Settings</h1>
  <TextInput label="Name" />
</PageSection>
```

## CSS Variables Used

None directly — uses Tailwind max-width and padding utilities.
