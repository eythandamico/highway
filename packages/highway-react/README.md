# Highway React

The original Highway components compiled from the same source used by its showcase. No demo, routing, auth, database, Cloudflare, or Next.js runtime is included. Requires React and React DOM 19.2 or newer in the React 19 series.

```tsx
import '@highway/styles/styles.css';
import { HighwayTheme, Button, GlassCard, AskBar } from '@highway/react';

<HighwayTheme>
  <GlassCard><Button onClick={existingHandler}>Save</Button></GlassCard>
  <AskBar onSend={existingSendFunction} />
</HighwayTheme>
```

The stylesheet is compiled: consuming apps do not need Tailwind, a source alias, or Highway's build tools. It is explicitly imported once; JavaScript imports remain safe for server rendering. ESM exports retain `use client` boundaries for React Server Component bundlers. Use a client component for interactive examples. React 18 and non-React component execution are not supported by this release.

## Brand without rebuilding

```tsx
<HighwayTheme mode="dark" brand={{
  primary: '#395ce5', primaryForeground: '#ffffff',
  focus: '#8ca7ff', fontFamily: 'YourBrandFont, sans-serif'
}}>
  <YourExistingFeature />
</HighwayTheme>
```

Defaults reproduce Highway. Brand changes are intentional differences. Provide accessible primary/foreground pairs and load your own fonts. `tokens` accepts optional CSS custom properties for advanced customization; geometry and motion need not change. Nested themes inherit brand settings. Shared portaled dialogs, sheets, menus, select and date popovers receive their scope and theme; no global body theme is changed. Avoid transforming portal ancestors or removing the theme wrapper.

`Card` is the original Invariant card API. `GlassCard` and `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` expose Highway's glass surface composition. `FoundationDialog` and its `Dialog*` subcomponents are the accessible primitive dialog; `Dialog` remains the original Invariant API. `NativeTextarea` exposes the unwrapped textarea; `Textarea` retains Invariant's labelled API. `FormDialog` retains its pending/error protections.

Keep application handlers, routing and data in the consuming project. The Ask bar has no AI or voice service. Demo-specific office navigation and revenue charts are not in this general-purpose package.

## Install this private distribution

Install both generated tarballs in the target project (adjust paths):

```sh
npm install /path/to/highway/artifacts/highway-styles-0.3.0.tgz /path/to/highway/artifacts/highway-react-0.3.0.tgz
```

These package names are local distribution identities, not a claim of npm registry publication. Pin both versions together. Installing copies the artifacts into the consumer; it cannot modify Highway's source. Use the same tarballs in CI from your private artifact store or commit them in the consuming repository. Do not depend on an author's absolute filesystem path in shared CI.

Core TypeScript components retain declarations; legacy JavaScript Invariant APIs have inferred, permissive declarations. The package includes the upstream Invariant MIT notice; no new license for the user's private Highway code is granted.

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

### Agent tools

- `VoiceRecorder` captures local audio with pause/resume, playback, discard and async `onAttach`. The callback receives `{ blob, durationMs, mimeType }`; the host owns upload and transcription. Microphone access requires permission and HTTPS/localhost.
- `ContextTray` displays controlled items and opens their previews in a shared dialog. Supply stable unique IDs and update the items in `onRemove`.
- `ReviewApplyCard` compares before/after text, blocks duplicate submission and shows success only after `onApply` resolves. Reject failures to retain the proposal for retry. Key each new proposal separately.

All three use Highway styles and theme tokens. Read the interaction guide through MCP and the checked `agent-tools` example before integration.
