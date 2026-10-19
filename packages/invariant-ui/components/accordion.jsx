"use client";
import { useState, useRef, useEffect } from 'react'
import Icon from '../lib/icon.jsx'

function AccordionItem({ title, children, isOpen, onToggle }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [children, isOpen])

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-[length:var(--type-body)] font-medium text-[var(--inv-heading)] cursor-pointer group"
      >
        {title}
        <span
          className="text-[var(--inv-muted)] group-hover:text-[var(--inv-heading)] transition-[color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <Icon name="chevron-right" size={16} style={{ transform: 'rotate(90deg)' }} />
        </span>
      </button>
      <div
        style={{
          height: isOpen ? height : 0,
          transition: 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
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
            transition: isOpen
              ? 'opacity 0.25s ease 0.1s, filter 0.25s ease 0.1s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
              : 'opacity 0.15s ease, filter 0.15s ease, transform 0.15s ease',
          }}
        >
          <div className="text-[length:var(--type-body)] text-[var(--inv-body)] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

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
