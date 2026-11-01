# Interaction components

All examples use public `@highway/react` exports inside `HighwayTheme`, with `@highway/styles/styles.css` loaded once. The [checked example](../examples/contracts/interactions.tsx) compiles against the built declarations.

| Export | State / callbacks | Use and limits |
| --- | --- | --- |
| Combobox | `value`, `defaultValue`, `onValueChange` | Searchable single choice; option values must be unique nonempty strings. Disabled options cannot be selected. `name` emits a hidden form value. |
| MultiSelect | `value: string[]`, `defaultValue`, `onValueChange` | Searchable multiple choice; hidden form values repeat `name`. Parent owns clearing/filtering and persistence. |
| DateRangePicker | `value: {from,to}`, `defaultValue`, `onValueChange` | Local ISO calendar strings, lazy calendar, optional presets/min/max. Invalid/incomplete edits remain editable; host validates before submission. Single month keeps mobile layout bounded. |
| FilterToolbar | `activeCount`, `onClear` | Composes existing filters; no data fetching, URL mutation or implicit filtering. |
| InlineEdit | `value`, `onSave`, `validate` | Host-controlled committed value; local draft persists after rejection. Enter saves, Escape/Cancel discard while idle. No blur-save. Parent updates `value` after successful persistence. |
| ButtonGroup | `label`, native div props / children | Named group of related actions. Native Tab order; not a roving toolbar or a persistent selection control. |
| SplitButton | `onAction`, `actions`, `onActionError` | Main action plus related menu alternatives; promise-based pending and retryable failure. |
| CopyButton | `value`, `onCopied`, `onCopyError`, native Button props | Clipboard result determines feedback; no false success when clipboard access fails. |
| CommandPalette | `open`, `onOpenChange`, `items` | Host owns shortcut/navigation. Search, enabled-option navigation, modal focus, real async completion and failure retention. No global listeners. |

Use unique option values/command values; labels remain human-readable. Do not switch between controlled and uncontrolled mode during a component's lifetime. Changing a `defaultValue` does not reset state; remount intentionally or control `value`.

For ActionButton, return the real promise from `onAction`. The legacy `loadingDuration` no longer determines success. `onActionError` can log/report failures without replacing the built-in retryable state. Explicitly disabled controls remain disabled; loading actions stay focusable and block repeat activation.

For Table, prefer `rowKey="id"`, `selectedKeys` and `onSelectedKeysChange`. Selected keys remain host-owned when records are filtered/paged. The visible select-all action changes only visible records. The legacy `onSelectionChange` callback reports indices in the input `data`, never positions in the sorted view. Stable IDs must be unique. Large/server-paged datasets remain the host's responsibility; the component is not a virtualized grid.

For temporary messages, mount `ToastProvider` and call `useToast().addToast(title, {message, variant, duration, action})`. Variants are info, success, warning, error, and loading. Three cards display at once; queued cards start their timers when shown. Zero or infinite duration persists. Timers pause on hover, keyboard focus, dragging, and a hidden document. Dismiss with the close button, Escape while focused, or a horizontal swipe. `updateToast(id, options)` updates a card; `dismissToast(id)` removes it. `promiseToast(promise, {loading, success, error})` follows the real promise and returns a toast ID. Actions are host-owned React controls. Highway owns the implementation; no Sonner dependency.

Examples with placeholder comments are wiring illustrations, not operational backend adapters. No component ships credentials, authentication, email, database, payment or AI connections.


### Core family review

`SegmentedControl` accepts `label`, whole-control `disabled`, and per-tab `disabled`. It remains a controlled set of native pressed buttons (`activeTab`, `onTabChange`) with normal Tab/Space/Enter activation. Keyboard selection is immediate; pointer selection follows the shared motion tokens. Options wrap while preserving authored compact padding; icon-only options use 36px geometry. See `/components/family` for the side-by-side real-component review.

`SliderInput` preserves its range keyboard commands and controlled value API. Its label and value no longer overlap when text wraps; pointer dragging respects a single active pointer. Neither control adds navigation or persistence.


### Menus, overlays and feedback

`Menu` accepts an accessible `label`; `MenuItem` and `Dropdown` items accept `disabled`. A standalone Menu supports arrows, Home/End and first-letter navigation with one tab stop; native activation is preserved. Its host owns opening/closing. For anchored menus, prefer the existing Dropdown/DropdownMenu behavior and focus restoration. These are actions, not page navigation.

`Accordion` announces expansion, hides collapsed content from keyboard navigation, and observes changes to open content height. `Card` video variants expose Play/Pause and mute controls; reduced motion prevents automatic playback, but users can explicitly play media. `Alert` dismissal fires once and is canceled if the component unmounts before its exit completes.

See `/components/surfaces` for real-component long-content, nested-overlay and feedback examples. Example callbacks are local demonstrations, not backend adapters.

BottomNav menu layers and its inactive chat/navigation layer are inert while hidden. Open menus use the shared keyboard navigation and restore trigger focus on Escape. Disabled actions are honored by Dropdown, ProfileMenu and BottomNav.

## Agent tools

`VoiceRecorder` is a compact capsule that records microphone audio locally using MediaRecorder. Hold and release to record; slide left while holding to discard. A tap or keyboard activation starts recording with explicit Pause/Resume and Stop controls. Cancelled pointer gestures release the microphone; releasing while permission is still pending cancels that request’s result. Start requires a secure context and explicit browser permission. Pause/resume excludes paused time; Stop releases the microphone and prepares playback with Play/Pause and an accessible seek control. The waveform uses the Prompt Bar’s fine rounded bars and smoothed actual microphone frequency samples when Web Audio is available and is hidden under reduced motion. Recording still works without metering. Discard releases the object URL. Attach calls `onAttach({ blob, durationMs, mimeType })`; rejection retains the audio for retry. No upload or transcription happens automatically. Unmount stops tracks and releases browser resources; a canceled permission request releases any stream that arrives later. Do not disable or hide the Stop control while recording. Browser codecs, microphone hardware and permissions require host/device testing.



See `examples/contracts/agent-tools.tsx` for exact imports and callback wiring. The recorder has no AI service, storage or infrastructure dependency.

Voice playback uses the recorded audio’s decoded amplitude waveform as its seek track, with played bars highlighted. No visible label is needed; the recorder region and keyboard-operable seek control retain accessible names. If decoding is unavailable, a flat seek track remains usable.
