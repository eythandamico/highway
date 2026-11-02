"use client";
import { useState } from 'react'
import Icon from '../lib/icon.jsx'
import { popoverStyle, menuShadow } from '../lib/popover.js'
import { useMenu } from '../lib/use-menu.js'

/** @param {import('../types').WorkspaceSwitcherProps} props */
export function WorkspaceSwitcher({ currentStartup, startups = [], onStartupChange }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const { rootRef, triggerRef, menuRef, id, close, onKeyDown, onTriggerKeyDown } = useMenu(menuOpen, setMenuOpen)

  if (!currentStartup) return null

  return (
    <div ref={rootRef} className="relative" onMouseDown={e => e.stopPropagation()}>
      <button
        ref={triggerRef} onKeyDown={onTriggerKeyDown}
        type="button"
        onClick={() => setMenuOpen(prev => !prev)}
        className="flex items-center gap-2.5 cursor-pointer transition-[scale,opacity] duration-[var(--invariant-detail-duration)] ease-out active:scale-[0.96] hover:opacity-80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 rounded-xl whitespace-nowrap"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label={`Switch startup, currently ${currentStartup.name}`}
      >
        {currentStartup.avatarUrl ? (
          <img src={currentStartup.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" style={{ boxShadow: 'var(--inv-shadow), inset 0 0 0 1px var(--inv-outline)' }} />
        ) : (
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center highway-type-caption highway-weight-semibold text-white flex-shrink-0"
            style={{ background: currentStartup.color, boxShadow: 'var(--inv-shadow), inset 0 0 0 1px var(--inv-outline)' }}
            aria-hidden="true"
          >
            {currentStartup.initials}
          </span>
        )}
        <span className="highway-type-body highway-weight-semibold text-[var(--inv-heading)]">{currentStartup.name}</span>
        <Icon name="chevrons-vertical" size={12} className="text-[var(--inv-muted)]" aria-hidden="true" />
      </button>

      <div
        className="absolute top-full left-0 mt-2"
        style={popoverStyle(menuOpen, 'top left')}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="hw-menu w-60" role="menu" ref={menuRef} id={id} inert={!menuOpen} aria-hidden={!menuOpen} onKeyDown={onKeyDown} style={menuShadow}>
          {startups.map((s) => (
            <button
              key={s.slug}
              data-selected={s.slug === currentStartup.slug || undefined}
              type="button"
              role="menuitem"
              onClick={() => { close(); onStartupChange?.(s.slug) }}
              className={`w-full text-left px-2 py-1.5 highway-type-body rounded-xl transition-[color,background-color,scale] duration-[var(--invariant-detail-duration)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
                s.slug === currentStartup.slug
                  ? 'bg-[var(--inv-menu-hover-bg)] text-[var(--inv-menu-text-active)] font-medium'
                  : 'text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)]'
              }`}
            >
              {s.avatarUrl ? (
                <img src={s.avatarUrl} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
              ) : (
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center highway-type-micro text-white flex-shrink-0"
                  style={{ background: s.color }}
                  aria-hidden="true"
                >
                  {s.initials}
                </span>
              )}
              <span className="truncate flex-1">{s.name}</span>
              {s.slug === currentStartup.slug && <Icon name="check" size={16} className="hw-menu-check" aria-hidden="true" />}
            </button>
          ))}
          <div className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" aria-hidden="true" />
          <button
            type="button"
            role="menuitem"
            aria-label="Create startup"
            onClick={() => { close() }}
            className="w-full text-left px-2 py-1.5 highway-type-body text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color,scale] duration-[var(--invariant-detail-duration)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
          >
            <Icon name="plus" size={18} className="text-[var(--inv-menu-text)]" aria-hidden="true" />
            Create startup
          </button>
        </div>
      </div>
    </div>
  )
}
