"use client";
import Icon from '../lib/icon.jsx'

export function SearchBar({ placeholder = 'Search...', shortcutKey = '⌘K', className = '', onSearch, autoFocus = false }) {
  return (
    <div className={`w-full max-w-4xl rounded-2xl bg-[var(--inv-surface)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--inv-accent)] transition-shadow duration-150 ${className}`} style={{ outline: '1px solid var(--inv-outline)' }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon name="search" size={20} className="text-[var(--inv-muted)] flex-shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-[15px] text-[var(--inv-heading)] placeholder-[var(--inv-muted)] outline-none focus:outline-none focus-visible:outline-none"
          autoFocus={autoFocus}
        />
        {shortcutKey && (
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--inv-bg-alt)] text-[13px] font-mono font-medium text-[var(--inv-muted)] flex-shrink-0">
            {shortcutKey}
          </kbd>
        )}
      </div>
    </div>
  )
}
