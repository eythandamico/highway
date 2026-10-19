# Component inventory

70 source components copied from the Playground shared library. They are not all mounted on the demo page. Import only what a screen needs. Primitives with chart/calendar/command dependencies remain optional at runtime.

- `accordion.tsx`
- `alert-dialog.tsx`
- `alert.tsx`
- `aspect-ratio.tsx`
- `attachment.tsx`
- `avatar.tsx`
- `badge.tsx`
- `breadcrumb.tsx`
- `bubble.tsx`
- `button-group.tsx`
- `button.tsx`
- `calendar.tsx`
- `card.tsx`
- `carousel.tsx`
- `chart.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `combobox.tsx`
- `command.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `direction.tsx`
- `disclosure.tsx`
- `drawer.tsx`
- `dropdown-menu.tsx`
- `empty.tsx`
- `field.tsx`
- `file-upload.tsx`
- `form.tsx`
- `hover-card.tsx`
- `input-group.tsx`
- `input-otp.tsx`
- `input.tsx`
- `interactive-surface.tsx`
- `item.tsx`
- `kbd.tsx`
- `label.tsx`
- `marker.tsx`
- `menubar.tsx`
- `message-scroller.tsx`
- `message.tsx`
- `native-select.tsx`
- `navigation-menu.tsx`
- `notice.tsx`
- `pagination.tsx`
- `panel-resize-handle.tsx`
- `popover.tsx`
- `progress.tsx`
- `radio-group.tsx`
- `resizable.tsx`
- `responsive-menu.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `skeleton.tsx`
- `slider.tsx`
- `sonner.tsx`
- `source-code-viewer.tsx`
- `source-file-tree.tsx`
- `spinner.tsx`
- `state-icon.tsx`
- `switch.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toggle-group.tsx`
- `toggle.tsx`
- `tooltip.tsx`

## Common compositions

- List screen: page heading, search input, filters, rows/table, empty/error/loading state, pagination.
- Detail screen: clear title, one primary action, tabs/disclosures for supporting information.
- Editor: labeled fields, validation, preserved drafts, save status and explicit cancel/discard.
- Mobile actions: small circular controls with labels for assistive technology; full primary action when wording matters.
- Account: one responsive dialog with a mobile bottom-sheet treatment, code form and legal links.
- Business documents: preview and review state first; external send action in a separate confirmation step.

Use Storybook to add real compositions and state examples as the new product grows. The included stories exercise representative primitives, not every permutation of all components.

## Composed visual layer

In addition to the UI primitives, `components/visual` contains ProgressiveBlur (header/rail/panel recipes, four edges), EdgeFade (two axes), GradientSurface (four variants), MediaScrim and GradientAvatar. `visual-effects.css` supplies their opt-in styles plus image actions, overlays, image outlines, shadows and optional hover details. `effects-gallery.tsx` and `visual-guide.css` implement the live documentation, not required product UI. `lib/gradient-identity.ts` holds stable identity palettes. See `VISUAL-EFFECTS.md` for composition and accessibility requirements.

## October 19 additions and updated contracts

- `components/ui/date-input.tsx`: date-input/calendar bridge used by Input type=date.
- `components/ui/theme-scope.tsx`: scoped CSS tokens across supported portals.
- `components/foundation/patterns.tsx`: Fields, FormDialog, Confirm, Modal, Heading, RowMeta, Empty, SearchField and view-choice buttons.
- `components/foundation/feedback.tsx`: Feedback and LoadingState.
- `components/foundation/status.tsx`: labeled semantic Status.
- `components/foundation/section-boundary.tsx`: isolated lazy-feature recovery.
- `lib/design/appearance-style.ts`: validated accent overrides and readable on-accent text.
- `lib/ui/preload.ts`: retryable shared lazy-import promise.
- `components/foundation/design-lab.tsx`: live synthetic examples at /components/foundation and in Storybook.

Button, Input, Textarea, NativeSelect and overlay primitives now consume the shared consistency layers. See DESIGN-SYSTEM.md before extending them.
