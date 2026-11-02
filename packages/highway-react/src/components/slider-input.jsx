"use client";
import { motionTransitions } from '../lib/motion.js'
import { useReducedMotion } from '../lib/use-reduced-motion.js'
import { useRef, useEffect, useState, useId } from 'react'

/** @param {import('../types').SliderInputProps} props */
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
  const reducedMotion = useReducedMotion()
  const [keyboardInput, setKeyboardInput] = useState(false)
  const labelId = useId()
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const lower = Number.isFinite(min) ? min : 0
  const upper = Number.isFinite(max) ? Math.max(lower, max) : Math.max(lower, 100)
  const increment = Number.isFinite(step) && step > 0 ? step : 1
  const clamp = n => Math.max(lower, Math.min(upper, n))
  const snap = n => clamp(Number((lower + Math.round((n - lower) / increment) * increment).toPrecision(12)))
  const current = clamp(Number.isFinite(value) ? value : lower)
  const range = upper - lower
  const progress = range > 0 ? (current - lower) / range : 0
  const pointer = useRef(null)
  const dragTimer = useRef(null)
  function stop() {
    pointer.current = null
    clearTimeout(dragTimer.current)
    setIsDragging(false)
  }
  useEffect(() => {
    window.addEventListener('blur', stop)
    return () => { clearTimeout(dragTimer.current); window.removeEventListener('blur', stop) }
  }, [])
  function move(e) {
    const rect = trackRef.current.getBoundingClientRect()
    if (rect.width > 0) onChange?.(snap(lower + Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * range))
  }
  function handleDown(e) {
    if (disabled || e.button !== 0 || pointer.current !== null) return
    e.preventDefault()
    setKeyboardInput(false)
    e.currentTarget.focus()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointer.current = e.pointerId
    clearTimeout(dragTimer.current)
    // Preserve the original spring on quick clicks; sustained drags track directly.
    dragTimer.current = setTimeout(() => setIsDragging(true), 80)
    move(e)
  }
  function keyDown(e) {
    if (disabled) return
    const deltas = { ArrowRight: increment, ArrowUp: increment, ArrowLeft: -increment, ArrowDown: -increment, PageUp: increment * 10, PageDown: -increment * 10 }
    if (!(e.key in deltas) && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    setKeyboardInput(true)
    onChange?.(e.key === 'Home' ? lower : e.key === 'End' ? upper : snap(current + deltas[e.key]))
  }

  const displayValue = `${current}${suffix}`

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label ? undefined : 'Value'} aria-labelledby={label ? labelId : undefined}
      aria-valuemin={lower} aria-valuemax={upper} aria-valuenow={current}
      aria-valuetext={`${current}${suffix}`} aria-disabled={disabled}
      data-dragging={isDragging || undefined}
      onKeyDown={keyDown}
      onPointerDown={handleDown}
      onPointerMove={e => { if (!disabled && pointer.current === e.pointerId) move(e) }}
      onPointerUp={e => { if (pointer.current === e.pointerId) stop() }} onPointerCancel={e => { if (pointer.current === e.pointerId) stop() }} onLostPointerCapture={e => { if (pointer.current === e.pointerId) stop() }}
      className={`hw-slider ${className}`}
    >
      {/* Filled portion with pull tab inside */}
      <div
        className="hw-slider-fill"
        style={{
          width: `max(0px, calc(${Math.max(progress * 100, 8)}% - var(--control-inset) * 2))`,
          maxWidth: 'calc(100% - var(--control-inset) * 2)' ,
          transition: isDragging || reducedMotion || keyboardInput ? 'none' : motionTransitions.slider,
        }}
      >
        <div className="hw-slider-grip"/>
      </div>

      {/* Label left */}
      {label && (
        <span id={labelId} className="hw-slider-label">
          {label}
        </span>
      )}

      {/* Value right */}
      <span className="hw-slider-value">
        {displayValue}
      </span>
    </div>
  )
}
