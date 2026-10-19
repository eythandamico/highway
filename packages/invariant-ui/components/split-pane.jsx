"use client";
import { useRef, useCallback, useEffect, useState } from 'react'

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
  const [split, setSplit] = useState(defaultSplit)
  const [isDragging, setIsDragging] = useState(false)

  const isHorizontal = direction === 'horizontal'

  const getSplitFromPointer = useCallback((clientX, clientY) => {
    const el = containerRef.current
    if (!el) return split
    const rect = el.getBoundingClientRect()
    const pct = isHorizontal
      ? ((clientX - rect.left) / rect.width) * 100
      : ((clientY - rect.top) / rect.height) * 100
    return Math.max(minSize, Math.min(100 - minSize, pct))
  }, [isHorizontal, minSize, split])

  const onDividerDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    setIsDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize'
  }, [isHorizontal])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      setSplit(getSplitFromPointer(e.clientX, e.clientY))
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      setIsDragging(false)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [getSplitFromPointer])

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
        className={`relative flex items-center justify-center flex-shrink-0 group ${
          isHorizontal ? 'w-2 cursor-col-resize' : 'h-2 cursor-row-resize'
        }`}
        onMouseDown={onDividerDown}
      >
        {/* Pull tab */}
        <div
          className={`rounded-full bg-[var(--inv-muted)] transition-all duration-[var(--duration-fast)] ${
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
