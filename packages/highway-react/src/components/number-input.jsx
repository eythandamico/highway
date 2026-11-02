"use client";
import { useRef, useEffect, useCallback, useState, useId } from 'react'
import Icon from '../lib/icon.jsx'
import { Button } from './ui/button'
import { useReducedMotion } from '../lib/use-reduced-motion.js'

/** @param {import('../types').NumberInputProps} props */
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
  const labelId = useId()
  const reducedMotion = useReducedMotion()
  const bounceTimer = useRef(null)
  const held = useRef(false)
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
    clearTimeout(bounceTimer.current)
    bounceTimer.current = setTimeout(() => setBouncing(false), 200)
  }, [])

  const doStep = useCallback((dir) => {
    const current = valueRef.current
    const next = clamp(Number((current + (Number.isFinite(step) && step > 0 ? step : 1) * dir).toPrecision(12)))
    if (next === current) return
    valueRef.current = next
    onChangeRef.current?.(next)
    triggerBounce()
  }, [clamp, step, triggerBounce])

  const startHold = useCallback((dir) => {
    held.current = false
    let speed = 200
    const tick = () => {
      held.current = true
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
    if (disabled) stopHold()
    window.addEventListener('blur', stopHold)
    return () => { stopHold(); window.removeEventListener('blur', stopHold) }
  }, [stopHold, disabled])

  useEffect(() => () => clearTimeout(bounceTimer.current), [])

  const pointerDown = (e, direction) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startHold(direction)
  }
  const activate = (e, direction) => {
    if (e.detail === 0 || !held.current) doStep(direction)
    held.current = false
  }

  useEffect(() => {
    const element = numberRef.current
    const wheel = event => {
      if (disabled || !element.parentElement.contains(document.activeElement) || event.deltaY === 0) return
      event.preventDefault()
      doStep(event.deltaY < 0 ? 1 : -1)
    }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => element.removeEventListener('wheel', wheel)
  }, [disabled, doStep])

  const atMin = min !== undefined && value <= min
  const atMax = max !== undefined && value >= max

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span id={labelId} className={`highway-type-body-sm highway-weight-medium ${disabled ? 'text-[var(--inv-muted)]' : 'text-[var(--inv-heading)]'}`}>{label}</span>
      )}
      <div
        className={`inline-flex items-center gap-0.5 rounded-[calc(var(--radius-control-sm)+var(--space-1))] bg-[var(--inv-bg-alt)] p-1 ${
          disabled ? 'opacity-40 pointer-events-none' : ''
        }`}
        aria-describedby={error && !disabled ? `${labelId}-error` : undefined} role="group" aria-labelledby={label ? labelId : undefined} aria-label={label ? undefined : "Number"}

      >
        <Button variant="secondary" size="icon-sm"
          type="button"
          onPointerDown={e => pointerDown(e, -1)}
          onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold}
          onClick={e => activate(e, -1)}
          disabled={disabled || atMin}
          className="hw-number-step"
          aria-label="Decrease"
        >
          <Icon name="minus" size={16} />
        </Button>

        <div
          ref={numberRef}
          role="status" aria-live="polite" aria-label={typeof label === 'string' ? label : 'Value'}
          className="text-center highway-type-body highway-weight-medium text-[var(--inv-heading)] select-none cursor-default tabular-nums"
          style={{
            minWidth: 40,
            padding: '0 8px',

          }}
        >
          <span
            className="inline-block"
            style={{
              transition: reducedMotion ? 'none' : 'transform var(--duration-fast) var(--ease-standard)',
              transform: bouncing && !reducedMotion ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            {value}
          </span>
        </div>

        <Button variant="secondary" size="icon-sm"
          type="button"
          onPointerDown={e => pointerDown(e, 1)}
          onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold}
          onClick={e => activate(e, 1)}
          disabled={disabled || atMax}
          className="hw-number-step"
          aria-label="Increase"
        >
          <Icon name="plus" size={16} />
        </Button>
      </div>
      {error && !disabled && (
        <span id={`${labelId}-error`} role="alert" className="highway-type-body-sm text-[var(--status-error)]">{error}</span>
      )}
    </div>
  )
}
