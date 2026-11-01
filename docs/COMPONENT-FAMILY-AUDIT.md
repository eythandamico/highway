# Component family audit

Date: 2026-10-29

Scope: all 80 visible showcase entries, the 2 hidden aliases, and all 114 entries in the public export map. Reviewed catalog mappings, canonical source dependencies, and implementation/API details of overlapping families. The audit has now been applied as the family organization described below. Validation results are recorded at the end.

## Finding

The directory mixes families, primitives, compatibility adapters, complete patterns and demo-only compositions. Several apparent duplicates already share implementation. Fewer gallery cards should not mean fewer useful exports or flattened interaction/design recipes.

## Applied changes

- One typed Combobox API with `multiple`; MultiSelect remains a wrapper.
- SearchBar supports `expandable`; SearchToggle remains a wrapper around the original expansion implementation.
- Stack supports horizontal/vertical direction, alignment and wrapping; Row retains its centered default as a wrapper.
- Dialog and Modal share DialogFrame lifecycle, focus and backdrop without altering their authored panels. FormDialog and FoundationDialog remain explicit patterns/compound APIs.
- Authored menu shells share keyboard navigation; the Radix compound API remains a separate supported adapter for portaling/collision behavior. This is intentional, not an interchangeable mode.
- All installable showcase entries are organized into 53 family pages with variant links and selection guidance. Existing deep links remain valid. Demo-only compositions remain directly accessible but are excluded from installable family discovery.
- Primitive/composed fields, buttons, cards, avatars, badges/status, feedback, dates, view selection, sheets and composers are grouped according to the audit. Their distinct value contracts, artwork and interaction patterns remain supported.
- The canonical catalog owns family memberships, variants, exact exports, implemented mode props, compatibility names and selection guidance. Showcase and MCP consume that same data.
- MCP adds list_families, get_family and select_variant; component inspection includes family context. Ambiguous intent returns candidates, not invented certainty.

The audit's conditional suggestions were resolved conservatively: a family does not require one giant component. Geometry/material/motion changes and replacing functioning overlay engines are unnecessary to provide one coherent family API and discovery path.

## Family decisions

| Family | Decision | Evidence and preservation requirements |
| --- | --- | --- |
| Combobox | Unify public modes | Already one private Picker with multiple; expose a discriminated single/multiple API. Preserve string versus array typing, hidden form fields, and close-on-single behavior. |
| Search | Unify presentation modes | Expanded and expandable presentations of search. Share a field core; preserve expansion spring, dismissal and focus. Keep legacy exports as wrappers. |
| Layout | Unify direction variants | Same gap scale and flex layout. A direction prop can cover both, with alignment, wrapping and polymorphic element support. Preserve current default alignment per compatibility wrapper. |
| Dialog | Consolidate base; retain patterns | Dialog and Modal duplicate backdrop, focus hook and panel lifecycle. One base with sizes, body/footer slots and close controls; FormDialog remains a composed pattern with pending/failure safeguards. FoundationDialog is the compound primitive; Confirm is another pattern. |
| Menus | Consolidate engines and documentation | Dropdown and DropdownMenu both expose action menus through different APIs/engines. Menu is a lower-level menu body. Choose one behavior engine and preserve distinct authored materials, geometry, placement and motion through explicit recipes. Not a one-prop substitution today. |
| Text field | Group primitive and composed API | TextInput already wraps Input with label/icon/error. One main field page; Input and Label remain useful low-level exports. NativeTextarea now has a separate variant in the textarea family. |
| Textarea | Group primitive and composed API | Textarea already wraps the shared NativeTextarea. Document autoGrow, count and error as options; retain the primitive for composition. |
| Select | Group adapters; normalize deliberately | Select and NativeSelect share the internal Radix select. NativeSelect additionally maintains native form events/reset/validation and falls back for multiple/size. Keep adapters; do not replace with a searchable Combobox merely because triggers look alike. |
| Buttons | Group presentations; retain action patterns | Button already supports icon sizes and loading. IconButton can become a typed icon-only recipe once its elevation, icon sizing and press feel are preserved. ActionButton has an async state machine and morphing geometry; CopyButton and SplitButton perform distinct behaviors. Keep these patterns explicit under the family. |
| Switch | Already consolidated | Legacy Toggle delegates to Switch; inv-toggle is already an alias. Do not add another runtime implementation. |
| Cards and surfaces | Group recipes; review before runtime merge | GlassCard is a compound content surface; Card includes media/gradient/video; Surface is a layout shell. Present these within a family, preserving material and radius recipes. ExpandCard and SpotlightCard add distinct behavior and should remain compositions. |
| Avatars | Group family; preserve renderers | ProfileAvatar is an interactive image identity; AgentAvatar has generated art and thinking/inactive states; GradientAvatar is a noninteractive SVG with a different deterministic renderer. Shared shell is plausible, but never replace artwork or force every avatar to be a button. ProfileAvatarGroup remains a composition. |
| Badge and status | Candidate tone/appearance consolidation | Badge supplies appearance variants; Status supplies semantic tone and text normalization. A badge base can support both without changing accessible meaning. Feedback and LoadingState now have separate variants in the alerts/feedback family. |
| Alerts and feedback | Candidate shared message base | Alert and Feedback overlap as inline messages but differ in dismissal, action slots, tone and live-region behavior. Share a base with explicit announcement semantics; preserve each current default. Feedback is currently shown in status. |
| Dates | Group modes; retain input adapter | Both lazy-load Calendar; DateInput retains input events and date form semantics, while DateRangePicker manages a from/to object, presets and validation. A future DatePicker mode API is plausible; not a direct replacement for DateInput. |
| View selection | Candidate presentation variants | Both currently use groups of aria-pressed buttons and activeTab callbacks. Underline versus filled indicator can be variants of a shared view selector. Preserve counts, icons, disabled states and keyboard timing. Neither should be mislabeled as an accessible tab/panel widget. |
| Sheets | Related but distinct interaction | Sheet supports edge placement via Radix; BottomSheet adds drag velocity, spring dismissal and optional host-page transformation. Group in docs, but do not erase gesture behavior by treating bottom placement as equivalence. |
| Composers | Related patterns; no immediate merge | AskBar owns compact/floating inline conversation behavior; PromptBar has model, attachment and voice controls. Share lower-level pieces where useful; avoid a giant mode prop that hides incompatible contracts. |
| Navigation patterns | Keep compositions | These use controls and menus but have domain-specific navigation/identity/workspace models. Keep named patterns; share the menu engine where appropriate. |
| Specialized input | Keep distinct | Selection, numeric stepping, multi-cell code input, radio choice, continuous dragging and edit/save/cancel are different keyboard/value contracts. |
| Loading and progress | Keep distinct | Progress is measurable completion; spinner is indeterminate activity; skeleton predicts layout; steps indicate sequence; toast is temporary notification; empty state provides recovery. LoadingState can compose Spinner, not replace this family with one mode switch. |
| Effects | Keep distinct; organize together | Blur, edge masking/tint, foreground contrast, icon transition and gradient artwork serve different rendering purposes. Existing effect axes/recipes are already props. |
| Independent components | Keep distinct | Different content or interaction contracts. Overlay and Divider are primitives; the others should not become flags on a generic component. CommandPalette reuses SearchOptions but executes commands rather than selecting a field value. |
| Theme infrastructure | Keep infrastructure | HighwayTheme and ThemeScope provide styling/context and portal inheritance, not competing visual components. |
| Demo compositions | Move out of primary component count | Office navigation and Bookings chart have no public package exports in the availability map. Keep in examples, not alongside installable components. |

## Preserved boundaries

- Dialog engine replacement: focus restoration, portal/theming behavior, scroll locking, nested dialogs, closing while pending, panel geometry and entrance/exit motion.
- Menu engine replacement: keyboard/typeahead, collision positioning, portal inheritance, transparent surfaces, compact geometry, shadows and close/focus behavior.
- Button/IconButton: existing icon-only sizes are not proof of identical geometry. Preserve elevated material, 16/20px icon scale and press motion explicitly.
- Avatar consolidation: preserve distinct generated artwork and interactive versus decorative semantics.
- Card consolidation: preserve glass, media, gradient and spotlight treatments rather than impose one generic shell.
- Tabs/SegmentedControl: agree whether these remain view buttons or gain true tab/panel semantics before API changes.
- Badge/Status and Alert/Feedback: agree tone names and announcement behavior; do not normalize colors or live regions blindly.

## Compatibility and publication plan

Keep current imports as wrappers. New APIs should use discriminated types where mode changes value/callback shape. Each family page should document the recommended API, variants, existing compatibility exports and migration examples. Update the canonical catalog, generated references, MCP selection guidance and usage examples together. Check fresh-package consumers and affected interactions after changes; approve visual baselines before consolidating implementations.

## Complete showcase coverage

| Current entry | Proposed family | Disposition |
| --- | --- | --- |
| `inv-bottom-nav` | Navigation patterns | Keep compositions |
| `inv-profile-menu` | Navigation patterns | Keep compositions |
| `inv-search-bar` | Search | Unify presentation modes |
| `inv-search-toggle` | Search | Unify presentation modes |
| `inv-segmented-control` | View selection | Candidate presentation variants |
| `inv-tabs` | View selection | Candidate presentation variants |
| `inv-workspace-switcher` | Navigation patterns | Keep compositions |
| `inv-checkbox` | Specialized input | Keep distinct |
| `inv-number-input` | Specialized input | Keep distinct |
| `inv-pin-input` | Specialized input | Keep distinct |
| `inv-radio-group` | Specialized input | Keep distinct |
| `inv-select` | Select | Group adapters; normalize deliberately |
| `inv-slider-input` | Specialized input | Keep distinct |
| `inv-text-input` | Text field | Group primitive and composed API |
| `inv-textarea` | Textarea | Group primitive and composed API |
| `inv-action-button` | Buttons | Group presentations; retain action patterns |
| `inv-dropdown` | Menus | Consolidate engines and documentation |
| `inv-icon-button` | Buttons | Group presentations; retain action patterns |
| `inv-agent-avatar` | Avatars | Group family; preserve renderers |
| `inv-profile-avatar` | Avatars | Group family; preserve renderers |
| `inv-card` | Cards and surfaces | Group recipes; review before runtime merge |
| `inv-divider` | Independent components | Keep distinct |
| `inv-expand-card` | Cards and surfaces | Group recipes; review before runtime merge |
| `inv-page-section` | Independent components | Keep distinct |
| `inv-row` | Layout | Unify direction variants |
| `inv-split-pane` | Independent components | Keep distinct |
| `inv-spotlight-card` | Cards and surfaces | Group recipes; review before runtime merge |
| `inv-stack` | Layout | Unify direction variants |
| `inv-surface` | Cards and surfaces | Group recipes; review before runtime merge |
| `inv-alert` | Alerts and feedback | Candidate shared message base |
| `inv-badge` | Badge and status | Candidate tone/appearance consolidation |
| `inv-empty-state` | Loading and progress | Keep distinct |
| `inv-progress` | Loading and progress | Keep distinct |
| `inv-skeleton` | Loading and progress | Keep distinct |
| `inv-spinner` | Loading and progress | Keep distinct |
| `inv-step-indicator` | Loading and progress | Keep distinct |
| `inv-toast` | Loading and progress | Keep distinct |
| `inv-bottom-sheet` | Sheets | Related but distinct interaction |
| `inv-dialog` | Dialog | Consolidate base; retain patterns |
| `inv-menu` | Menus | Consolidate engines and documentation |
| `inv-modal` | Dialog | Consolidate base; retain patterns |
| `inv-overlay` | Independent components | Keep distinct |
| `inv-tooltip` | Independent components | Keep distinct |
| `inv-image-carousel` | Independent components | Keep distinct |
| `inv-message-bubble` | Independent components | Keep distinct |
| `inv-prompt-bar` | Composers | Related patterns; no immediate merge |
| `inv-accordion` | Independent components | Keep distinct |
| `inv-table` | Independent components | Keep distinct |
| `progressive-blur` | Effects | Keep distinct; organize together |
| `edge-fade` | Effects | Keep distinct; organize together |
| `media-scrim` | Effects | Keep distinct; organize together |
| `state-icon` | Effects | Keep distinct; organize together |
| `ask-bar` | Composers | Related patterns; no immediate merge |
| `button` | Buttons | Group presentations; retain action patterns |
| `fields` | Text field | Group primitive and composed API |
| `select` | Select | Group adapters; normalize deliberately |
| `date` | Dates | Group modes; retain input adapter |
| `switch` | Switch | Already consolidated |
| `dialog` | Dialog | Consolidate base; retain patterns |
| `sheet` | Sheets | Related but distinct interaction |
| `menu` | Menus | Consolidate engines and documentation |
| `card` | Cards and surfaces | Group recipes; review before runtime merge |
| `status` | Badge and status | Candidate tone/appearance consolidation |
| `avatars` | Avatars | Group family; preserve renderers |
| `gradients` | Effects | Keep distinct; organize together |
| `theme` | Theme infrastructure | Keep infrastructure |
| `navigation` | Demo compositions | Move out of primary component count |
| `bookings` | Demo compositions | Move out of primary component count |
| `combobox` | Combobox | Unify public modes |
| `multi-select` | Combobox | Unify public modes |
| `inline-edit` | Specialized input | Keep distinct |
| `split-button` | Buttons | Group presentations; retain action patterns |
| `button-group` | Buttons | Group presentations; retain action patterns |
| `copy-button` | Buttons | Group presentations; retain action patterns |
| `filter-toolbar` | Independent components | Keep distinct |
| `date-range-picker` | Dates | Group modes; retain input adapter |
| `command-palette` | Independent components | Keep distinct |
| `voice-recorder` | Independent components | Keep distinct |
| `context-tray` | Independent components | Keep distinct |
| `review-apply-card` | Independent components | Keep distinct |

Hidden aliases: `inv-button` → Button and `inv-toggle` → Switch are already excluded from the grid. Compound exports (CardHeader, DialogContent, MenuItem, etc.) are composition pieces, not independent duplication. Hooks, theme providers and variant helpers are infrastructure.

## Validation

- `check:ui:full`: passed typecheck, lint, design guard, token tests, starter build, Storybook build and browser checks (55 passed, 77 explicitly skipped).
- `check:systems` and `test:systems`: passed; 4 system tests.
- MCP: 10 tests passed; snapshot and private MCP archive rebuilt.
- Clean consumer: catalog, archive installation, typecheck, production build, tree-shaking, SSR and size budgets passed. Initial browser run: 42 passed; 10 stale showcase assertions updated for family navigation. New family interactions passed on desktop and phone. Targeted final navigation/typography rerun: 6 passed, 4 project-specific skips; audited all 53 family routes, 31 iframe previews and both existing aliases. Additional focused checks passed for style parity, package usage and Dialog/Modal behavior.
- Final catalog validation: 114 runtime APIs, 85 showcase mappings. Latest targeted lint, repository typecheck, showcase build and diff whitespace checks passed.
- Desktop/phone proof images: `artifacts/validation-screenshots/family-directory-grid-{desktop,phone}.png` and `family-combobox-{desktop,phone}.png`.
- The complete clean-consumer command was not rerun after updating stale showcase assertions; passing portions and targeted reruns are reported separately above.
- No deployment or publication performed.
