# Highway styles

Compiled, scoped CSS from Highway's canonical styles. No React, Tailwind compiler, build plugin, or infrastructure required in the consumer.

- `@highway/styles/styles.css`: full component and effects styling.
- `@highway/styles/effects.css`: tokens, typography, gradients, glass media controls, fades and progressive blur.
- `@highway/styles/tokens.css`: theme and typography tokens.

Choose one entry, rather than loading all three. Full React components need `styles.css`. Rules only apply inside `.highway`; there is no document-wide reset. Host CSS targeting descendants can still override styles—Highway does not use Shadow DOM. Place host resets in a lower-priority cascade layer or remove conflicting overrides.

```html
<link rel="stylesheet" href="/vendor/highway/effects.css">
<div class="highway" data-highway-mode="light">
  <header style="position:relative; padding:24px">
    <div class="fx-progressive" data-recipe="header" data-edge="top" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <div style="position:relative; z-index:1">Your sharp foreground</div>
  </header>
</div>
```

Give backdrop effects actual content behind them and a bounded area. Use `data-highway-mode="dark"` and class `dark` for a dark scope. React users should use `HighwayTheme`, which also handles portals. Override semantic variables on the scope to brand it; defaults preserve Highway's appearance. Color contrast must be checked against your chosen palette. Reduced motion and reduced transparency remain supported.

The CSS uses modern features already used by Highway (backdrop filters, masks, color-mix, CSS nesting compiled to flat selectors). CSS property registrations and animation names are shared at document level; selectors and resets are scoped. The package does not force a font download or change the host page's root font size.
