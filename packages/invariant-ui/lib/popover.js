const SPRING = 'var(--ease-spring)'
const EASE_OUT = 'var(--ease-standard)'

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

const reduced = (isOpen) => ({
  opacity: isOpen ? 1 : 0,
  pointerEvents: isOpen ? 'auto' : 'none',
})

const SLIDE_OFFSETS = {
  'top-left':     { x: '-4px', y: '8px',  origin: 'bottom left' },
  'top-center':   { x: '0',    y: '8px',  origin: 'bottom center' },
  'top-right':    { x: '4px',  y: '8px',  origin: 'bottom right' },
  'bottom-left':  { x: '-4px', y: '-8px', origin: 'top left' },
  'bottom-center':{ x: '0',    y: '-8px', origin: 'top center' },
  'bottom-right': { x: '4px',  y: '-8px', origin: 'top right' },
  'left-top':     { x: '8px',  y: '-4px', origin: 'right top' },
  'left-center':  { x: '8px',  y: '0',    origin: 'right center' },
  'left-bottom':  { x: '8px',  y: '4px',  origin: 'right bottom' },
  'right-top':    { x: '-8px', y: '-4px', origin: 'left top' },
  'right-center': { x: '-8px', y: '0',    origin: 'left center' },
  'right-bottom': { x: '-8px', y: '4px',  origin: 'left bottom' },
}

/**
 * Scale + blur popover animation.
 * @param {boolean} isOpen
 * @param {string} origin - CSS transform-origin (e.g. 'top left', 'bottom center')
 */
export function popoverStyle(isOpen, origin) {
  if (prefersReducedMotion) return reduced(isOpen)
  return {
    transformOrigin: origin,
    scale: isOpen ? '1' : '0.85',
    opacity: isOpen ? 1 : 0,
    filter: isOpen ? 'blur(0px)' : 'blur(8px)',
    transition: isOpen
      ? `scale var(--overlay-enter-duration) ${SPRING}, opacity var(--duration-normal) var(--ease-standard), filter var(--overlay-enter-duration) ${SPRING}`
      : `scale var(--overlay-exit-duration) ${EASE_OUT}, opacity var(--duration-fast) var(--ease-standard), filter var(--overlay-exit-duration) ${EASE_OUT}`,
    pointerEvents: isOpen ? 'auto' : 'none',
  }
}

/**
 * Directional slide + blur animation.
 * @param {boolean} isOpen
 * @param {'top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right'} placement
 */
export function slideStyle(isOpen, placement = 'bottom-center') {
  if (prefersReducedMotion) return reduced(isOpen)
  const offset = SLIDE_OFFSETS[placement] || SLIDE_OFFSETS['bottom-center']
  return {
    transformOrigin: offset.origin,
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translate(0, 0)' : `translate(${offset.x}, ${offset.y})`,
    filter: isOpen ? 'blur(0px)' : 'blur(8px)',
    transition: isOpen
      ? `opacity var(--duration-normal) var(--ease-standard), transform var(--overlay-enter-duration) ${SPRING}, filter var(--overlay-enter-duration) ${SPRING}`
      : `opacity var(--duration-fast) var(--ease-standard), transform var(--overlay-exit-duration) ${EASE_OUT}, filter var(--overlay-exit-duration) ${EASE_OUT}`,
    pointerEvents: isOpen ? 'auto' : 'none',
  }
}

export const menuShadow = {
  boxShadow: 'var(--inv-menu-shadow)',
}
