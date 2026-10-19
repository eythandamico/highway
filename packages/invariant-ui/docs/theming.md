# Theming

Invariant UI uses CSS custom properties for theming. No JavaScript theme engine or React context required.

## How it works

All components reference `--inv-*` CSS variables. Import `tokens/theme.css` to get the defaults. Override any variable to customize.

## Light / Dark mode

Use the `data-theme` attribute on a parent element:

```html
<div data-theme="dark">
  <!-- components render in dark mode -->
</div>
```

Toggle in JavaScript:

```js
document.documentElement.setAttribute('data-theme', 'dark') // or 'light'
```

## Preset themes

Apply a preset by adding a CSS class:

```html
<div class="theme-midnight" data-theme="dark">
  <!-- midnight preset + dark mode -->
</div>
```

Available presets:
- `theme-midnight` — purple accent, deeper surfaces, 16px radius
- `theme-forest` — green accent, earthy surfaces, 10px radius

Import a preset:

```css
@import 'invariant-ui/tokens/presets/midnight.css';
```

## Custom themes

Override any `--inv-*` variable in your own CSS:

```css
.my-brand {
  --inv-accent: #e11d48;
  --inv-nav: #1a1a2e;
  --inv-radius: 8px;
}
```

```html
<div class="my-brand" data-theme="dark">
  <!-- your custom theme -->
</div>
```

## Variable reference

| Variable | Light default | Dark default | Description |
|----------|--------------|--------------|-------------|
| `--inv-bg` | `#FBFAF9` | `#121212` | Page background |
| `--inv-bg-alt` | `#F2F0ED` | `#2a2a2a` | Alternate background |
| `--inv-surface` | `#FFFFFF` | `#1e1e1e` | Card/surface background |
| `--inv-accent` | `oklch(0.629 0.187 252)` | `oklch(0.629 0.187 252)` | Primary accent color |
| `--inv-accent-soft` | `oklch(0.95 0.03 252)` | `oklch(0.25 0.05 252)` | Soft accent variant |
| `--inv-heading` | `#171717` | `#f0f0f0` | Heading text |
| `--inv-body` | `#494440` | `#c5c2bf` | Body text |
| `--inv-muted` | `#767270` | `#8a8582` | Muted/secondary text |
| `--inv-border` | `#E8E8E8` | `#363636` | Border color |
| `--inv-input` | `#f7f7f7` | `#343434` | Input background |
| `--inv-nav` | `#171717` | `#1e1e1e` | Navigation background |
| `--inv-radius` | `12px` | `12px` | Default border radius |
| `--inv-font-display` | `'Sora', sans-serif` | — | Display font |
| `--inv-font-body` | `'Sora', sans-serif` | — | Body font |
