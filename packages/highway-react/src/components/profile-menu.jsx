"use client";
import { useState } from 'react'
import Icon from '../lib/icon.jsx'
import { slideStyle, menuShadow } from '../lib/popover.js'
import { useMenu } from '../lib/use-menu.js'

const POSITION_CLASSES = {
  'bottom-left':   'top-full left-0 mt-2',
  'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-2',
  'bottom-right':  'top-full right-0 mt-2',
  'top-left':      'bottom-full left-0 mb-2',
  'top-center':    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  'top-right':     'bottom-full right-0 mb-2',
  'left-top':      'right-full top-0 mr-2',
  'left-center':   'right-full top-1/2 -translate-y-1/2 mr-2',
  'left-bottom':   'right-full bottom-0 mr-2',
  'right-top':     'left-full top-0 ml-2',
  'right-center':  'left-full top-1/2 -translate-y-1/2 ml-2',
  'right-bottom':  'left-full bottom-0 ml-2',
}

/** @param {import('../types').ProfileMenuProps} props */
export function ProfileMenu({ avatarUrl, profile, profileItems = [], placement = 'bottom-right' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const { rootRef, triggerRef, menuRef, id, close, onKeyDown, onTriggerKeyDown } = useMenu(menuOpen, setMenuOpen)

  if (!avatarUrl) return null

  const posClass = POSITION_CLASSES[placement] || POSITION_CLASSES['bottom-right']

  return (
    <div ref={rootRef} className="relative w-10 h-10 flex-shrink-0" onMouseDown={e => e.stopPropagation()}>
      <button
        ref={triggerRef} onKeyDown={onTriggerKeyDown}
        type="button"
        onClick={() => setMenuOpen(prev => !prev)}
        className="relative w-10 h-10 rounded-xl cursor-pointer transition-[scale,opacity] duration-[var(--invariant-detail-duration)] ease-out active:scale-[0.96] hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
        aria-label="Profile menu"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        style={{ boxShadow: 'var(--inv-shadow)' }}
      >
        <img src={avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
        <span className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px var(--inv-outline)' }} />
      </button>

      <div
        className={`absolute z-10 ${posClass}`}
        style={slideStyle(menuOpen, placement)}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="hw-menu w-56" role="menu" ref={menuRef} id={id} inert={!menuOpen} aria-hidden={!menuOpen} onKeyDown={onKeyDown} style={menuShadow}>
          {profile && (
            <>
              <div className="px-2 py-1.5">
                <div className="highway-type-body highway-weight-semibold text-[var(--inv-menu-text-active)] truncate">{profile.name}</div>
                <div className="highway-type-body-sm text-[var(--inv-menu-text)] truncate">{profile.email}</div>
              </div>
              <div className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" aria-hidden="true" />
            </>
          )}
          {profileItems.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem" disabled={item.disabled}
              onClick={() => { close(); item.onAction?.() }}
              className="w-full text-left px-2 py-1.5 highway-type-body text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color,scale] duration-[var(--invariant-detail-duration)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
            >
              <Icon name={item.icon} size={18} className="text-[var(--inv-menu-text)]" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
