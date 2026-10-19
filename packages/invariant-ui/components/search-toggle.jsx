"use client";
import { useState, useRef, useEffect } from 'react'
import Icon from '../lib/icon.jsx'
import { useClickOutside } from '../lib/use-click-outside.js'

export function SearchToggle({ placeholder = 'Search anything...', shortcutKey = '⌘K', onSearch, className = '' }) {
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef(null)
  const spring = 'cubic-bezier(0.34, 1.3, 0.64, 1)'

  useClickOutside(expanded, () => setExpanded(false))

  useEffect(() => {
    if (expanded) {
      const t = setTimeout(() => inputRef.current?.focus(), 200)
      return () => clearTimeout(t)
    }
  }, [expanded])

  return (
    <div className={`relative ${className}`} onMouseDown={e => e.stopPropagation()}>
      <div
        className="flex items-center bg-[var(--inv-surface)] overflow-hidden"
        style={{
          width: expanded ? 420 : 44,
          height: 44,
          borderRadius: expanded ? 16 : 12,
          boxShadow: 'var(--inv-shadow-sm)',
          transition: `width 0.35s ${spring}, border-radius 0.35s ${spring}`,
        }}
      >
        {/* Search icon — always on left */}
        <button
          type="button"
          onClick={() => !expanded && setExpanded(true)}
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-[var(--inv-muted)] hover:text-[var(--inv-heading)] cursor-pointer transition-colors duration-150"
          aria-label="Open search"
        >
          <Icon name="search" size={20} />
        </button>

        {/* Input + close */}
        <div
          style={{
            opacity: expanded ? 1 : 0,
            transition: expanded
              ? 'opacity 0.2s ease 0.12s'
              : 'opacity 0.1s ease',
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingRight: expanded ? 4 : 0,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            onChange={(e) => onSearch?.(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setExpanded(false) }}
            className="flex-1 min-w-0 bg-transparent text-[15px] text-[var(--inv-heading)] placeholder-[var(--inv-muted)] outline-none"
            tabIndex={expanded ? 0 : -1}
          />

          {/* Close button — right side */}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-[var(--inv-muted)] hover:text-[var(--inv-heading)] hover:bg-[var(--inv-nav-hover-bg)] cursor-pointer transition-[color,background-color] duration-150"
            aria-label="Close search"
            tabIndex={expanded ? 0 : -1}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
