# Invariant UI

A component library for building agent-powered interfaces. Copy-paste components with CSS variable theming.

## Quick start

```bash
npm install lucide-react
```

Copy `tokens/theme.css` and any components you need into your project:

```jsx
import './tokens/theme.css'
import { Button } from './components/button'
import { SearchBar } from './components/search-bar'

function App() {
  return (
    <>
      <SearchBar placeholder="Search anything..." />
      <Button label="Get started" variant="primary" />
    </>
  )
}
```

## Components

27 components across 5 categories:

**Navigation** — BottomNav, ProfileMenu, WorkspaceSwitcher

**Inputs** — SearchBar, SearchToggle, TextInput, Select, PromptBar

**Actions** — Button, ActionButton, Dropdown, Toggle, SegmentedControl

**Display** — AgentAvatar, ProfileAvatar, MessageBubble, Badge, StepIndicator, ExpandCard, SpotlightCard, Accordion, Toast

**Layout** — Stack, Row, Surface, PageSection, Divider

## Theming

All components use `--inv-*` CSS variables. Light and dark mode built in.

```html
<div data-theme="dark">
  <!-- components render in dark mode -->
</div>
```

Override any variable to customize:

```css
:root {
  --inv-accent: #e11d48;
  --inv-radius: 8px;
}
```

Preset themes available: `theme-midnight`, `theme-forest`.

## For AI agents

This library is designed to work with Claude Code, Codex, and other AI coding agents. See [`agent.md`](agent.md) for the full integration guide and [`components.json`](components.json) for the machine-readable manifest.

## Requirements

- React 18+
- Tailwind CSS 4+
- lucide-react

## Documentation

- [`agent.md`](agent.md) — AI agent entry point
- [`RULES.md`](RULES.md) — Component consistency rules
- [`docs/`](docs/) — Per-component documentation
- [`docs/theming.md`](docs/theming.md) — Theming guide
- [`docs/patterns.md`](docs/patterns.md) — Full-page composition examples

## License

[MIT](LICENSE)
