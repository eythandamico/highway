"use client";
import Icon from '../lib/icon.jsx'

export function EmptyState({
  icon = 'search',
  title = 'No results',
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      <div
        className="w-12 h-12 rounded-2xl bg-[var(--inv-bg-alt)] flex items-center justify-center mb-4"
      >
        <Icon name={icon} size={20} className="text-[var(--inv-muted)]" />
      </div>

      <h3 className="highway-type-heading-lg highway-weight-semibold text-[var(--inv-heading)] mb-1">
        {title}
      </h3>

      {description && (
        <p className="highway-type-body-sm text-[var(--inv-muted)] max-w-[280px]">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  )
}
