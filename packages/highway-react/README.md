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
npm install /path/to/highway/artifacts/highway-styles-0.1.0.tgz /path/to/highway/artifacts/highway-react-0.1.0.tgz
```

These package names are local distribution identities, not a claim of npm registry publication. Pin both versions together. Installing copies the artifacts into the consumer; it cannot modify Highway's source. Use the same tarballs in CI from your private artifact store or commit them in the consuming repository. Do not depend on an author's absolute filesystem path in shared CI.

Core TypeScript components retain declarations; legacy JavaScript Invariant APIs have inferred, permissive declarations. The package includes the upstream Invariant MIT notice; no new license for the user's private Highway code is granted.
