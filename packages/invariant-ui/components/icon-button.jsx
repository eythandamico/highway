"use client";
import Icon from '../lib/icon.jsx'

export function IconButton({
  icon,
  label,
  size = 'default',
  elevated = false,
  onClick,
  className = '',
  ...rest
}) {
  const sizes = {
    small: 'w-9 h-9',
    default: 'w-11 h-11',
  }

  const iconSizes = {
    small: 16,
    default: 20,
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${sizes[size]} flex items-center justify-center rounded-xl bg-[var(--inv-surface)] text-[var(--inv-muted)] hover:text-[var(--inv-heading)] transition-[color,box-shadow,scale] duration-200 ease-out cursor-pointer active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
        elevated ? '[box-shadow:var(--inv-shadow-sm)] hover:[box-shadow:var(--inv-shadow-sm-hover)]' : 'hover:bg-[var(--inv-nav-hover-bg)]'
      } ${className}`}
      aria-label={label}
      {...rest}
    >
      <Icon name={icon} size={iconSizes[size]} />
    </button>
  )
}
