"use client";
import { useId } from 'react'
import { DialogFrame } from './dialog-frame.jsx'

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  actions,
  className = '',
}) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <DialogFrame isOpen={isOpen} onClose={onClose} titleId={title ? titleId : undefined} descriptionId={description ? descriptionId : undefined} className={`hw-legacy-panel relative w-[90vw] max-w-[400px] rounded-3xl bg-[var(--inv-surface)] p-6 ${className}`}>
        {title && (
          <h2 id={titleId} className="highway-type-heading-lg highway-weight-semibold text-[var(--inv-heading)]">
            {title}
          </h2>
        )}

        {description && (
          <p id={descriptionId} className="mt-2 highway-type-body-sm text-[var(--inv-muted)]">
            {description}
          </p>
        )}

        {actions && (
          <div className="hw-dialog-actions mt-5">
            {actions}
          </div>
        )}
    </DialogFrame>
  )
}
