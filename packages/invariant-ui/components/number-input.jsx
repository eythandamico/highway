"use client";
import { useRef, useEffect, useCallback, useState } from 'react'
import Icon from '../lib/icon.jsx'

export function NumberInput({
  label,
  value = 0,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  error,
  className = '',
}) {
  const [bouncing, setBouncing] = useState(false)
  const holdTimer = useRef(null)
  const holdInterval = useRef(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  const valueRef = useRef(value)
  useEffect(() => { valueRef.current = value }, [value])
  const numberRef = useRef(null)

  const clamp = useCallback((v) => {
    let n = Number(v)
    if (isNaN(n)) n = 0
    if (min !== undefined) n = Math.max(min, n)
    if (max !== undefined) n = Math.min(max, n)
    return n
  }, [min, max])

  const triggerBounce = useCallback(() => {
    setBouncing(true)
    setTimeout(() => setBouncing(false), 200)
  }, [])

  const doStep = useCallback((dir) => {
    const current = valueRef.current
    const next = clamp(current + step * dir)
    if (next === current) return
    onChangeRef.current?.(next)
    triggerBounce()
  }, [clamp, step, triggerBounce])

  const startHold = useCallback((dir) => {
    doStep(dir)
    let speed = 200
    const tick = () => {
      doStep(dir)
      speed = Math.max(40, speed * 0.85)
      holdInterval.current = setTimeout(tick, speed)
    }
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setTimeout(tick, speed)
    }, 400)
  }, [doStep])

  const stopHold = useCallback(() => {
    clearTimeout(holdTimer.current)
    clearTimeout(holdInterval.current)
    holdTimer.current = null
    holdInterval.current = null
  }, [])

  useEffect(() => {
    return () => stopHold()
  }, [stopHold])

  // Scroll to change
  const handleWheel = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    const dir = e.deltaY < 0 ? 1 : -1
    const next = clamp(valueRef.current + step * dir)
    onChangeRef.current?.(next)
    triggerBounce()
  }, [disabled, clamp, step, triggerBounce])

  const atMin = min !== undefined && value <= min
  const atMax = max !== undefined && value >= max

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className={`text-[13px] font-medium ${disabled ? 'text-[var(--inv-muted)]' : 'text-[var(--inv-heading)]'}`}>{label}</label>
      )}
      <div
        className={`inline-flex items-center gap-0.5 h-12 rounded-2xl bg-[var(--inv-bg-alt)] p-1 ${
          disabled ? 'opacity-40 pointer-events-none' : ''
        }`}
        style={{ transition: 'width 0.2s ease-out' }}
      >
        <button
          type="button"
          onMouseDown={() => !disabled && !atMin && startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          disabled={disabled || atMin}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--inv-surface)] text-[var(--inv-muted)] hover:text-[var(--inv-heading)] transition-[color,scale,box-shadow] duration-200 ease-out cursor-pointer active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 [box-shadow:var(--inv-shadow-sm)] active:[box-shadow:none]"
          aria-label="Decrease"
        >
          <Icon name="minus" size={16} />
        </button>

        <div
          ref={numberRef}
          onWheel={handleWheel}
          className="text-center text-[15px] font-medium text-[var(--inv-heading)] select-none cursor-ns-resize tabular-nums"
          style={{
            minWidth: 40,
            padding: '0 8px',
            transition: 'min-width 0.25s cubic-bezier(0.34, 1.3, 0.64, 1)',
          }}
        >
          <span
            className="inline-block"
            style={{
              transition: 'transform 0.2s cubic-bezier(0.34, 1.3, 0.64, 1)',
              transform: bouncing ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {value}
          </span>
        </div>

        <button
          type="button"
          onMouseDown={() => !disabled && !atMax && startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          disabled={disabled || atMax}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--inv-surface)] text-[var(--inv-muted)] hover:text-[var(--inv-heading)] transition-[color,scale,box-shadow] duration-200 ease-out cursor-pointer active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 [box-shadow:var(--inv-shadow-sm)] active:[box-shadow:none]"
          aria-label="Increase"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
      {error && !disabled && (
        <span className="text-[13px] text-red-400">{error}</span>
      )}
    </div>
  )
}
