"use client";
import { useState, useRef, useEffect, useId } from 'react'
import { motionTransitions } from '../lib/motion.js'
import { useReducedMotion } from '../lib/use-reduced-motion.js'
import Icon from '../lib/icon.jsx'

/** @param {import('../types').ExpandCardProps} props */
export function ExpandCard({ title, children, icon, defaultExpanded = false, className = '' }) {
  const contentId = useId()
  const reducedMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const measure = () => setContentHeight(content.scrollHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [children, expanded])

  return (
    <div
      className={`rounded-2xl bg-[var(--inv-surface)] overflow-hidden cursor-pointer transition-[box-shadow] duration-[var(--duration-normal)] ${className}`}
      style={{ boxShadow: expanded ? 'var(--inv-shadow)' : 'var(--inv-shadow-sm)' }}
    >
      <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(prev => !prev)} className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ring)]">
        {icon && (
          <Icon name={icon} size={18} className="text-[var(--inv-muted)] flex-shrink-0" />
        )}
        <span className="flex-1 highway-type-body highway-weight-medium text-[var(--inv-heading)]">{title}</span>
        <span
          className="text-[var(--inv-muted)]"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: reducedMotion ? 'none' : motionTransitions.expansionChevron }}
        >
          <Icon name="chevron-right" size={16} style={{ transform: 'rotate(90deg)' }} />
        </span>
      </button>

      <div id={contentId} inert={!expanded}
        style={{
          height: expanded ? contentHeight : 0,
          transition: reducedMotion ? 'none' : motionTransitions.expansionSize,
          overflow: 'hidden',
        }}
      >
        <div
          ref={contentRef}
          className="px-4 pb-4"
          style={{
            opacity: expanded ? 1 : 0,
            filter: expanded ? 'blur(0px)' : 'blur(4px)',
            transform: expanded ? 'translateY(0)' : 'translateY(-8px)',
            transition: reducedMotion ? 'none' : expanded ? motionTransitions.expansionEnter : motionTransitions.expansionExit,
          }}
        >
          <div className="highway-type-body text-[var(--inv-body)] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
