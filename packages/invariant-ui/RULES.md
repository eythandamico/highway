# Component Rules

Every component in this library must follow these rules. No exceptions.

## 1. No hardcoded colors

Never use hex values, `rgb()`, `rgba()`, Tailwind color classes (`text-gray-500`, `bg-slate-200`), or any hardcoded color in component code.

**Use `--inv-*` CSS variables for everything:**

| Purpose | Variable |
|---------|----------|
| Page background | `--inv-bg` |
| Alternate background | `--inv-bg-alt` |
| Card/surface background | `--inv-surface` |
| Primary accent | `--inv-accent` |
| Soft accent | `--inv-accent-soft` |
| Heading text | `--inv-heading` |
| Body text | `--inv-body` |
| Muted/secondary text | `--inv-muted` |
| Borders | `--inv-border` |
| Input backgrounds | `--inv-input` |
| Nav background | `--inv-nav` |
| Nav text (inactive) | `--inv-nav-text` |
| Nav text (active/hover) | `--inv-nav-text-active` |
| Nav dividers | `--inv-nav-divider` |
| Nav hover background | `--inv-nav-hover-bg` |

**The only exceptions** to hardcoded colors:
- `text-white` on colored badges where the background is a dynamic user color (e.g. startup initials on a `style={{ background: startup.color }}`)
- `text-white` on `--inv-accent` backgrounds (accent buttons, active states)
- `bg-white` on toggle switch knobs (always a white circle)
- `text-red-400` / `text-red-300` for danger/destructive actions

## 2. No hardcoded shadows

Never use inline `boxShadow` with raw `rgba()` values.

| Purpose | Variable |
|---------|----------|
| General elevation | `--inv-shadow` |
| Nav bar elevation | `--inv-nav-shadow` |
| Dropdown menu elevation | `--inv-menu-shadow` |
| Subtle borders/outlines | `--inv-outline` |

Use `style={{ boxShadow: 'var(--inv-shadow)' }}` or the `menuShadow` export from `lib/popover.js`.

## 3. No hardcoded border radius

Use `rounded-[20px]` for nav bars and dropdown menus. Use `rounded-xl` (12px) for buttons and interactive elements. Use `var(--inv-radius)` when a component needs the theme's default radius.

Never introduce a new radius value without justification.

## 4. Use shared utilities

- **Popover animations**: import `popoverStyle` and `menuShadow` from `lib/popover.js`. Never duplicate the animation constants.
- **Click outside dismiss**: import `useClickOutside` from `lib/use-click-outside.js`. Never write your own `useEffect` with `mousedown`/`Escape` listeners.
- **Mobile detection**: import `useIsMobile` from `lib/use-is-mobile.js`. Never inline `window.matchMedia` logic.
- **Icons**: import `Icon` from `lib/icon.jsx`. Never import directly from `lucide-react` in component files.

## 5. Accessibility

Every interactive element must have:
- `aria-label` on icon-only buttons
- `aria-expanded` on buttons that open menus
- `aria-haspopup="true"` on menu trigger buttons
- `role="menu"` on dropdown containers
- `role="menuitem"` on dropdown items
- `focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)]` for keyboard focus indication

Inputs must have:
- `outline-none focus:outline-none focus-visible:outline-none` to suppress browser defaults
- A visible focus state on the parent wrapper using `has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--inv-accent)]`

## 6. Reduced motion

All animations must respect `prefers-reduced-motion`. The `popoverStyle` helper in `lib/popover.js` handles this automatically. For any custom animation, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

## 7. Transitions

Use these consistent timing values:
- **150ms** for color, opacity, and background changes
- **200ms** for scale and icon crossfades
- **350ms** for width morphing (nav bar resize)
- **ease-out** (`cubic-bezier(0.2, 0, 0, 1)`) for most transitions
- **spring** (`cubic-bezier(0.34, 1.3, 0.64, 1)`) for popover open and nav morphing

Active press: `active:scale-95` with `transition-[color,transform]`.

## 8. Type scale

Use the type scale variables. Never introduce arbitrary font sizes.

| Variable | Size | Use for |
|----------|------|---------|
| `--inv-text-xs` | 11px | Labels, badges, keyboard shortcuts, section headers |
| `--inv-text-sm` | 13px | Secondary text, email addresses, metadata |
| `--inv-text-base` | 15px | Menu items, body text, input text, tooltips |
| `--inv-text-lg` | 18px | — |
| `--inv-text-xl` | 24px | — |

In Tailwind: `text-[var(--inv-text-base)]`, `text-[var(--inv-text-sm)]`, etc.

### Icon scale

Icons must use one of these sizes to match the type scale:

| Size | Use for |
|------|---------|
| `12` | Inline chevrons, tiny indicators |
| `16` | Standalone small icons (theme toggle) |
| `18` | Menu item icons, chat input icons, action icons |
| `20` | Nav tab icons |

### Font stack

Use `font-sans` (which resolves to `--inv-font-display` / `--inv-font-body`). Never hardcode a font family in a component.

### Font weight

Use `font-medium` (500) for interactive text and `font-semibold` (600) for names/headings within menus. Never use `font-bold` (700) inside components — it's too heavy for UI text.

## 9. Dropdown menus

All dropdown menus must use:
- `bg-[var(--inv-nav)]/90 backdrop-blur-xl` for frosted glass effect
- `rounded-[20px]` for the container
- `popoverStyle()` for open/close animation
- `menuShadow` for elevation
- `useClickOutside()` for dismiss behavior
- `py-2 px-2` for inner padding
- `rounded-xl` for individual menu items
- `px-2.5 py-2.5 text-[13px]` for menu item sizing

## 10. File conventions

- One component per file
- Kebab-case file names (`bottom-nav.jsx`)
- PascalCase exports (`BottomNav`)
- Import paths use `.jsx` / `.js` extensions
- All imports from `lib/` use relative paths (`../lib/icon.jsx`)

## 11. Layout and responsiveness

Use layout primitives (`Stack`, `Row`, `Surface`, `PageSection`, `Divider`) for page structure. Never use raw `div` with ad-hoc spacing when a primitive exists.

Breakpoint conventions:
- **Mobile-first**: Write base styles for mobile, add complexity upward
- **`sm:` (640px)**: Side padding increases, single-column layouts may start showing secondary elements
- **`md:` (768px)**: Two-column layouts become viable
- **`lg:` (1024px)**: Full desktop layout, three-column grids, sidebars

Page width constraints:
- Forms and settings: `PageSection width="md"` (672px)
- Dashboards and wide content: `PageSection width="lg"` (1024px)
- Full-bleed: `PageSection width="full"`

When components need to stack vertically on mobile and sit side-by-side on desktop, use `Row` with `wrap` and control child widths with Tailwind (`w-full md:w-auto`).
