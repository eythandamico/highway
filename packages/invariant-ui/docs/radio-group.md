# RadioGroup

Group of radio options with vertical or horizontal layout.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| options | `Array<{ id, label }>` | `[]` | Radio options |
| value | `string` | — | Selected option id |
| onChange | `function` | — | Called with selected id |
| label | `string` | — | Group label |
| direction | `'vertical'\|'horizontal'` | `'vertical'` | Layout direction |
| disabled | `boolean` | `false` | Disable all options |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<RadioGroup
  label="Plan"
  options={[
    { id: 'free', label: 'Free' },
    { id: 'pro', label: 'Pro' },
    { id: 'team', label: 'Team' },
  ]}
  value={plan}
  onChange={setPlan}
/>
```

## CSS Variables Used

`--inv-heading`, `--inv-accent`, `--inv-surface`, `--inv-shadow-sm`
