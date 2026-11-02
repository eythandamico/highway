"use client";
import Icon from '../lib/icon.jsx'
import { Button } from './ui/button'
import { useId } from 'react'
import { DialogFrame } from './dialog-frame.jsx'

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) {
  const titleId = useId()

  return (
    <DialogFrame isOpen={isOpen} onClose={onClose} titleId={title ? titleId : undefined} className={`hw-legacy-panel relative w-[90vw] max-w-[560px] max-h-[85vh] rounded-3xl bg-[var(--inv-surface)] flex flex-col overflow-hidden ${className}`}>
        <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-0 flex-shrink-0">
          {title && (
            <h2 id={titleId} className="min-w-0 highway-type-heading-lg highway-weight-semibold text-[var(--inv-heading)]">
              {title}
            </h2>
          )}
          <Button variant="ghost" size="icon-xs"
            type="button"
            onClick={onClose}
            className="ml-auto"
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
    </DialogFrame>
  )
}
