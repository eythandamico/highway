"use client";
import { useState } from 'react'
import Icon from '../lib/icon.jsx'

const VARIANTS = {
  info: {
    icon: 'alert',
    bg: 'var(--inv-accent)',
  },
  success: {
    icon: 'check',
    bg: '#10b981',
  },
  warning: {
    icon: 'alert',
    bg: '#f59e0b',
  },
  error: {
    icon: 'close',
    bg: '#ef4444',
  },
}

export function Alert({
  variant = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
  className = '',
}) {
  const [dismissed, setDismissed] = useState(false)
  const [removing, setRemoving] = useState(false)

  const config = VARIANTS[variant] || VARIANTS.info

  const handleDismiss = () => {
    setRemoving(true)
    setTimeout(() => {
      setDismissed(true)
      onDismiss?.()
    }, 300)
  }

  if (dismissed) return null

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl bg-[var(--inv-bg-alt)] p-4 ${className}`}
      style={{
        opacity: removing ? 0 : 1,
        transform: removing ? 'scale(0.98) translateY(-4px)' : 'scale(1) translateY(0)',
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: config.bg }}
      >
        <Icon name={config.icon} size={16} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        {title && (
          <div className="text-[length:var(--type-secondary)] font-medium text-[var(--inv-heading)]">
            {title}
          </div>
        )}
        {description && (
          <div className={`text-[length:var(--type-secondary)] text-[var(--inv-muted)] ${title ? 'mt-0.5' : ''}`}>
            {description}
          </div>
        )}
      </div>

      {/* Dismiss */}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--inv-muted)] hover:text-[var(--inv-heading)] hover:bg-[var(--inv-surface)] cursor-pointer transition-[color,background-color,scale] duration-[var(--duration-fast)] active:scale-[0.9] flex-shrink-0"
          aria-label="Dismiss"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  )
}
