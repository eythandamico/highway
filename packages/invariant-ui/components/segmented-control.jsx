"use client";
import { useRef, useEffect, useState } from 'react'
import Icon from '../lib/icon.jsx'

export function SegmentedControl({ tabs = [], activeTab, onTabChange, variant = 'default', className = '' }) {
  const containerRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () => {
      const activeEl = Array.from(container.querySelectorAll('[data-tab-id]')).find(el => el.dataset.tabId === activeTab)
      if (!activeEl) return
      setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth })
      setReady(true)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [activeTab])

  const isSubdued = variant === 'subdued'

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-1 rounded-xl p-1 ${
        isSubdued ? 'bg-[var(--inv-bg-alt)]' : 'bg-[var(--inv-surface)]'
      } ${className}`}
      style={isSubdued ? {} : { boxShadow: 'var(--inv-shadow-sm)' }}
    >
      <div
        className={`absolute top-1 bottom-1 rounded-lg ${
          isSubdued ? 'bg-[var(--inv-surface)]' : 'bg-[var(--inv-nav-hover-bg)]'
        }`}
        style={{
          left: indicator.left,
          width: indicator.width,
          transition: ready ? 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          boxShadow: isSubdued ? 'var(--inv-shadow-sm)' : undefined,
        }}
      />
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        const hasIcon = !!tab.icon
        const iconOnly = hasIcon && !tab.label
        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            aria-pressed={isActive}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={`relative z-10 flex items-center justify-center gap-1.5 text-[length:var(--type-secondary)] font-medium rounded-lg transition-colors duration-[var(--duration-fast)] cursor-pointer ${
              iconOnly ? 'w-9 h-9' : 'px-3 py-1.5'
            } ${
              isActive
                ? 'text-[var(--inv-heading)]'
                : 'text-[var(--inv-muted)] hover:text-[var(--inv-heading)]'
            }`}
            aria-label={tab.label || tab.id}
          >
            {tab.icon && <Icon name={tab.icon} size={16} />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
