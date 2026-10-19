"use client";
import Icon from '../lib/icon.jsx'
import { useId } from 'react'
import { useDialogFocus } from '../lib/use-dialog-focus.js'
import { popoverStyle } from '../lib/popover.js'

export function Modal({
  isOpen,
  onClose,
  title,
  children,
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
        className={`relative w-[90vw] max-w-[560px] max-h-[85vh] rounded-3xl bg-[var(--inv-surface)] flex flex-col overflow-hidden ${className}`}
        style={{
          boxShadow: 'var(--inv-shadow)',
          ...popoverStyle(isOpen, 'center'),
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
          {title && (
            <h2 id={titleId} className="text-[var(--inv-text-lg)] font-semibold text-[var(--inv-heading)]">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--inv-muted)] hover:text-[var(--inv-heading)] hover:bg-[var(--inv-nav-hover-bg)] transition-[color,background-color] duration-[var(--duration-fast)] cursor-pointer ml-auto"
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
