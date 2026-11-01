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

## Application typography contract

Use this scale for the entire adopted application, including existing headings, navigation, tables, and custom content—not only Highway controls. Import the stylesheet once and wrap the application in `HighwayTheme` (or `.highway` for CSS-only usage). The scoped default is **14px / 20px, weight 400**. Content outside that scope is unchanged.

| Role | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| `display` | 30 / 36 | 600 | Primary KPI |
| `heading-xl` | 24 / 32 | 600 | Page titles |
| `heading-lg` | 18 / 28 | 600 | Major sections |
| `heading-md` | 16 / 24 | 600 | Card titles |
| `body` | 14 / 20 | 400 | Standard UI, navigation |
| `body-sm` | 13 / 20 | 400 | Dense tables, filters |
| `caption` | 12 / 16 | 400–500 | Chart labels, metadata |
| `micro` | 11 / 16 | 500 | Dense secondary labels only |

Values are pixel equivalents at the default 16px browser root. Implementation uses rem units; do not set the root to 14px or disable browser zoom. The scale stays consistent on phones, with an accessibility exception: editable inputs use at least 1rem (16px at the default root). Caption defaults to weight 400; 500 is also appropriate for emphasized metadata. Never use caption or micro for primary data.

```tsx
import '@highway/styles/styles.css';
import { HighwayTheme } from '@highway/react';

<HighwayTheme brand={{ fontFamily: 'Brand Sans, sans-serif' }}>
  <h1 className="highway-type-heading-xl">Overview</h1>
  <p className="highway-type-body">Your existing application content</p>
  <div className="highway-type-display">1,240</div>
  <table className="highway-table">{/* existing rows */}</table>
  <span data-highway-type="caption">Updated today</span>
</HighwayTheme>
```

Every role is available as `highway-type-{role}` or `data-highway-type="{role}"`; both set size, line height, and weight together. CSS-only hosts can use the same markup inside `.highway`. No Tailwind compiler is required. Canonical custom properties are `--type-{role}`, `--leading-{role}`, and `--weight-{role}`. Existing aliases resolve to these values; they do not define a separate scale.

Brand the font family and colors while retaining the role scale. During adoption, remove or map competing host typography rules within the adopted scope. Merely installing npm packages cannot rewrite existing app markup or defeat higher-specificity host CSS. Use the explicit roles for custom content and verify computed styles after integration.


### Analytics dashboard rules

- Use `font-variant-numeric: tabular-nums` for table values and KPI cards. Highway Table, display text, and the metric helpers include it. Use a brand font that supports tabular figures; the package cannot add missing glyph features.
- Use only weights 400, 500, and 600. Strong/bold emphasis resolves to 600; avoid 700+ overrides.
- Prefer a 14px muted secondary label over shrinking ordinary labels to 11px. Use `highway-secondary-label`; reserve micro for genuinely dense secondary annotations. Keep readable contrast when branding.
- Dense desktop tables use 13px / 20px text and roughly 36–44px single-line rows. Highway Table and `highway-table` target 40px at the default root. Wrapped text and enlarged browser text expand rows rather than clipping; phone spacing stays comfortable.
- Reserve 30px display for a meaningful primary KPI. Secondary KPIs use the existing 24px heading-xl role, within the preferred 20–24px range. Do not promote every numeric value to display size or add an unnecessary ninth type size.

```tsx
<p className="highway-secondary-label">Net revenue</p>
<div data-highway-metric="primary">$48,120</div>
<p className="highway-secondary-label">Average order</p>
<div data-highway-metric="secondary">$124</div>
```

`highway-metric` alone defaults to the secondary metric role. Use `highway-table` for adopted host tables and preserve their existing sorting, filtering, and selection behavior. Keep equal numeric precision within a column, and right-align comparable amounts through the host column configuration.
