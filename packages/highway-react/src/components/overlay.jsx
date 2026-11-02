"use client";
export function Overlay({ isOpen, onClick, className = '' }) {
  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-[var(--invariant-detail-duration)] ${className}`}
      style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      onClick={onClick}
    />
  )
}
