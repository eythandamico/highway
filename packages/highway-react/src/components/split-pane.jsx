"use client";
import { useRef, useCallback, useEffect, useState } from 'react'

/** @param {import('../types').SplitPaneProps} props */
export function SplitPane({
  left,
  right,
  direction = 'horizontal',
  defaultSplit = 50,
  minSize = 20,
  height,
  className = '',
}) {
  const containerRef = useRef(null)
  const dragging = useRef(false)
  const minimum = Number.isFinite(minSize) ? Math.max(0, Math.min(50, minSize)) : 20
  const [requestedSplit, setSplit] = useState(Number.isFinite(defaultSplit) ? defaultSplit : 50)
  const split = Math.max(minimum, Math.min(100 - minimum, requestedSplit))
  const [isDragging, setIsDragging] = useState(false)

  const isHorizontal = direction === 'horizontal'

  const getSplitFromPointer = useCallback((clientX, clientY) => {
    const el = containerRef.current
    if (!el) return split
    const rect = el.getBoundingClientRect()
    const pct = isHorizontal
      ? ((clientX - rect.left) / rect.width) * 100
      : ((clientY - rect.top) / rect.height) * 100
    return Math.max(minimum, Math.min(100 - minimum, pct))
  }, [isHorizontal, minimum, split])

  const stop = () => { dragging.current = false; setIsDragging(false) }
  useEffect(() => {
    window.addEventListener('blur', stop)
    return () => window.removeEventListener('blur', stop)
  }, [])
  const onDividerDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.focus()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    setIsDragging(true)
  }
  const onKeyDown = e => {
    const previous = isHorizontal ? 'ArrowLeft' : 'ArrowUp'
    const next = isHorizontal ? 'ArrowRight' : 'ArrowDown'
    if (![previous, next, 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    setSplit(value => e.key === 'Home' ? minimum : e.key === 'End' ? 100 - minimum : Math.max(minimum, Math.min(100 - minimum, value + (e.key === next ? 5 : -5))))
  }

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} rounded-2xl bg-[var(--inv-bg)] overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* First pane */}
      <div
        className="overflow-auto rounded-xl bg-[var(--inv-bg-alt)] m-1"
        style={{
          [isHorizontal ? 'width' : 'height']: `calc(${split}% - 8px)`,
          flexShrink: 0,
        }}
      >
        {left}
      </div>

      {/* Divider */}
      <div
        className={`relative flex items-center justify-center flex-shrink-0 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--inv-accent)] ${
          isHorizontal ? 'w-2 cursor-col-resize' : 'h-2 cursor-row-resize'
        }`}
        role="separator" tabIndex={0} aria-label="Resize panes"
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-valuemin={minimum} aria-valuemax={100 - minimum} aria-valuenow={Math.round(split)}
        style={{ touchAction: 'none', userSelect: 'none' }}
        onKeyDown={onKeyDown} onPointerDown={onDividerDown}
        onPointerMove={e => { if (dragging.current) setSplit(getSplitFromPointer(e.clientX, e.clientY)) }}
        onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
      >
        {/* Pull tab */}
        <div
          className={`rounded-full bg-[var(--inv-muted)] transition-all duration-[var(--invariant-detail-duration)] ${
            isHorizontal
              ? `w-[3px] ${isDragging ? 'h-8 bg-[var(--inv-heading)]' : 'h-6 group-hover:h-8'}`
              : `h-[3px] ${isDragging ? 'w-8 bg-[var(--inv-heading)]' : 'w-6 group-hover:w-8'}`
          }`}
        />
      </div>

      {/* Second pane */}
      <div
        className="overflow-auto flex-1 rounded-xl bg-[var(--inv-bg-alt)] m-1"
      >
        {right}
      </div>
    </div>
  )
}
