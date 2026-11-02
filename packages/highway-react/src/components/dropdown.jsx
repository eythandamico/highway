"use client";
import { useState } from 'react'
import Icon from '../lib/icon.jsx'
import { Button } from './ui/button'
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

/** @param {import('../types').DropdownProps} props */
export function Dropdown({ trigger, items = [], placement = 'bottom-left', className = '' }) {
  const [open, setOpen] = useState(false)

  const { rootRef, triggerRef, menuRef, id, close, onKeyDown, onTriggerKeyDown } = useMenu(open, setOpen)

  const posClass = POSITION_CLASSES[placement] || POSITION_CLASSES['bottom-left']

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`} onMouseDown={e => e.stopPropagation()}>
      {/* Trigger */}
      <div ref={triggerRef} onKeyDown={onTriggerKeyDown} onClick={() => setOpen(prev => !prev)}>
        {trigger || (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="More options"
            aria-expanded={open}
            aria-haspopup="true"
          >
            <Icon name="more-vertical" size={20} />
          </Button>
        )}
      </div>

      {/* Menu */}
      <div
        className={`absolute z-10 ${posClass}`}
        style={slideStyle(open, placement)}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="hw-menu min-w-[180px]" role="menu" ref={menuRef} id={id} inert={!open} aria-hidden={!open} onKeyDown={onKeyDown} style={menuShadow}>
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} role="separator" className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" />
            }
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => { close(); item.onAction?.() }}
                className={`w-full text-left px-2 py-1.5 highway-type-body rounded-[max(0px,calc(var(--radius-panel)-var(--space-2)))] transition-[color,background-color,scale] duration-[var(--invariant-detail-duration)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
                  item.danger
                    ? 'text-[var(--status-error)] hover:bg-[var(--inv-menu-hover-bg)]'
                    : 'text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)]'
                }`}
              >
                {item.icon && <Icon name={item.icon} size={18} className={item.danger ? 'text-[var(--status-error)]' : 'text-[var(--inv-menu-text)]'} />}
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
