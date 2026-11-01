# Highway design decisions

Use these as composition defaults, not permission to replace a user's brand. Component-specific artwork, materials, and behavior remain intentional. Do not impose blanket bans on gradients, filled icons, glass, or springs.

## Hierarchy and grouping

Give the screen a clear task and primary action. Keep navigation quiet and let meaningful content carry emphasis. Separate groups with spacing before introducing another card. A card should establish a meaningful boundary, material, or interaction—not merely wrap a lone button.

Use the existing spacing tokens and a four-pixel rhythm, with small optical adjustments where needed. Space within a group should be smaller than between groups. Check visual alignment as well as bounding boxes: text baselines, icon centers, and number columns matter. Do not align mixed-size names and symbols by adding arbitrary offsets to each row.

Keep helper text close enough to explain its field but separated from the preceding border. Use a secondary role and make links recognizable. Avoid oversized empty margins in dense tools; preserve room around major sections.

## Type

Use `highway-type-{role}` or `data-highway-type` on custom app content. The current Highway roles at a 16px root are:

| Role | Size / line height | Default weight |
| --- | --- | --- |
| display | 30 / 36 | 600 |
| heading-xl | 24 / 32 | 600 |
| heading-lg | 18 / 28 | 600 |
| heading-md | 16 / 24 | 600 |
| body | 14 / 20 | 400 |
| body-sm | 13 / 20 | 400 |
| caption | 12 / 16 | 400 |
| micro | 11 / 16 | 500 |

Prefer the installed tokens if the contract changes. Roles set weight as well as size/line-height; use supported weight utilities for intentional emphasis. Keep primary content out of micro/caption roles. Use tabular figures for changing numbers; align numeric columns and retain full values when a compact format conceals precision. Do not change the root font size to shrink the UI. Editable mobile inputs remain at least 1rem.

## Controls and surfaces

- Use real buttons for actions, with accessible names on icon-only controls. Use supported ghost appearance for quiet actions and secondary appearance for raised neutral actions. Let shared Button own hover, disabled, focus, and icon geometry.
- Prefer supported component sizes over hand-tuning padding. A composite control should not have independently shrinking segments that expose seams; use documented static/motion options when appropriate.
- Preserve a dropdown trigger's subtle active background while open when the component supports it. Selection, hover, and focus are distinct states.
- Keep input icons and text in consistent columns. Use the shared field's focus treatment rather than adding another ring to its wrapper. Never remove keyboard focus to eliminate an unwanted blue outline; fix the conflicting layer.
- Choose radius tokens by component size. For custom nested surfaces, derive the inner radius from the outer radius minus the inset instead of applying the same radius everywhere. Shared components already own their geometry.
- Preserve real token/network artwork and documented missing-image fallbacks. Do not substitute initials when an explicit fallback is available. Overlapping avatars and badges need true cutouts where supported; painting a border the current background color fails on other surfaces.
- Preserve semantic success, warning, and error colors independently of branding. Filled status icons and line action icons can coexist when they serve different roles.

## Motion and state

Let shared components supply their motion. Add application motion only where it explains a change: copied confirmation, async completion, row reordering, or expanding a stack. Avoid decorative loops and whole-screen entrance choreography for routine tasks.

Keep labels and adjacent layout stable during feedback. Confirm clipboard success only after the write resolves; preserve a failure path. Retain an accessible text label when the visual swaps to a check. Do not implement a second copied animation if a supported shared component already handles the task.

For custom motion, prefer transform/opacity and existing motion tokens. Continuous resizing or reordering should start from the current visual position, not snap to the previous target. A short stagger can explain a group changing layout; do not delay input response or restart a long stagger on every resize tick. Respect reduced motion. Retain purpose-built springs or morphs rather than flattening every component to a single transition.

## Application layout and previews

Use one consistent navigation shell across entry points. For desktop tools with a long sidebar and content pane, consider independent scroll containers; keep search and navigation reachable. Avoid nested scroll areas without a clear purpose. On narrow screens, preserve access to navigation and controls rather than simply clipping them.

A preview should demonstrate the component itself. Expose supported independent choices separately (for example shape and grouping), preserve edited values as options change, and use an explicit replay action for restarting a motion demonstration. Avoid claiming that preview-only data or simulated operations are real service behavior.

## Focused review prompts

- Can the user identify the next action without inspecting decorative surfaces?
- Are these the actual installed components, with correct props and handlers?
- Do text, icons, and counts align at ordinary and enlarged text sizes?
- Does a menu, tooltip, or badge survive the real background and clipping context?
- Does changing a state preserve layout, data, and keyboard focus?
- Does the result still work with long content, a narrow viewport, and reduced motion?
