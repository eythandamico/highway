"use client";
import { useId } from 'react'
import { useDialogFocus } from '../lib/use-dialog-focus.js'
import { popoverStyle } from '../lib/popover.js'

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  actions,
  className = '',
}) {
  const panelRef = useDialogFocus(isOpen, onClose)
  const titleId = useId()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      inert={!isOpen}
      aria-hidden={!isOpen}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div
        data-dialog-backdrop
        onMouseDown={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-[var(--duration-fast)]"
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        className={`relative w-[90vw] max-w-[400px] rounded-3xl bg-[var(--inv-surface)] p-6 ${className}`}
        style={{
          boxShadow: 'var(--inv-shadow)',
          ...popoverStyle(isOpen, 'center'),
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id={titleId} className="text-[var(--inv-text-lg)] font-semibold text-[var(--inv-heading)]">
            {title}
          </h2>
        )}

        {description && (
          <p className="mt-2 text-[var(--inv-text-sm)] text-[var(--inv-muted)]">
            {description}
          </p>
        )}

        {actions && (
          <div className="mt-5 flex items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
