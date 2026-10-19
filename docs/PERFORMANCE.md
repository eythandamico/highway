# Performance principles and measurement

## Defaults carried forward

Keep the shell, session knowledge and first useful content available early. Route-specific code and CSS belong to the route/feature that needs them. The starter dynamically imports private file UI and fetches files only when that view opens. Avoid barrel imports that eagerly pull every optional chart/editor/provider into the homepage.

Don't refetch initial server data solely because a component mounted. Preserve already-visible content through account transitions and refreshes. Cancel obsolete requests and reject stale completions. A spinner is not a substitute for avoiding duplicated work.

Use width/height or aspect-ratio for media. Download offscreen artwork when near the viewport, without lowering the source quality. Use one genuinely important priority image rather than giving every card priority. Keep original assets and evaluate alternate formats/renditions at 2x and 3x device pixel ratios.

Use immutable caching only for versioned public assets. Private APIs and signed-in HTML are no-store. Don't improve a lab score by publicly caching personal data. Lossless compression can reduce transport size for text without changing decoded content, but verify HTTP behavior and don't double-compress a platform-managed response.

## What we learned from Playground

The initial app chunk dropped from roughly 742 KB to 234 KB when heavy features were deferred; shared CSS dropped from 587 KB to 529 KB. That did **not** demonstrate a median mobile load-time gain in the local comparison. Smaller initial code is a verified delivery change, not a universal speed claim. The test backend also lacked live data, so scores were not equivalent to real production sessions.

Don't transfer Playground's measured numbers to this starter or Yardwork. Their data, backend, content and critical paths differ.

## Audit procedure

1. Record commit, deployment, route, data fixture, account state, device, browser, throttle and cache conditions.
2. Measure cold and warm loads separately, mobile and desktop, guest and signed-in.
3. Run at least three comparable samples; retain slow runs unless technically invalid, and report medians plus spread.
4. Inspect network waterfalls: duplicate bootstrap, render-blocking CSS, early prefetch, delayed auth, oversized media and uncompressed text.
5. Measure interactions: search, filtering, tab switching, creating/saving, opening a sheet and loading a preview.
6. Inspect LCP, CLS and main-thread work alongside transfer size; use field INP/CrUX/RUM when enough genuine traffic exists.
7. Compare visible content and high-DPI screenshots; an error screen can be fast and useless.
8. Rerun the specific checks affected by a change rather than repeatedly auditing unchanged pages.

## Yardwork-specific budget candidates

Load maps/routing, charting, document generation and connector configuration only in their respective views. Keep Today/Schedule useful without waiting for weather or external route services. Persist drafts, paginate customer lists, precompute summaries where warranted and never block all navigation on a dashboard aggregator.

Keep background animations minimal in a work tool. Favor immediate state feedback and purposeful short transitions; respect reduced motion. Do not add offline writes until conflict resolution, retries and visible sync status are designed.

## Reusable continuity improvements

The authentication client loads on demand. `preloadOnce` shares the same lazy import across warmup and rendering and clears failed promises for retry. The files view uses that loader with a SectionBoundary, so a feature failure does not remove the surrounding workspace. Measure the actual import graph before adding charts, maps or rich editors to shared inputs or the shell; a component being reusable is not a reason to eagerly load all its optional dependencies.

Hover/focus preload is appropriate for likely navigation; idle warmup should honor save-data/slow-connection preferences and must not trigger mutations. Keep existing content during refresh and scope any future view-memory cache to the active identity/workspace. Do not trade away original visual quality or accessibility to improve a single aggregate score.

The enhanced date field keeps its native input available immediately and loads the calendar only when its popover opens. This prevents the calendar dependency graph from entering the production server-rendered text-input path. Keep the accessible loading state and verify native date typing as well as picker selection after changing this boundary.
