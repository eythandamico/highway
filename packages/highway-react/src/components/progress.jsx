"use client";
import { useEffect, useRef, useState, useId } from 'react'

import { useReducedMotion } from '../lib/use-reduced-motion.js'

/** @param {import('../types').ProgressProps} props */
export function Progress({
  value = 0,
  max = 100,
  label,
  showValue = false,
  size = 'default',
  animated = true,
  className = '',
}) {
  const labelId = useId()
  const reducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const fromRef = useRef(0)
  const currentRef = useRef(0)

  const pct = Number.isFinite(max) && max > 0 && Number.isFinite(value) ? Math.max(0, Math.min(100, (value / max) * 100)) : 0

  // Animate the number counting up
  useEffect(() => {
    if (!animated || reducedMotion || !showValue) {
      currentRef.current = pct
      return
    }

    fromRef.current = currentRef.current
    startRef.current = null

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const duration = 600
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = fromRef.current + (pct - fromRef.current) * eased

      currentRef.current = current
      setDisplayValue(Math.round(current))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [pct, animated, showValue, reducedMotion])

  const heights = {
    small: 'h-1',
    default: 'h-2',
    large: 'h-3',
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span id={labelId} className="highway-type-body-sm highway-weight-medium text-[var(--inv-heading)]">{label}</span>
          )}
          {showValue && (
            <span className="highway-type-body-sm highway-weight-medium text-[var(--inv-muted)] tabular-nums">
              {animated && !reducedMotion ? displayValue : Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div role="progressbar" aria-label={label ? undefined : 'Progress'} aria-labelledby={label ? labelId : undefined} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className={`w-full ${heights[size] || heights.default} rounded-full bg-[var(--inv-bg-alt)] overflow-hidden`}>
        <div
          className={`h-full rounded-full relative overflow-hidden`}
          style={{
            width: `${pct}%`,
            backgroundColor: 'var(--inv-heading)',
            transition: animated && !reducedMotion ? 'width var(--progress-duration) cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {/* Shimmer highlight */}
          {animated && !reducedMotion && pct > 0 && pct < 100 && (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'inv-progress-shimmer var(--progress-shimmer-duration) ease-in-out infinite',
              }}
            />
          )}
        </div>
      </div>
      <style>{`
        @keyframes inv-progress-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
