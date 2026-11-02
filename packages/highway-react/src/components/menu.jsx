"use client";
import { menuItems, navigateMenu } from '../lib/menu-navigation.js'
import { useRef, useEffect } from 'react'
import Icon from '../lib/icon.jsx'
import { menuShadow } from '../lib/popover.js'

export function Menu({ children, className = '', label = 'Actions' }) {
  const menuRef = useRef(null)
  useEffect(() => {
    const menu = menuRef.current
    const items = menuItems(menu)
    const active = items.includes(menu.ownerDocument.activeElement) ? menu.ownerDocument.activeElement : items[0]
    items.forEach(item => { item.tabIndex = item === active ? 0 : -1 })
  }, [children])
  const focusItem = event => {
    const menu = menuRef.current
    const item = event.target.closest('[role^=menuitem]')
    if (!item || item.closest('[role=menu]') !== menu) return
    menu.querySelectorAll('[role^=menuitem]').forEach(candidate => { if (candidate.closest('[role=menu]') === menu) candidate.tabIndex = candidate === item ? 0 : -1 })
  }
  const navigate = event => {
    const menu = menuRef.current
    const items = menuItems(menu)
    if (!items.length) return
    const current = items.indexOf(menu.ownerDocument.activeElement)
    navigateMenu(event, items, current)
  }
  return (
    <div
      className={`hw-menu min-w-[180px] ${className}`}
      role="menu" aria-label={label} ref={menuRef} onKeyDown={navigate} onFocusCapture={focusItem}
      style={menuShadow}
    >
      {children}
    </div>
  )
}

/** @param {import('../types').MenuItemProps} props */
export function MenuItem({
  label,
  icon,
  danger = false,
  description,
  selected = false,
  disabled = false,
  onClick,
  className = '',
}) {
  return (
    <button
      type="button"
      role="menuitem"
      data-selected={selected || undefined}
      disabled={disabled}
      onClick={onClick}
      className={`w-full text-left px-2 py-1.5 highway-type-body rounded-xl transition-[color,background-color,scale] duration-[var(--invariant-detail-duration)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
        danger
          ? 'text-[var(--status-error)] hover:bg-[var(--inv-menu-hover-bg)]'
          : 'text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)]'
      } ${className}`}
    >
      {icon && (
        <Icon
          name={icon}
          size={18}
          className={danger ? 'text-[var(--status-error)]' : 'text-[var(--inv-menu-text)]'}
        />
      )}
      <span className="flex-1 flex flex-col">
        {label}
        {description && (
          <span className="highway-type-caption text-[var(--inv-menu-text)]">{description}</span>
        )}
      </span>
      {selected && (
        <Icon name="check" size={16} className="hw-menu-check shrink-0" />
      )}
    </button>
  )
}

export function MenuDivider() {
  return <div role="separator" className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" />
}
