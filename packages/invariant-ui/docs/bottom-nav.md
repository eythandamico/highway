# BottomNav

Floating bottom navigation bar with tab switching, add menu, profile menu, and chat input morph.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | `Array<{id, label, icon}>` | `[]` | Tab definitions |
| activeTab | `string` | — | Currently active tab id |
| onTabChange | `(id) => void` | — | Tab change callback |
| addItems | `Array<{label, icon, iconColor?, onAction}>` | `[]` | Create menu items |
| notifications | `{[tabId]: number}` | `{}` | Notification counts per tab |
| avatarUrl | `string` | — | Profile image URL |
| profile | `{name, email}` | — | User profile data |
| profileItems | `Array<{label, icon, danger?, onAction}>` | `[]` | Profile menu items |
| chatTabId | `string` | `'chat'` | Which tab triggers chat mode |
| onSendMessage | `(msg) => void` | — | Chat send callback |
| darkMode | `boolean` | `false` | Current dark mode state |
| onToggleDarkMode | `() => void` | — | Dark mode toggle callback |

## Dependencies

- `lib/icon.jsx`
- `lib/popover.js`
- `lib/use-click-outside.js`
- `lib/use-is-mobile.js`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
import { BottomNav } from './components/bottom-nav'

<BottomNav
  tabs={[
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'chat', label: 'Chat', icon: 'message' },
  ]}
  activeTab="home"
  onTabChange={(id) => setActiveTab(id)}
  darkMode={isDark}
  onToggleDarkMode={() => setIsDark(!isDark)}
/>
```

## CSS Variables Used

`--inv-bg`, `--inv-nav`, `--inv-accent`
