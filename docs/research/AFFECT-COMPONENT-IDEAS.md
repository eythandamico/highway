# Component ideas from Affect

Reference: https://www.affectui.com/components
Reviewed: 2026-10-28

These are proposed additions, not implemented components. Build with Highway's existing tokens, motion, and primitives.

| Idea | Purpose | Highway starting point |
| --- | --- | --- |
| Tool call card | Show an agent action, progress, result, and retry | ExpandCard, Status, CopyButton |
| File dropzone | Add files with progress, validation, retry, and removal | ContextTray, Progress, Feedback |
| Inline diff | Review individual edits with accept, reject, and undo | ReviewApplyCard; extend instead of duplicating |
| Usage meter | Show consumption against a limit | Progress, Status, typography tokens |
| Cited answer | Link answer passages to readable source details | MessageBubble, Tooltip, Sheet |

Start with the tool call card and file dropzone: they fill clear gaps in the current agent workflow. Keep upload, execution, billing, and persistence in the host app.

## Directory change

| Before | After |
| --- | --- |
| Marketing homepage before component discovery | Searchable component grid at `/` |
| Detail page required to see each preview | Actual shared previews in the grid, linked to details |

The grid reuses the showcase's native preview registry and existing isolated Invariant preview renderer. It mounts previews near the viewport and removes them offscreen. Thumbnail scaling and hidden demo controls affect presentation only; package component styles are unchanged.
