"use client";
import { motionTransitions } from '../lib/motion.js'
import { useReducedMotion } from '../lib/use-reduced-motion.js'
import { useRef, useEffect, useState } from 'react'

/** @param {import('../types').TabsProps} props */
export function Tabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
}) {
  const reducedMotion = useReducedMotion()
  const [keyboardSelection, setKeyboardSelection] = useState(false)
  const containerRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () => {
      const activeEl = Array.from(container.children).find(el => el.dataset.tabId === String(activeTab))
      const bounds = activeEl?.getBoundingClientRect()
      const containerBounds = container.getBoundingClientRect()
      setIndicator(bounds ? { left: bounds.left - containerBounds.left, width: bounds.width } : { left: 0, width: 0 })
      setReady(true)
    }
    measure()
    let frame
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    // Measure after the resize delivery so rem-based gaps and padding have settled.
    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(container, { box: 'border-box' })
    Array.from(container.children).forEach(el => observer.observe(el, { box: 'border-box' }))
    document.fonts?.addEventListener('loadingdone', scheduleMeasure)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      document.fonts?.removeEventListener('loadingdone', scheduleMeasure)
    }
  }, [activeTab, tabs, className])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        role="group" aria-label="Views"
        className="flex items-center gap-1 relative"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              aria-pressed={isActive}
              type="button"
              onClick={event => { setKeyboardSelection(event.detail === 0); onTabChange?.(tab.id) }}
              className={`relative z-10 px-4 py-2 highway-type-body highway-weight-medium cursor-pointer transition-colors duration-[var(--duration-normal)] ${
                isActive
                  ? 'text-[var(--inv-heading)]'
                  : 'text-[var(--inv-muted)] hover:text-[var(--inv-heading)]'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="ml-2 highway-type-caption highway-weight-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--inv-heading) 10%, transparent)'
                      : 'color-mix(in srgb, var(--inv-muted) 15%, transparent)',
                    transition: reducedMotion ? 'none' : motionTransitions.color,
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
            transition: ready && !reducedMotion && !keyboardSelection
              ? motionTransitions.selection
              : 'none',
          }}
        />
      </div>
    </div>
  )
}
