# MessageBubble

Chat message bubble for agent and user messages with thinking state and hover actions.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | `string` | — | Message text |
| role | `'user'\|'agent'` | `'user'` | Message sender |
| thinking | `boolean` | `false` | Shows thinking shimmer (agent only) |
| agentName | `string` | — | Agent name for avatar |
| avatarUrl | `string` | — | User avatar URL |
| timestamp | `string` | — | Time display |
| onCopy | `() => void` | — | Copy action |
| onThumbsUp | `() => void` | — | Like action (agent) |
| onThumbsDown | `() => void` | — | Dislike action (agent) |
| onEdit | `() => void` | — | Edit action (user) |
| onRetry | `() => void` | — | Retry action (user) |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `components/agent-avatar.jsx`
- `components/profile-avatar.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
<MessageBubble role="agent" agentName="Nova" content="Hello!" timestamp="2:14 PM" />
<MessageBubble role="user" avatarUrl="/me.jpg" content="Hi there" timestamp="2:15 PM" />
<MessageBubble role="agent" agentName="Nova" thinking />
```

## CSS Variables Used

`--inv-heading`, `--inv-bg-alt`, `--inv-muted`, `--inv-border`, `--inv-nav-hover-bg`
