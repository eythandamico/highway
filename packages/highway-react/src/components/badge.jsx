"use client";
export function Badge({ label, variant = 'dark', className = '' }) {
  const variants = {
    dark: 'bg-[var(--inv-heading)] text-[var(--inv-bg)]',
    subdued: 'bg-[var(--inv-bg-alt)] text-[var(--inv-heading)]',
    outline: 'bg-transparent text-[var(--inv-heading)] border border-[var(--inv-border)]',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full highway-type-caption highway-weight-medium ${variants[variant] || variants.dark} ${className}`}>
      {label}
    </span>
  )
}
