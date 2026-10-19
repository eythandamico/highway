"use client";
import { useState } from 'react'
import Icon from '../lib/icon.jsx'
import { slideStyle, menuShadow } from '../lib/popover.js'
import { useClickOutside } from '../lib/use-click-outside.js'

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

export function Dropdown({ trigger, items = [], placement = 'bottom-left', className = '' }) {
  const [open, setOpen] = useState(false)

  useClickOutside(open, () => setOpen(false))

  const posClass = POSITION_CLASSES[placement] || POSITION_CLASSES['bottom-left']

  return (
    <div className={`relative inline-flex ${className}`} onMouseDown={e => e.stopPropagation()}>
      {/* Trigger */}
      <div onClick={() => setOpen(prev => !prev)}>
        {trigger || (
          <button
            type="button"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--inv-surface)] text-[var(--inv-muted)] hover:text-[var(--inv-heading)] transition-[color,box-shadow,scale] duration-200 ease-out cursor-pointer active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-2 [box-shadow:var(--inv-shadow-sm)] hover:[box-shadow:var(--inv-shadow-sm-hover)]"
            aria-label="More options"
            aria-expanded={open}
            aria-haspopup="true"
          >
            <Icon name="more-vertical" size={20} />
          </button>
        )}
      </div>

      {/* Menu */}
      <div
        className={`absolute z-10 ${posClass}`}
        style={slideStyle(open, placement)}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="rounded-[20px] bg-[var(--inv-menu-bg)] py-2 px-2 min-w-[180px]" role="menu" style={menuShadow}>
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" />
            }
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); item.onAction?.() }}
                className={`w-full text-left px-2 py-1.5 text-[15px] rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
                  item.danger
                    ? 'text-red-400 hover:bg-[var(--inv-menu-hover-bg)]'
                    : 'text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)]'
                }`}
              >
                {item.icon && <Icon name={item.icon} size={18} className={item.danger ? 'text-red-400' : 'text-[var(--inv-menu-text)]'} />}
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
