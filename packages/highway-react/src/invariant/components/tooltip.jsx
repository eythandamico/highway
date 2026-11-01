"use client";
import { popoverStyle } from '../lib/popover.js'

export function Tooltip({ label, visible, position = 'top', className = '' }) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
  }

  const origins = {
    top: 'bottom center',
    bottom: 'top center',
  }

  return (
    <div
      role="tooltip" aria-hidden={!visible}
      className={`hw-tooltip absolute ${positions[position]} px-3 py-1.5 rounded-xl bg-[var(--inv-nav)] text-[var(--inv-nav-text-active)] highway-type-body highway-weight-medium pointer-events-none ${className}`}
      style={{
        ...popoverStyle(visible, origins[position]),
        boxShadow: 'var(--inv-shadow)',
      }}
    >
      {label}
    </div>
  )
}
