# StepIndicator

Horizontal dots where the active step expands to a pill with spring animation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| steps | `number` | `5` | Total number of steps |
| activeStep | `number` | `0` | Currently active step (0-indexed) |
| onStepChange | `(index) => void` | — | Step click callback |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `tokens/theme.css`

## Usage

```jsx
<StepIndicator steps={4} activeStep={1} onStepChange={setStep} />
```

## CSS Variables Used

`--inv-accent`, `--inv-heading`, `--inv-border`
