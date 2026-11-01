# Agent tools validation

October 28, 2026 · local Highway 0.3.0 candidate. Not published or deployed.

## Included

VoiceRecorder, ContextTray and ReviewApplyCard are exported by @highway/react and styled by @highway/styles. Their showcase entries use the same source owners. Catalog contracts, strict examples, generated API references, interaction documentation and the bundled MCP snapshot include all three.

## Checks

- Typecheck, lint, design guard/contrast, starter and Storybook builds passed.
- Seven new browser cases passed, covering simulated microphone permission, cancellation, late streams, pause/resume, attachment failure/retry, discard/unmount cleanup, controlled context inspection/removal/focus, and review/apply duplicate prevention, failure/retry, rejection and narrow layouts.
- The broader UI run exposed an existing Alert timer race in its test. That test now controls time while preserving duplicate-dismissal and cleanup assertions; desktop and reduced-motion reruns passed. No Alert implementation changed.
- Systems checks passed: 114 contracts, 102 declaration modules, four systems tests. The quality guard retains 68 inherited exceptions; none were added for these components.
- Clean consumer passed: fresh archives, strict types, production build, bundle checks, SSR smoke, and 37 browser tests (62 viewport-applicability skips), including use of the installed agent-tool exports.
- MCP passed eight tests with 114 exports and 78 declaration resources. React/styles archives, MCP archive, example lockfile and release checksum manifest were refreshed.
- Production dependency audit for the example consumer returned zero findings. Its full dependency install still reports a development-dependency audit warning; no unrelated dependency upgrade was made.

## Boundaries

Automated microphone tests use simulated browser media; they do not certify physical microphones, device interruptions or all browser codecs. Microphone recording needs a secure context and user permission. Web Audio metering is optional and hidden under reduced motion. Upload and transcription are host integrations.

Context is controlled by the host. Apply callbacks must reject on failure and resolve only after the domain operation succeeds. Use a new key for each proposal. No backend, AI provider, merge engine or rollback system is bundled.

## Compact voice interaction

The recorder now uses a hold-to-record capsule, slide-left cancellation, tap/keyboard controls, and in-capsule playback/seek controls. The live canvas uses rounded, smoothed microphone bars in the Prompt Bar style. Its callback API is unchanged. Pointer cancellation and lost capture release recording resources; keyboard focus follows state changes. Reduced motion removes capsule resizing and hides the live waveform without disabling recording controls.

The updated source passed the full UI suite (52 passed, 68 project-applicability skips), including seven focused recorder tests. Gesture and playback tests use simulated media; physical-device microphone behavior still needs host review.

Compact recorder package verification: fresh archive/type/build/SSR stages passed; the installed recorder browser smoke passed. The full consumer suite reported 38 passed, 66 viewport skips and one stale documentation selector; that selector was updated to the existing section ID and its focused rerun passed. MCP passed all eight tests; its archive and release checksum manifest were regenerated. No physical microphone access was used for automated verification.

## Fluidity refinement verification

October 28, 2026 · current VoiceRecorder capsule and waveform refinement.

- The `check:ui:full` build stages passed: typecheck, lint, design guard/contrast, starter build, and Storybook build. After correcting the focused test's computed transition-duration threshold, `npm run test:ui -- --workers=1` passed the full browser suite (53 passed, 71 skipped). The focused recorder test also verifies active controls stay disabled while stopping and reduced motion removes the capsule transition and hides the canvas.
- `npm run check:packages:clean` passed with fresh React/styles archives, strict consumer types, full and minimal Vite builds, bundle checks, SSR smoke, and the installed package browser suite (39 passed, 66 viewport skips).
- Systems verification passed with 114 contracts, 102 declaration modules, and all four systems tests. MCP verification and repacking passed all eight tests with 114 exports and 78 declarations. The example lockfile integrity and 0.3.0 release checksum manifest were refreshed against the latest React/styles archives.
- Synthetic-audio browser review used a 178 Hz oscillator routed only to a MediaStreamDestination; no physical microphone was accessed. At a 1180 px desktop viewport, the capsule grew from 288 px idle to 480 px recording over its 400 ms max-width transition (observed widths at 0/100/200/300/450 ms: 288/446.5/476.1/479.8/480 px). The capsule stayed 480 × 64 px from recording to ready, with no outer geometry jump. The recorded canvas contained visible rounded waveform bars; stopping released the synthetic track, closed its AudioContext, and produced no page errors.
- Screenshots: `artifacts/validation-screenshots/voice-recorder-fluidity-idle.png`, `artifacts/validation-screenshots/voice-recorder-fluidity-recording.png`, and `artifacts/validation-screenshots/voice-recorder-fluidity-ready.png`.

## Decoded playback waveform verification

October 28, 2026 · minimal playback capsule with a decoded waveform and transparent keyboard-operable seek range.

- Added browser coverage using a valid, two-second PCM WAV fixture. It verifies all 64 decoded bars vary with the source amplitude, ArrowRight moves the accessible seek range and played portion, and pausing retains the selected position. A rejected decode keeps the flat 64-bar seek control available and closes its decoding AudioContext.
- The UI gate passed (55 passed, 77 project skips). Clean consumer passed with fresh 0.3.0 archives, types/build/bundle/SSR checks, and 39 browser tests (66 viewport skips). Systems checks passed with 114 contracts, 102 declarations and four tests. MCP repacking passed all eight tests (114 exports, 78 declarations).
- Visual review used a synthetic WAV and simulated browser media; no physical microphone was accessed. The ready capsule measured 480 × 64 px with 64 decoded bars ranging from 3.6 to 30 px, a 44 px seek target, Play, Discard, and Attach controls, and no page errors.
- Screenshot: `artifacts/validation-screenshots/voice-recorder-playback-waveform-light.png`.
