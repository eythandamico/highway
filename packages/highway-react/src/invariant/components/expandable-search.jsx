"use client";
import { useState, useRef, useEffect } from 'react'
import Icon from '../lib/icon.jsx'
import { Button } from '../../components/ui/button'
import { useClickOutside } from '../lib/use-click-outside.js'

export function ExpandableSearch({ placeholder = 'Search anything...', shortcutKey = '⌘K', onSearch, className = '' }) {
  // Retained for source API compatibility; keyboard shortcut binding belongs to the host.
  void shortcutKey
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
        className="hw-search-toggle-shell flex items-center bg-[var(--inv-surface)] overflow-hidden"
        style={{
          width: expanded ? 420 : 44,
          height: 44,
          borderRadius: expanded ? 16 : 12,
          boxShadow: 'var(--search-shell-shadow, var(--control-shadow))',
          transition: `width 0.35s ${spring}, border-radius 0.35s ${spring}, box-shadow 200ms var(--ease-standard)`,
        }}
      >
        {/* Search icon — always on left */}
        <Button variant="ghost" size="icon"
          type="button"
          onClick={() => !expanded && setExpanded(true)}

          aria-label="Open search"
        >
          <Icon name="search" size={20} />
        </Button>

        {/* Input + close */}
        <div
          style={{
            opacity: expanded ? 1 : 0,
            transition: expanded
              ? 'opacity var(--duration-normal) ease 0.12s'
              : 'opacity var(--motion-quick-duration) ease',
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
            className="flex-1 min-w-0 bg-transparent highway-type-body text-[var(--inv-heading)] placeholder-[var(--inv-muted)] outline-none"
            tabIndex={expanded ? 0 : -1}
          />

          {/* Close button — right side */}
          <Button variant="ghost" size="icon-sm"
            type="button"
            onClick={() => setExpanded(false)}

            aria-label="Close search"
            tabIndex={expanded ? 0 : -1}
          >
            <Icon name="close" size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
