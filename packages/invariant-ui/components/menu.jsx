"use client";
import Icon from '../lib/icon.jsx'
import { menuShadow } from '../lib/popover.js'

export function Menu({ children, className = '' }) {
  return (
    <div
      className={`rounded-[20px] bg-[var(--inv-menu-bg)] py-2 px-2 min-w-[180px] ${className}`}
      role="menu"
      style={menuShadow}
    >
      {children}
    </div>
  )
}

export function MenuItem({
  label,
  icon,
  danger = false,
  description,
  selected = false,
  onClick,
  className = '',
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-2 py-1.5 text-[15px] rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
        danger
          ? 'text-red-400 hover:bg-[var(--inv-menu-hover-bg)]'
          : 'text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)]'
      } ${className}`}
    >
      {icon && (
        <Icon
          name={icon}
          size={18}
          className={danger ? 'text-red-400' : 'text-[var(--inv-menu-text)]'}
        />
      )}
      <span className="flex-1 flex flex-col">
        {label}
        {description && (
          <span className="text-[12px] text-[var(--inv-menu-text)]">{description}</span>
        )}
      </span>
      {selected && (
        <Icon name="check" size={16} className="text-[var(--inv-accent)]" />
      )}
    </button>
  )
}

export function MenuDivider() {
  return <div className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" />
}
