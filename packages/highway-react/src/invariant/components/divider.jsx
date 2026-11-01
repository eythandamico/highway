"use client";
export function Divider({ spacing = 'md', className = '' }) {
  const spacings = {
    none: 'my-0',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-8',
  }

  return (
    <hr
      className={`border-0 border-t border-[var(--inv-border)] ${spacings[spacing] || spacings.md} ${className}`}
    />
  )
}
