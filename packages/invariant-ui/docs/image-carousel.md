# ImageCarousel

Image slideshow with sliding transitions, left/right arrow navigation, and a StepIndicator overlay at the bottom center.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| images | `Array<string \| { src, alt }>` | `[]` | Image URLs or objects with src and alt |
| height | `number` | `320` | Image area height in pixels |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `components/step-indicator.jsx`
- `tokens/theme.css`

## Usage

```jsx
<ImageCarousel
  images={['/photo1.jpg', '/photo2.jpg', '/photo3.jpg']}
  height={400}
/>

<ImageCarousel
  images={[
    { src: '/hero.jpg', alt: 'Hero image' },
    { src: '/feature.jpg', alt: 'Feature overview' },
  ]}
/>
```

## CSS Variables Used

`--inv-bg-alt`, `--inv-surface`, `--inv-heading`, `--inv-shadow-sm`
