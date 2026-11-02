"use client";
import Icon from '../lib/icon.jsx'
import { Button } from './ui/button'
import { useReducedMotion } from '../lib/use-reduced-motion.js'
import { preserveInlineStyles } from '../lib/preserve-inline-styles.js'
import { useDialogFocus } from '../lib/use-dialog-focus.js'
import { useState, useRef, useCallback, useEffect } from 'react'

const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)'
const SPRING_BOUNCE = 'cubic-bezier(0.34, 1.1, 0.64, 1)'
const DURATION = 500

function animatePageTarget(pageTarget, scale, ty, radius, brightness, animate) {
    const root = pageTarget
    if (!root) return
    root.style.transition = animate
      ? `transform ${DURATION}ms ${SPRING}, border-radius ${DURATION}ms ${SPRING}, filter ${DURATION}ms ${SPRING}`
      : 'none'
    root.style.transform = scale === 1 ? '' : `scale(${scale}) translateY(${ty}px)`
    root.style.borderRadius = radius === 0 ? '' : `${radius}px`
    root.style.filter = brightness === 1 ? '' : `brightness(${brightness})`
    root.style.overflow = scale < 1 ? 'hidden' : ''
    root.style.height = scale < 1 ? '100vh' : ''
    root.style.transformOrigin = 'top center'
}

/** @param {import('../types').BottomSheetProps} props */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  pageTarget = null,
}) {
  const reduced = useReducedMotion()
  const dragging = useRef(false)
  const pointerId = useRef(null)
  const dragStartY = useRef(0)
  const dragVelocity = useRef(0)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [mounted, setMounted] = useState(isOpen)
  const [visible, setVisible] = useState(false)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  const dragOffsetRef = useRef(0)
  const rafRef = useRef(null)
  const panelRef = useDialogFocus(mounted && isOpen, onClose)

  // Mount/unmount with animation timing
  useEffect(() => {
    if (isOpen) {
      let secondFrame
      const firstFrame = requestAnimationFrame(() => {
        setMounted(true)
        secondFrame = requestAnimationFrame(() => setVisible(true))
      })
      return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
    } else {
      const frame = requestAnimationFrame(() => {
        setVisible(false)
        setIsDragging(false)
        setDragOffset(0)
        dragOffsetRef.current = 0
        dragging.current = false
      })
      const timer = setTimeout(() => setMounted(false), reduced ? 0 : DURATION)
      return () => { clearTimeout(timer); cancelAnimationFrame(frame) }
    }
  }, [isOpen, reduced])

  // Page transforms
  const setPageStyle = useCallback((scale, ty, radius, brightness, animate) => {
    animatePageTarget(pageTarget, reduced ? 1 : scale, reduced ? 0 : ty, reduced ? 0 : radius, reduced ? 1 : brightness, animate && !reduced)
  }, [pageTarget, reduced])

  // Page animation is explicitly scoped to a caller-owned sibling element.
  useEffect(() => {
    if (!mounted || !pageTarget) return
    const properties = ['transition', 'transform', 'border-radius', 'filter', 'overflow', 'height', 'transform-origin']
    return preserveInlineStyles(pageTarget, properties)
  }, [mounted, pageTarget])

  // Animate page on visible change
  useEffect(() => {
    if (!mounted) return
    if (visible) {
      setPageStyle(0.92, 14, 20, 0.4, true)
    } else {
      setPageStyle(1, 0, 0, 1, true)
    }
  }, [visible, mounted, setPageStyle])

  // Drag handlers
  const onHandleDown = useCallback((e) => {
    if (!isOpen || e.button !== 0 || dragging.current) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerId.current = e.pointerId
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    dragging.current = true
    dragStartY.current = clientY
    lastY.current = clientY
    lastTime.current = performance.now()
    dragVelocity.current = 0
    setIsDragging(true)

  }, [isOpen])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || e.pointerId !== pointerId.current) return
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
      const dy = Math.max(0, clientY - dragStartY.current)

      // Track velocity
      const now = performance.now()
      const dt = now - lastTime.current
      if (dt > 0) {
        dragVelocity.current = (clientY - lastY.current) / dt
        lastY.current = clientY
        lastTime.current = now
      }

      dragOffsetRef.current = dy

      // RAF-batched update
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setDragOffset(dy)
        // Interactive page transform
        const progress = Math.min(dy / 400, 1)
        const eased = 1 - Math.pow(1 - progress, 2) // ease-out curve
        setPageStyle(
          0.92 + eased * 0.08,
          14 - eased * 14,
          20 - eased * 20,
          0.4 + eased * 0.6,
          false
        )
      })
    }

    const onUp = (e) => {
      if (!dragging.current || e.pointerId !== pointerId.current) return
      dragging.current = false
      const offset = dragOffsetRef.current
      const velocity = dragVelocity.current

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setIsDragging(false)


      // Dismiss if dragged far enough OR fast flick downward
      if (offset > 100 || velocity > 0.5) {
        setPageStyle(1, 0, 0, 1, true)
        onCloseRef.current?.()
      } else {
        setPageStyle(0.92, 14, 20, 0.4, true)
      }
      setDragOffset(0)
      dragOffsetRef.current = 0
      dragVelocity.current = 0
    }

    const cancel = event => {
      if (event?.type === 'pointercancel' && event.pointerId !== pointerId.current) return
      dragging.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      dragOffsetRef.current = 0
      setDragOffset(0)
      setIsDragging(false)
      if (isOpen) setPageStyle(0.92, 14, 20, 0.4, true)
    }
    window.addEventListener('blur', cancel)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    return () => {
      dragging.current = false
      window.removeEventListener('blur', cancel)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [setPageStyle, isOpen])

  // Rubber band: natural resistance that increases with distance
  const rubberBand = (offset) => {
    const dim = (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.95
    const c = 0.55
    return (1 - (1 / ((offset * c / dim) + 1))) * dim
  }

  const visualOffset = rubberBand(dragOffset)

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <div
        data-dialog-backdrop
        className="fixed inset-0 z-[80]"
        style={{
          background: pageTarget ? 'transparent' : 'rgba(0,0,0,0.4)',
          opacity: visible ? Math.max(0, 1 - dragOffset / 400) : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: isDragging || reduced ? 'none' : `opacity ${DURATION}ms ease-out`,
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Details"}
        tabIndex={-1}
        inert={!isOpen}
        className={`fixed left-0 right-0 bottom-0 z-[81] bg-[var(--inv-surface)] rounded-t-3xl h-[95vh] flex flex-col ${className}`}
        style={{
          transform: visible
            ? `translateY(${visualOffset}px)`
            : 'translateY(100%)',
          transition: isDragging || reduced
            ? 'none'
            : `transform ${DURATION}ms ${visible ? SPRING_BOUNCE : SPRING}`,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12), 0 -2px 8px rgba(0,0,0,0.08)',
          willChange: 'transform',
        }}
      >
        <Button variant="ghost" size="icon-xs" type="button" onClick={onClose} className="absolute top-4 right-4" aria-label="Close sheet"><Icon name="close" size={16}/></Button>
        {/* Pull tab area — larger hit target */}
        <div
          className="flex items-center justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing flex-shrink-0"
          style={{ touchAction: 'none', userSelect: 'none' }}
          onPointerDown={onHandleDown}
        >
          <div
            className="h-[5px] rounded-full"
            style={{
              width: isDragging ? 48 : 36,
              backgroundColor: isDragging ? 'var(--inv-muted)' : 'var(--inv-border)',
              transition: `width 0.25s ${SPRING_BOUNCE}, background-color 0.2s`,
            }}
          />
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 pr-16 pb-4 flex-shrink-0">
            <h2 className="highway-type-heading-lg highway-weight-semibold text-[var(--inv-heading)]">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8" style={{ overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </>
  )
}
