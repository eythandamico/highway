"use client";
import { useId, useState } from 'react'
import Icon from '../lib/icon.jsx'
import { slideStyle, menuShadow } from '../lib/popover.js'
import { useClickOutside } from '../lib/use-click-outside.js'

export function Select({ label, options = [], value, onChange, placeholder = 'Select...', className = '' }) {
  const labelId = useId()
  const [open, setOpen] = useState(false)

  useClickOutside(open, () => setOpen(false))

  const selected = options.find(o => o.id === value)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label id={labelId} className="text-[13px] font-medium text-[var(--inv-heading)]">{label}</label>
      )}

      <div className="relative" onMouseDown={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--inv-surface)] text-[15px] cursor-pointer transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-2"
          style={{ boxShadow: open ? 'var(--inv-shadow-sm-hover)' : 'var(--inv-shadow-sm)' }}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : placeholder}
        >
          <span className={selected ? 'text-[var(--inv-heading)]' : 'text-[var(--inv-muted)]'}>
            {selected?.label || placeholder}
          </span>
          <span
            className="text-[var(--inv-muted)] transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <Icon name="chevron-right" size={16} style={{ transform: 'rotate(90deg)' }} />
          </span>
        </button>

        <div
          className="absolute top-full left-0 right-0 mt-2 z-10"
          style={slideStyle(open)}
          inert={!open}
          aria-hidden={!open}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="rounded-[20px] bg-[var(--inv-menu-bg)] py-2 px-2" role="listbox" style={menuShadow}>
            {options.map(option => {
              const isSelected = option.id === value
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { setOpen(false); onChange?.(option.id) }}
                  className={`w-full text-left px-2 py-1.5 text-[15px] rounded-xl transition-[color,background-color] duration-150 ease-out cursor-pointer flex items-center justify-between active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
                    isSelected
                      ? 'text-[var(--inv-menu-text-active)] font-medium bg-[var(--inv-menu-hover-bg)]'
                      : 'text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)]'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Icon name="check" size={16} className="text-[var(--inv-accent)]" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
