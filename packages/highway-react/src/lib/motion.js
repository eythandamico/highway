/** Named interaction recipes. Values live in tokens.css; keep each family's character. */
export const motionTransitions = Object.freeze({
  invariantPopoverEnter: 'scale var(--invariant-enter-duration) var(--ease-spring), opacity var(--duration-normal) ease-out, filter var(--invariant-enter-duration) var(--ease-spring)',
  invariantPopoverExit: 'scale var(--invariant-detail-duration) var(--invariant-exit-ease), opacity var(--duration-fast) ease-in, filter var(--invariant-detail-duration) var(--invariant-exit-ease)',
  invariantSlideEnter: 'opacity var(--duration-normal) ease-out, transform var(--invariant-enter-duration) var(--ease-spring), filter var(--invariant-enter-duration) var(--ease-spring)',
  invariantSlideExit: 'opacity var(--duration-fast) ease-in, transform var(--invariant-detail-duration) var(--invariant-exit-ease), filter var(--invariant-detail-duration) var(--invariant-exit-ease)',
  selection: 'left var(--selection-duration) var(--ease-emphasized), width var(--selection-duration) var(--ease-emphasized)',
  slider: 'width var(--slider-duration) var(--ease-spring)',
  expansionSize: 'height var(--expansion-duration) var(--ease-emphasized)',
  expansionEnter: 'opacity var(--expansion-content-duration) ease var(--expansion-content-delay), filter var(--expansion-content-duration) ease var(--expansion-content-delay), transform var(--expansion-content-duration) var(--ease-emphasized) var(--expansion-content-delay)',
  expansionExit: 'opacity var(--expansion-exit-duration) ease, filter var(--expansion-exit-duration) ease, transform var(--expansion-exit-duration) ease',
  expansionChevron: 'transform var(--selection-duration) var(--ease-emphasized)',
  color: 'background-color var(--duration-normal)',
  popoverEnter: 'scale var(--overlay-enter-duration) var(--ease-spring), opacity var(--duration-normal) var(--ease-standard), filter var(--overlay-enter-duration) var(--ease-spring)',
  popoverExit: 'scale var(--overlay-exit-duration) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard), filter var(--overlay-exit-duration) var(--ease-standard)',
  slideEnter: 'opacity var(--duration-normal) var(--ease-standard), transform var(--overlay-enter-duration) var(--ease-spring), filter var(--overlay-enter-duration) var(--ease-spring)',
  slideExit: 'opacity var(--duration-fast) var(--ease-standard), transform var(--overlay-exit-duration) var(--ease-standard), filter var(--overlay-exit-duration) var(--ease-standard)',
})

/** Read at use time, never snapshot a browser preference at module initialization. */
export function prefersReducedMotion() {
  return typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
