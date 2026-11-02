# EmptyState

Centered placeholder for empty lists, search results, and blank pages. Accepts an optional action button.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | `string` | `'search'` | Icon name from `lib/icon.jsx` |
| title | `string` | `'No results'` | Heading text |
| description | `string` | — | Secondary text below heading |
| action | `ReactNode` | — | Action element (typically a Button) |
| className | `string` | `''` | Additional CSS classes |

## Dependencies

- `lib/icon.jsx`
- `tokens/theme.css`
- `lucide-react` (peer)

## Usage

```jsx
{/* Basic */}
<EmptyState
  icon="search"
  title="No results found"
  description="Try adjusting your search terms."
/>

{/* With action */}
<EmptyState
  icon="folder"
  title="No projects"
  description="Create your first project to get started."
  action={<Button label="Create project" variant="primary" iconLeft="plus" />}
/>

{/* Minimal */}
<EmptyState icon="mail" title="Inbox zero" />
```

## CSS Variables Used

`--inv-bg-alt`, `--inv-muted`, `--inv-heading`
