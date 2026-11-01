"use client";
import { useState, useRef, useEffect, useId } from 'react'
import { motionTransitions } from '../../lib/motion.js'
import { useReducedMotion } from '../lib/use-reduced-motion.js'
import Icon from '../lib/icon.jsx'

function AccordionItem({ title, children, isOpen, onToggle }) {
  const contentRef = useRef(null)
  const id = useId()
  const reduced = useReducedMotion()
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const measure = () => setHeight(content.scrollHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        id={`${id}-trigger`} aria-expanded={isOpen} aria-controls={`${id}-panel`}
        className="hw-accordion-trigger w-full flex items-center justify-between py-3 highway-type-body highway-weight-medium text-[var(--inv-heading)] cursor-pointer group"
      >
        {title}
        <span
          className="text-[var(--inv-muted)] group-hover:text-[var(--inv-heading)] transition-[color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <Icon name="chevron-right" size={16} style={{ transform: 'rotate(90deg)' }} />
        </span>
      </button>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} inert={!isOpen} aria-hidden={!isOpen}
        style={{
          height: isOpen ? height : 0,
          transition: reduced ? 'none' : motionTransitions.expansionSize,
          overflow: 'hidden',
        }}
      >
        <div
          ref={contentRef}
          className="pb-4"
          style={{
            opacity: isOpen ? 1 : 0,
            filter: isOpen ? 'blur(0px)' : 'blur(4px)',
            transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
            transition: reduced ? 'none' : isOpen ? motionTransitions.expansionEnter : motionTransitions.expansionExit,
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

/** @param {import('../types').AccordionProps} props */
export function Accordion({ items = [], multiple = false, className = '' }) {
  const [openItems, setOpenItems] = useState(new Set())

  const toggle = (index) => {
    setOpenItems(prev => {
      const next = new Set(multiple ? prev : [])
      if (prev.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className={className}>
      {items.map((item, i) => (
        <div key={i}>
          {i > 0 && <div className="h-px bg-[var(--inv-border)]" />}
          <AccordionItem
            title={item.title}
            isOpen={openItems.has(i)}
            onToggle={() => toggle(i)}
          >
            {item.content}
          </AccordionItem>
        </div>
      ))}
    </div>
  )
}
