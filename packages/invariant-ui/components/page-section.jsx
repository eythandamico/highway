"use client";
export function PageSection({
  width = 'md',
  className = '',
  children,
  ...rest
}) {
  const widths = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 ${widths[width] || widths.md} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
