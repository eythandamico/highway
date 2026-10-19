"use client";
import { useRef, useEffect, useState } from 'react'

export function SliderInput({
  label,
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  disabled = false,
  className = '',
}) {
  const trackRef = useRef(null)
  const dragging = useRef(false)
  const dragTimer = useRef(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  const [isDragging, setIsDragging] = useState(false)

  const range = max - min
  const progress = range > 0 ? (value - min) / range : 0

  function getValueFromX(clientX) {
    const track = trackRef.current
    if (!track) return value
    const rect = track.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = min + pct * range
    const stepped = Math.round(raw / step) * step
    return Math.max(min, Math.min(max, stepped))
  }

  function handleDown(e) {
    if (disabled) return
    e.preventDefault()
    dragging.current = true
    document.body.style.userSelect = 'none'
    onChangeRef.current?.(getValueFromX(e.clientX))
    // Delay isDragging so quick clicks keep the spring
    dragTimer.current = setTimeout(() => setIsDragging(true), 80)
  }

  useEffect(() => {
    function handleMove(e) {
      if (!dragging.current) return
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const raw = min + pct * (max - min)
      const stepped = Math.round(raw / step) * step
      const clamped = Math.max(min, Math.min(max, stepped))
      onChangeRef.current?.(clamped)
    }

    function handleUp() {
      if (!dragging.current) return
      dragging.current = false
      clearTimeout(dragTimer.current)
      setIsDragging(false)
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [min, max, step])

  const displayValue = `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`

  return (
    <div
      ref={trackRef}
      onMouseDown={handleDown}
      className={`relative h-12 rounded-2xl bg-[var(--inv-bg-alt)] overflow-hidden select-none group ${disabled ? 'opacity-40 pointer-events-none' : 'cursor-col-resize'} ${className}`}
    >
      {/* Filled portion with pull tab inside */}
      <div
        className="absolute top-1 bottom-1 left-1 bg-[var(--inv-surface)] rounded-xl flex items-center justify-end pointer-events-none"
        style={{
          width: `calc(${Math.max(progress * 100, 8)}% - 8px)`,
          maxWidth: 'calc(100% - 8px)',
          transition: isDragging ? 'none' : 'width 0.25s cubic-bezier(0.34, 1.3, 0.64, 1)',
        }}
      >
        <div
          className={`rounded-full bg-[var(--inv-muted)] mr-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-[var(--duration-fast)] ${
            isDragging ? 'w-1 h-6 !opacity-100 bg-[var(--inv-heading)]' : 'w-[3px] h-5'
          }`}
        />
      </div>

      {/* Label left */}
      {label && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[length:var(--type-secondary)] font-medium text-[var(--inv-muted)] pointer-events-none z-10">
          {label}
        </span>
      )}

      {/* Value right */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[length:var(--type-secondary)] font-medium text-[var(--inv-muted)] pointer-events-none z-10">
        {displayValue}
      </span>
    </div>
  )
}
