"use client";
import { useState, useRef, useEffect } from 'react'
import { useReducedMotion } from '../lib/use-reduced-motion.js'
import Icon from '../lib/icon.jsx'
import { Button } from '../../components/ui/button'

const VARIANTS = {
  info: { color: 'var(--status-info)' },
  success: { color: 'var(--status-success)' },
  warning: { color: 'var(--status-warning)' },
  error: { color: 'var(--status-error)' },
}

export function StatusIcon({ variant }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {variant === 'success' ? <path d="M9.5 18.5 3 12l2.8-2.8 3.7 3.7L18.2 4l2.8 2.8z" />
      : variant === 'error' ? <path d="m6.4 3.6 5.6 5.6 5.6-5.6 2.8 2.8-5.6 5.6 5.6 5.6-2.8 2.8-5.6-5.6-5.6 5.6-2.8-2.8 5.6-5.6-5.6-5.6z" />
      : variant === 'warning' ? <>
        <path d="M10.27 3.97a2 2 0 0 1 3.46 0l8.1 14.03A2 2 0 0 1 20.1 21H3.9a2 2 0 0 1-1.73-3z" />
        <path d="M11 8h2v6h-2zm0 8h2v2h-2z" fill="var(--alert-icon-bg)" />
      </> : <>
        <circle cx="12" cy="12" r="10" />
        <path d="M11 10h2v7h-2zm0-4h2v2h-2z" fill="var(--alert-icon-bg)" />
      </>}
  </svg>;
}

export function Alert({
  variant = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
  className = '',
}) {
  const timer = useRef(null)
  const started = useRef(false)
  const reduced = useReducedMotion()
  useEffect(() => () => clearTimeout(timer.current), [])
  const [dismissed, setDismissed] = useState(false)
  const [removing, setRemoving] = useState(false)

  const config = VARIANTS[variant] || VARIANTS.info

  const handleDismiss = () => {
    if (started.current) return
    started.current = true
    setRemoving(true)
    timer.current = setTimeout(() => {
      setDismissed(true)
      onDismiss?.()
    }, reduced ? 0 : 300)
  }

  if (dismissed) return null

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`hw-surface flex items-start gap-3 rounded-2xl bg-[var(--inv-surface)] p-4 ${className}`}
      style={{
        boxShadow: 'var(--control-shadow)',
        opacity: removing ? 0 : 1,
        transform: removing ? 'scale(0.98) translateY(-4px)' : 'scale(1) translateY(0)',
        transition: reduced ? 'none' : 'opacity var(--feedback-duration) var(--ease-standard), transform var(--feedback-duration) var(--ease-standard)',
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: config.color, color: 'var(--status-on-solid)', '--alert-icon-bg': config.color }}
      >
        <StatusIcon variant={variant} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-0.5">
        {title && (
          <div className="highway-type-body highway-weight-medium text-[var(--inv-heading)]">
            {title}
          </div>
        )}
        {description && (
          <div className={`highway-type-body-sm text-[var(--inv-muted)] ${title ? 'mt-0.5' : ''}`}>
            {description}
          </div>
        )}
      </div>

      {/* Dismiss */}
      {dismissible && (
        <Button variant="ghost" size="icon-xs"
          type="button"
          onClick={handleDismiss}
          disabled={removing}

          aria-label="Dismiss"
        >
          <Icon name="close" size={14} />
        </Button>
      )}
    </div>
  )
}
