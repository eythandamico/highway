"use client";
import { useRef, useEffect, useState } from 'react'

export function Tabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
}) {
  const containerRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const activeEl = container.querySelector(`[data-tab-id="${activeTab}"]`)
    if (!activeEl) return
    setIndicator({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
    })
    setReady(true)
  }, [activeTab])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="flex items-center gap-1 relative"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`relative z-10 px-4 py-2 text-[14px] font-medium cursor-pointer transition-colors duration-200 ${
                isActive
                  ? 'text-[var(--inv-heading)]'
                  : 'text-[var(--inv-muted)] hover:text-[var(--inv-heading)]'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--inv-heading) 10%, transparent)'
                      : 'color-mix(in srgb, var(--inv-muted) 15%, transparent)',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Sliding underline */}
      <div className="relative h-[2px] bg-[var(--inv-border)] mt-1 rounded-full overflow-hidden">
        <div
          className="absolute top-0 h-full bg-[var(--inv-heading)] rounded-full"
          style={{
            left: indicator.left,
            width: indicator.width,
            transition: ready
              ? 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'none',
          }}
        />
      </div>
    </div>
  )
}
