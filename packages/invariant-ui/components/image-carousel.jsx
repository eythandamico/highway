"use client";
import { useState, useCallback, useRef, useEffect } from 'react'
import Icon from '../lib/icon.jsx'
import { StepIndicator } from './step-indicator.jsx'

const CONTROL_POSITIONS = {
  bottom: {
    container: 'bottom-3 left-0 right-0 flex-row justify-center',
    hide: 'translateY(8px)',
    show: 'translateY(0)',
  },
  top: {
    container: 'top-3 left-0 right-0 flex-row justify-center',
    hide: 'translateY(-8px)',
    show: 'translateY(0)',
  },
  left: {
    container: 'left-3 top-0 bottom-0 flex-col justify-center',
    hide: 'translateX(-8px)',
    show: 'translateX(0)',
  },
  right: {
    container: 'right-3 top-0 bottom-0 flex-col justify-center',
    hide: 'translateX(8px)',
    show: 'translateX(0)',
  },
}

export function ImageCarousel({
  images = [],
  height = 320,
  autoHide = false,
  controlsPosition = 'bottom',
  className = '',
}) {
  const [active, setActive] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [direction, setDirection] = useState(0) // -1 left, 1 right
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(!autoHide)
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState(1)
  const dragStart = useRef(null)
  const dragStartTime = useRef(null)
  const hideTimer = useRef(null)

  const count = images.length

  const wrap = useCallback((i) => count ? ((i % count) + count) % count : 0, [count])

  // Auto-hide logic
  const showControls = useCallback(() => {
    if (!autoHide) return
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2500)
  }, [autoHide])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (autoHide) showControls()
      else { setControlsVisible(true); clearTimeout(hideTimer.current) }
    })
    return () => { cancelAnimationFrame(frame); clearTimeout(hideTimer.current) }
  }, [autoHide, showControls])

  const slideTo = useCallback((nextIdx, dir) => {
    setDirection(dir)
    setSliding(true)
    // After transition, update active and reset
    setTimeout(() => {
      setActive(nextIdx)
      setSliding(false)
      setDirection(0)
    }, 450)
    showControls()
  }, [showControls])

  const prev = useCallback(() => {
    if (sliding) return
    slideTo(wrap(active - 1), -1)
  }, [active, sliding, slideTo, wrap])

  const next = useCallback(() => {
    if (sliding) return
    slideTo(wrap(active + 1), 1)
  }, [active, sliding, slideTo, wrap])

  const goTo = useCallback((i) => {
    if (sliding || i === active) return
    slideTo(i, i > active ? 1 : -1)
  }, [active, sliding, slideTo])

  // Keyboard navigation
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [prev, next])

  // Drag/swipe handlers
  const isVert = controlsPosition === 'left' || controlsPosition === 'right'

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0 || sliding) return
    dragStart.current = isVert ? e.clientY : e.clientX
    dragStartTime.current = Date.now()
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [sliding, isVert])

  const onPointerMove = useCallback((e) => {
    if (dragStart.current === null) return
    setDragOffset((isVert ? e.clientY : e.clientX) - dragStart.current)
  }, [isVert])

  const onPointerUp = useCallback((e) => {
    if (dragStart.current === null) return
    const dx = (isVert ? e.clientY : e.clientX) - dragStart.current
    const dt = Date.now() - dragStartTime.current
    const velocity = Math.abs(dx) / Math.max(dt, 1)
    const container = containerRef.current
    const threshold = container ? container.offsetWidth * 0.2 : 80

    if (Math.abs(dx) > threshold || velocity > 0.5) {
      if (dx > 0) prev()
      else next()
    }

    dragStart.current = null
    dragStartTime.current = null
    setDragOffset(0)
    setIsDragging(false)
    showControls()
  }, [prev, next, showControls])

  // Preload adjacent images
  useEffect(() => {
    ;[wrap(active - 1), wrap(active + 1)].forEach(i => {
      const src = typeof images[i] === 'string' ? images[i] : images[i]?.src
      if (src) { const img = new Image(); img.src = src }
    })
  }, [active, count, images, wrap])

  const getImgSrc = (i) => { const s = images[i]; return typeof s === 'string' ? s : s?.src || '' }
  const getImgAlt = (i) => { const s = images[i]; return typeof s === 'string' ? '' : s?.alt || '' }

  const isVerticalSlide = controlsPosition === 'left' || controlsPosition === 'right'
  const prevIdx = wrap(active - 1)
  const nextIdx = wrap(active + 1)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize(isVerticalSlide ? entry.contentRect.height : entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [isVerticalSlide, count])
  const dragPx = containerSize ? (dragOffset / containerSize) * 100 : 0

  // Slide positions: current at 0, prev at -100, next at +100
  // When sliding, shift everything by -direction * 100
  const shift = sliding ? -direction * 100 : 0
  const transition = isDragging ? 'none' : sliding ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
  const axis = isVerticalSlide ? 'Y' : 'X'

  const slides = [
    { idx: prevIdx, base: -100 },
    { idx: active, base: 0 },
    { idx: nextIdx, base: 100 },
  ]

  if (count === 0) return null
  return (
    <div
      ref={containerRef}
      className={`rounded-2xl overflow-hidden outline-none ${className}`}
      tabIndex={0}
      onMouseMove={autoHide ? showControls : undefined}
      onMouseEnter={autoHide ? showControls : undefined}
    >
      <div
        className="relative overflow-hidden select-none"
        style={{ height, cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {slides.map(({ idx, base }) => (
          <div
            key={`${active}-${base}`}
            className="absolute inset-0"
            style={{
              transform: `translate${axis}(${base + shift + dragPx}%)`,
              transition,
            }}
          >
            <img
              src={getImgSrc(idx)}
              alt={getImgAlt(idx)}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>
        ))}

        {/* Controls */}
        {count > 1 && (() => {
          const pos = CONTROL_POSITIONS[controlsPosition] || CONTROL_POSITIONS.bottom
          const isVertical = controlsPosition === 'left' || controlsPosition === 'right'
          return (
          <div
            className={`absolute flex items-center gap-2 ${pos.container}`}
            style={{
              opacity: controlsVisible ? 1 : 0,
              transform: controlsVisible ? pos.show : pos.hide,
              transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
              pointerEvents: controlsVisible ? 'auto' : 'none',
            }}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full bg-[var(--inv-heading)]/[0.32] backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-[color,scale] duration-[var(--duration-fast)] active:scale-[0.96]"
              aria-label="Previous"
            >
              <Icon name={isVertical ? 'arrow-up' : 'chevron-left'} size={18} style={isVertical ? {} : { marginRight: 1 }} />
            </button>
            <div className={`bg-[var(--inv-heading)]/[0.32] backdrop-blur-md rounded-full flex items-center ${isVertical ? 'flex-col py-2.5 w-8' : 'px-2.5 h-8'}`}>
              <StepIndicator
                steps={count}
                activeStep={sliding ? (direction === 1 ? nextIdx : prevIdx) : active}
                onStepChange={goTo}
                variant="dots-light"
                className={isVertical ? 'flex-col' : ''}
              />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full bg-[var(--inv-heading)]/[0.32] backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-[color,scale] duration-[var(--duration-fast)] active:scale-[0.96]"
              aria-label="Next"
            >
              <Icon name={isVertical ? 'arrow-down' : 'chevron-right'} size={18} style={isVertical ? {} : { marginLeft: 1 }} />
            </button>
          </div>
          )
        })()}
      </div>
    </div>
  )
}
