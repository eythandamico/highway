# Tooltip

Animated hover label that appears above or below its parent. Uses `popoverStyle` for scale + blur entrance. Must be inside a `relative` positioned container.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Tooltip text |
| visible | `boolean` | — | Controls visibility |
| position | `'top'\|'bottom'` | `'top'` | Placement relative to parent |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/popover.js`
- `tokens/theme.css`

## Usage

```jsx
<div className="relative">
  <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    Hover me
  </button>
  <Tooltip label="Hello!" visible={hovered} />
</div>
```

## CSS Variables Used

`--inv-nav`, `--inv-nav-text-active`, `--inv-shadow`
