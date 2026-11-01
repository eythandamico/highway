"use client";
import { useDialogFocus } from '../lib/use-dialog-focus.js'
import { popoverStyle } from '../lib/popover.js'
export function DialogFrame({ isOpen, onClose, titleId, descriptionId, className, children }) {
  const panelRef = useDialogFocus(isOpen, onClose)
  return <div className="fixed inset-0 z-50 flex items-center justify-center" inert={!isOpen} aria-hidden={!isOpen} style={{pointerEvents:isOpen?'auto':'none'}}>
    <div data-dialog-backdrop onMouseDown={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-[var(--invariant-detail-duration)]" style={{opacity:isOpen?1:0}}/>
    <div ref={panelRef} role="dialog" aria-modal="true" aria-describedby={descriptionId} aria-labelledby={titleId} aria-label={titleId?undefined:'Dialog'} tabIndex={-1} className={className} style={{boxShadow:'var(--inv-shadow)',...popoverStyle(isOpen,'center')}} onMouseDown={e=>e.stopPropagation()}>{children}</div>
  </div>
}
