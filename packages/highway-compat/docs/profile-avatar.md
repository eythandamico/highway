# ProfileAvatar

User avatar with rounded/circle variants, alert gem, and group stacking.

## Props

### ProfileAvatar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | `string` | — | Name for tooltip |
| avatarUrl | `string` | — | Image URL (required) |
| size | `number` | `40` | Avatar size in px |
| rounded | `'xl'\|'full'` | `'xl'` | Shape variant |
| alert | `boolean` | `false` | Show red alert dot |
| grouped | `boolean` | `false` | Adds outer border for group stacking |
| onClick | `() => void` | — | Click handler |

### ProfileAvatarGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| avatars | `Array<{name, avatarUrl, alert?, onClick?}>` | `[]` | Avatar list |
| size | `number` | `40` | Avatar size |
| rounded | `'xl'\|'full'` | `'xl'` | Shape variant |
| max | `number` | `3` | Max visible before overflow count |

## Dependencies

- `lib/popover.js`
- `tokens/theme.css`

## Usage

```jsx
<ProfileAvatar name="Jane" avatarUrl="/jane.jpg" rounded="full" alert />

<ProfileAvatarGroup
  avatars={[
    { name: 'Jane', avatarUrl: '/jane.jpg' },
    { name: 'John', avatarUrl: '/john.jpg' },
    { name: 'Sam', avatarUrl: '/sam.jpg' },
    { name: 'Alex', avatarUrl: '/alex.jpg' },
  ]}
/>
```

## CSS Variables Used

`--inv-shadow`, `--inv-outline`, `--inv-bg`, `--inv-bg-alt`, `--inv-heading`, `--inv-muted`, `--inv-nav`, `--inv-nav-text-active`, `--inv-accent`
