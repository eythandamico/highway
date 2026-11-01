"use client";
import { useRef, useEffect, useState } from 'react'
import Icon from '../lib/icon.jsx'
import { useReducedMotion } from '../lib/use-reduced-motion.js'

/** @param {import('../types').SegmentedControlProps} props */
export function SegmentedControl({ tabs = [], activeTab, onTabChange, variant = 'default', className = '', label = 'View options', disabled = false }) {
  const containerRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const [keyboard, setKeyboard] = useState(false)
  const [indicator, setIndicator] = useState(null)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const items = Array.from(container.querySelectorAll('[data-tab-id]'))
    const measure = () => {
      const active = items.find(el => el.dataset.tabId === activeTab)
      const next = active ? { left:active.offsetLeft, top:active.offsetTop, width:active.offsetWidth, height:active.offsetHeight } : null
      setIndicator(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    items.forEach(item => observer.observe(item))
    return () => observer.disconnect()
  }, [activeTab, tabs])
  return (
    <div ref={containerRef} role="group" aria-label={label} className={`hw-segmented ${className}`} data-variant={variant}
      onKeyDownCapture={() => setKeyboard(true)} onPointerDownCapture={() => setKeyboard(false)}>
      {indicator && <div aria-hidden="true" className="hw-segmented-indicator" style={{
        transform:`translate(${indicator.left}px, ${indicator.top}px)`, width:indicator.width, height:indicator.height,
        transition:keyboard || reducedMotion ? 'none' : 'transform var(--control-travel-duration) var(--ease-emphasized), width var(--control-travel-duration) var(--ease-emphasized), height var(--control-travel-duration) var(--ease-emphasized)',
      }}/>}
      {tabs.map(tab => <button key={tab.id} data-tab-id={tab.id} data-icon-only={!!tab.icon && !tab.label || undefined} aria-pressed={activeTab === tab.id} type="button"
        disabled={disabled || tab.disabled} onClick={() => onTabChange?.(tab.id)} className="hw-segmented-option" aria-label={tab.label || tab.id}>
        {tab.icon && <Icon name={tab.icon} size={16}/>}{tab.label}
      </button>)}
    </div>
  )
}
