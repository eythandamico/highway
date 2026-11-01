# Invariant detail restoration

October 28, 2026. Local work; not published or deployed.

## Scope

All 50 files in `packages/highway-react/src/invariant/components` were compared with the original Invariant component sources supplied by the owner. The comparison covered component markup, visual geometry, materials, emphasis, and motion, plus Highway’s shared CSS overrides. The original files were read only. Highway continues to contain its own implementation and has no runtime dependency on the original project.

The previous family pass applied rules too broadly. Functional checks did not catch the resulting loss of visual detail. This pass restores authored component differences instead of treating every control, surface, and label as interchangeable.

## Corrections

| Before | After | Reason |
| --- | --- | --- |
| Dropdown minimum width could resolve to the narrow trigger width, wrapping labels one letter per line | Original intrinsic menu dimensions restored; viewport bound retained | A floating menu must size for its content independently of its trigger |
| Every step occupied a 44px layout slot | Original compact dots, active segment, and spacing restored; vertical hit area handled separately | Accessibility should not stretch the indicator’s visible composition |
| Body/caption role weight overrode component medium and semibold utilities | Explicit weight utilities restore each component’s emphasis | Shared type sizes must not erase hierarchy |
| Shared menu rule forced opaque fill, row height, and radius | Invariant menus retain their own fill, blur, radius, and row geometry | Profile/workspace translucency differs intentionally from a standalone action menu |
| Shared dismiss rule changed circular and compact controls into the same shape | Visible close/media controls retain component-owned geometry | A circular video control and a modal close control are not the same surface |
| Media-card titles changed from large regular text to small semibold text | Large regular titles restored using the approved 24px role | Preserve editorial hierarchy while using Highway’s scale |
| Checkbox/radio wrappers acquired generic control sizing and scale/fade marks | Original 24px shells and grow/shrink mark choreography restored within explicit Invariant wrappers | Keep the authored selection feel without changing the native primitive used elsewhere |
| Segmented options acquired larger uniform geometry | Original icon-only sizing, option gap, padding, and shell sizing restored | Icon-only and labelled options have different authored proportions |
| Slider lost its minimum visual fill and grip proportions | Minimum fill nub, resting/dragging grip dimensions, and clipping restored | Preserve the visible affordance and drag feedback |
| Text fields lost the original surface/shadow treatment; Select lost its arrow rotation | Scoped Invariant field material and Select rotation restored | Shared accessible primitives can retain the original visual treatment |
| Toast gained a full visible dismissal row | Compact toast composition restored with accessible dismissal and separate host action content | Keyboard access does not require an extra text row |
| Alert’s solid icon tile became a pale tile | Solid semantic tile and contrasting icon restored | Preserve the original feedback hierarchy |
| Table caption moved above the table; sort-arrow entrance disappeared | Semantic caption restored below and centered; pointer sort-arrow entrance restored; footer emphasis/alignment restored | Preserve authored presentation alongside stable selection and sorting |
| Original 150ms details and asymmetric popover exits were replaced by general motion recipes | Named Invariant timings and popover recipes preserve original values | Standardize ownership without standardizing away timing differences |
| Thinking text lost semibold emphasis and message content lost relaxed leading | Semibold shimmer and component-specific content leading restored | Typography is part of the interaction’s character |

## Complete component inventory

Status describes the source comparison and current restoration, not a claim that every state has been visually exercised on every device.

| File | Comparison and disposition |
| --- | --- |
| `accordion.jsx` | Original expansion sequence retained. Title emphasis restored; focus semantics, inert collapsed content, and dynamic measurement retained. |
| `action-button.jsx` | Original morph and shape retained; label emphasis restored. Real asynchronous success/failure handling remains. |
| `agent-avatar.jsx` | Orb SVG, grain, colors, and thinking animation were intact. Tooltip emphasis and original detail timing restored. |
| `alert.jsx` | Solid icon tile, secondary text role, title emphasis, and component-specific close geometry restored. Timer cleanup and reduced motion retained. |
| `badge.jsx` | Original pill geometry retained; medium label weight restored. |
| `bottom-nav.jsx` | Original navigation silhouette retained. Menu-owned geometry/materials and text hierarchy restored; keyboard navigation and focus return retained. |
| `bottom-sheet.jsx` | Original drag character retained. Close control uses its own geometry; focus handling, pointer cleanup, reduced motion, and explicitly scoped page animation retained. |
| `button.jsx` | Compatibility wrapper continues to use Highway’s public Button. Original medium emphasis is restored where component-owned; the unified public API remains intentional. |
| `card.jsx` | Artwork and surfaces retained. Gradient/video/subdued title hierarchy and circular media-control geometry restored. Explicit playback and reduced motion retained. |
| `checkbox.jsx` | Scoped original 24px shell and mark growth restored; accessible shared primitive retained. |
| `dialog.jsx` | Original panel material and composition retained. Component emphasis restored; focus trapping, naming, inert state, and overflow protection retained. |
| `divider.jsx` | Identical to original apart from client-module packaging where applicable. |
| `dropdown.jsx` | Menu sizing regression corrected; original material, row geometry, and motion restored. Disabled/keyboard/focus behavior retained. |
| `empty-state.jsx` | Original layout/material retained with approved heading and body roles. |
| `expand-card.jsx` | Original expansion choreography retained; title emphasis restored. Semantic trigger, child-action isolation, and dynamic height measurement retained. |
| `icon-button.jsx` | Original geometry, surface, and 200ms motion retained. |
| `image-carousel.jsx` | Original image transitions and control materials retained. Compact StepIndicator restoration also repairs its indicator composition. Resize/lifecycle fixes retained. |
| `menu.jsx` | Original menu-owned geometry restored; keyboard navigation, disabled handling, and semantic separators retained. |
| `message-bubble.jsx` | Thinking shimmer emphasis and relaxed message leading restored. Original avatar artwork retained. |
| `modal.jsx` | Original panel material retained; close control no longer receives a generic shape override. Long-title resilience and focus behavior retained. |
| `number-input.jsx` | Original bounce, geometry, and emphasis retained/restored. Keyboard stepping, pointer capture, numeric precision, and timer cleanup retained. |
| `overlay.jsx` | Original material retained; original detail timing restored. |
| `page-section.jsx` | Original layout retained; `min-width:0` remains to prevent flex/grid overflow. |
| `pin-input.jsx` | Original box geometry retained; semibold emphasis restored. Per-digit accessible names retained. |
| `profile-avatar.jsx` | Original image treatment, shape options, and group composition retained; tooltip emphasis restored. |
| `profile-menu.jsx` | Original translucent blurred material and profile/email hierarchy restored; keyboard/focus handling retained. |
| `progress.jsx` | Original track and shimmer retained; 13px medium label/value hierarchy restored. Normalized values and reduced motion retained. |
| `prompt-bar.jsx` | Original orb, waveform, and pill composition retained; secondary model text and emphasis restored within approved type roles. |
| `radio-group.jsx` | Original shell/mark choreography and selected-versus-muted label hierarchy restored; keyboard group behavior retained. |
| `row.jsx` | Identical to original apart from client-module packaging where applicable. |
| `search-bar.jsx` | Original surface and layout retained; shortcut hierarchy and original detail timing restored. |
| `search-toggle.jsx` | Original width morph and delayed content reveal retained; original detail timing restored. |
| `segmented-control.jsx` | Original visible option geometry restored. Measured indicator, wrapping resilience, keyboard state, disabled options, and reduced motion retained. |
| `select.jsx` | Original field material and rotating chevron restored around the shared accessible primitive. Public value and form behavior retained. |
| `skeleton.jsx` | Original shimmer retained; live reduced-motion preference handling retained. |
| `slider-input.jsx` | Original minimum fill and grip proportions restored. Correct snapping, pointer capture, touch/keyboard operation, and long-label resilience retained. |
| `spinner.jsx` | Identical to original apart from client-module packaging where applicable. |
| `split-pane.jsx` | Original geometry retained; original detail timing restored. Pointer and keyboard resizing retained. |
| `spotlight-card.jsx` | Original light layers, masks, opacity, and 400ms motion retained. |
| `stack.jsx` | Identical to original apart from client-module packaging where applicable. |
| `step-indicator.jsx` | Original compact spacing and active-segment dimensions restored; no generic 44px layout slots. |
| `surface.jsx` | Original material/elevation retained. Generic radius override removed; overflow resilience retained. |
| `table.jsx` | Bottom-centered caption, footer alignment/emphasis, and pointer sort-arrow entrance restored. Approved dense type scale, controlled APIs, and stable selection retained. |
| `tabs.jsx` | Original indicator motion retained; medium label/count emphasis restored. Resizing, safe ID lookup, and keyboard/reduced-motion handling retained. |
| `text-input.jsx` | Scoped Invariant surface/shadow and label hierarchy restored around the shared field primitive; naming/error associations retained. |
| `textarea.jsx` | Scoped Invariant material and secondary label/error roles restored. Ref forwarding, auto-grow, and error associations retained. |
| `toast.jsx` | Compact original composition and title/message hierarchy restored; timer pausing, cleanup, accessible dismissal, and reduced motion retained. |
| `toggle.jsx` | Compatibility wrapper intentionally continues to use the public Switch implementation. Its modern keyboard/form behavior remains; no second switch API was introduced. |
| `tooltip.jsx` | Intrinsic content width and medium emphasis restored with a viewport bound; accessible tooltip semantics retained. |
| `workspace-switcher.jsx` | Original translucent menu material and name/secondary hierarchy restored; keyboard/focus handling retained. |

## Intentional differences from the original

- Highway keeps the approved 14px default UI scale, 13px secondary/dense text, and weights 400/500/600. Former 15px UI text is not reintroduced. Former 22px editorial card text uses the approved 24px role with regular weight.
- Native Button and Switch public unification remains. This pass does not create duplicate controls or silently change their public contracts.
- Functional improvements remain: focus management, keyboard operation, disabled states, form integration, real async results, stable table keys, reduced-motion support, cleanup, and resilient long content.
- BottomSheet’s host-page animation remains explicit through `pageTarget`. Restoring appearance does not authorize implicit mutations of a consuming application.
- Dense table typography remains the owner-approved analytics treatment; the old larger row density is not restored wholesale.
- Compact step indicators keep 10px dots and 8px gaps, with extra vertical hit area. This does not make every dot a 24px-wide or 44px-wide touch target; hosts needing larger touch controls should offer an appropriately spaced navigation alternative. Keyboard activation remains available.
- Different visible control sizes and materials are intentional where authored. Shared tokens may supply values; they must not forcibly replace component-specific geometry.

## Prevention

Compare changed components with their original visible states before calling a refinement complete. Check resting, hover, pressed, focused, selected, loading, and open states as applicable. Geometry and computed-style checks supplement visual review; they do not replace it. Use scoped component hooks for exceptions instead of escalating blanket selectors.

## Validation

### Browser and build checks

- The direct-preview restoration suite passed: 3 desktop checks for the 180px Dropdown menu, compact StepIndicator bar positions, and explicit 600 weight in ThinkingIndicator, WorkspaceSwitcher, and ProfileMenu. Nine other matrix cases skipped by project guards.
- `npm run check:ui:full` completed typecheck, lint, design/contrast checks, app build, and Storybook build successfully. Its first browser run had 47 passes, 77 project skips, and 8 failures caused by tests still requiring generic 44px Invariant menu, step, segmented, and close-control geometry. Those assertions now check authored dimensions. The targeted rerun passed all 8 affected cases with 16 project skips; the full UI gate was not rerun after those test-only corrections.
- `npm run check:packages:clean` built and validated the 0.3.0 package archives, installed a clean consumer, passed type/build/audit/bundle/SSR checks, then reported 45 browser passes, 74 conditional skips, and one stale popover-duration expectation. The test now expects the authored 300ms scale/filter and 200ms opacity entry; its targeted rerun against freshly installed 0.3.0 tarballs passed. The full clean-package gate was not rerun after this expectation-only correction.
- `npm run systems:update` generated 114 contracts and 102 declarations. `npm run check:systems` passed system verification, the quality guard (68 precisely inventoried exceptions), and contract type checking. `npm run test:systems` passed 4/4.
- `npm run check:mcp` passed 8/8. `npm run pack:mcp` refreshed `artifacts/highway-mcp-0.2.0.tgz` and passed the same 8 checks. Release metadata validation passed and `artifacts/highway-0.3.0-manifest.json` was refreshed.

### Visual evidence and limits

Settled direct-preview captures are in `artifacts/validation-screenshots/`: `invariant-dropdown-menu-open.png` shows the actual Dropdown with Edit, Duplicate, Share, and Delete; `invariant-profile-menu-open.png` shows the translucent profile menu; `invariant-thinking-indicator.png` and `invariant-step-indicator.png` show the restored emphasis and compact indicator. Rendered values were 180px for the Dropdown menu, 600 for semibold labels, and bar widths 36/10/10/10/10px at offsets 0/44/62/80/98px. The profile menu computed to 90% opacity, 24px backdrop blur, and a 20px radius.

The step buttons preserve the authored 10px/36px visible widths and add 8px of hit area above and below; their horizontal targets remain compact. Keyboard activation was exercised, but physical touch targets, real-device behavior, and assistive technology were not tested. The two full gates above were not rerun after their respective expectation-only test updates; the changed cases passed targeted reruns.
