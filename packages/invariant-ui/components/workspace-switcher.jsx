"use client";
import { useState } from 'react'
import Icon from '../lib/icon.jsx'
import { popoverStyle, menuShadow } from '../lib/popover.js'
import { useClickOutside } from '../lib/use-click-outside.js'

export function WorkspaceSwitcher({ currentStartup, startups = [], onStartupChange }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useClickOutside(menuOpen, () => setMenuOpen(false))

  if (!currentStartup) return null

  return (
    <div className="relative" onMouseDown={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setMenuOpen(prev => !prev)}
        className="flex items-center gap-2.5 cursor-pointer transition-[scale,opacity] duration-[var(--duration-fast)] ease-out active:scale-[0.96] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 rounded-xl whitespace-nowrap"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label={`Switch startup, currently ${currentStartup.name}`}
      >
        {currentStartup.avatarUrl ? (
          <img src={currentStartup.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" style={{ boxShadow: 'var(--inv-shadow), inset 0 0 0 1px var(--inv-outline)' }} />
        ) : (
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[length:var(--type-caption)] font-bold text-white flex-shrink-0"
            style={{ background: currentStartup.color, boxShadow: 'var(--inv-shadow), inset 0 0 0 1px var(--inv-outline)' }}
            aria-hidden="true"
          >
            {currentStartup.initials}
          </span>
        )}
        <span className="text-[length:var(--type-body)] font-semibold text-[var(--inv-heading)]">{currentStartup.name}</span>
        <Icon name="chevrons-vertical" size={12} className="text-[var(--inv-muted)]" aria-hidden="true" />
      </button>

      <div
        className="absolute top-full left-0 mt-2"
        style={popoverStyle(menuOpen, 'top left')}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="rounded-[20px] bg-[var(--inv-menu-bg)]/90 backdrop-blur-xl py-2 px-2 w-60" role="menu" style={menuShadow}>
          {startups.map((s) => (
            <button
              key={s.slug}
              type="button"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onStartupChange?.(s.slug) }}
              className={`w-full text-left px-2 py-1.5 text-[length:var(--type-body)] rounded-xl transition-[color,background-color,scale] duration-[var(--duration-fast)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
                s.slug === currentStartup.slug
                  ? 'bg-[var(--inv-menu-hover-bg)] text-[var(--inv-menu-text-active)] font-medium'
                  : 'text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)]'
              }`}
            >
              {s.avatarUrl ? (
                <img src={s.avatarUrl} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
              ) : (
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: s.color }}
                  aria-hidden="true"
                >
                  {s.initials}
                </span>
              )}
              <span className="truncate">{s.name}</span>
            </button>
          ))}
          <div className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" aria-hidden="true" />
          <button
            type="button"
            role="menuitem"
            aria-label="Create startup"
            onClick={() => { setMenuOpen(false) }}
            className="w-full text-left px-2 py-1.5 text-[length:var(--type-body)] text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color,scale] duration-[var(--duration-fast)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
          >
            <Icon name="plus" size={18} className="text-[var(--inv-menu-text)]" aria-hidden="true" />
            Create startup
          </button>
        </div>
      </div>
    </div>
  )
}
