"use client";
import { useDialogFocus } from '../lib/use-dialog-focus.js'
import { useState, useRef, useCallback, useEffect } from 'react'

const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)'
const SPRING_BOUNCE = 'cubic-bezier(0.34, 1.1, 0.64, 1)'
const DURATION = 500

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) {
  const dragging = useRef(false)
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
      const frame = requestAnimationFrame(() => setVisible(false))
      const timer = setTimeout(() => setMounted(false), DURATION)
      return () => { clearTimeout(timer); cancelAnimationFrame(frame) }
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    if (!mounted) return
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mounted])

  // Page transforms
  const setPageStyle = useCallback((scale, ty, radius, brightness, animate) => {
    const root = document.getElementById('root')
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
  }, [])

  // Setup/teardown body styles
  useEffect(() => {
    if (!mounted) return
    document.body.style.overflow = 'hidden'
    document.body.style.background = '#000'
    return () => {
      document.body.style.overflow = ''
      document.body.style.background = ''
      const root = document.getElementById('root')
      if (root) {
        root.style.transform = ''
        root.style.borderRadius = ''
        root.style.overflow = ''
        root.style.height = ''
        root.style.transformOrigin = ''
        root.style.filter = ''
        setTimeout(() => { root.style.transition = '' }, DURATION)
      }
    }
  }, [mounted])

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
    e.preventDefault()
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    dragging.current = true
    dragStartY.current = clientY
    lastY.current = clientY
    lastTime.current = performance.now()
    dragVelocity.current = 0
    setIsDragging(true)
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
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

    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      const offset = dragOffsetRef.current
      const velocity = dragVelocity.current

      setIsDragging(false)
      document.body.style.userSelect = ''

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

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [setPageStyle])

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
          opacity: visible ? Math.max(0, 1 - dragOffset / 400) : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: isDragging ? 'none' : `opacity ${DURATION}ms ease-out`,
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
          transition: isDragging
            ? 'none'
            : `transform ${DURATION}ms ${visible ? SPRING_BOUNCE : SPRING}`,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12), 0 -2px 8px rgba(0,0,0,0.08)',
          willChange: 'transform',
        }}
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-3" aria-label="Close sheet">Close</button>
        {/* Pull tab area — larger hit target */}
        <div
          className="flex items-center justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing flex-shrink-0"
          onMouseDown={onHandleDown}
          onTouchStart={onHandleDown}
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
          <div className="px-6 pb-4 flex-shrink-0">
            <h2 className="text-[var(--inv-text-lg)] font-semibold text-[var(--inv-heading)]">
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
