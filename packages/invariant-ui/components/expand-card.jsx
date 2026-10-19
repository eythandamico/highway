"use client";
import { useState, useRef, useEffect } from 'react'
import Icon from '../lib/icon.jsx'

export function ExpandCard({ title, children, icon, defaultExpanded = false, className = '' }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [children, expanded])

  return (
    <div
      className={`rounded-2xl bg-[var(--inv-surface)] overflow-hidden cursor-pointer transition-[box-shadow] duration-200 ${className}`}
      style={{ boxShadow: expanded ? 'var(--inv-shadow)' : 'var(--inv-shadow-sm)' }}
      onClick={() => setExpanded(prev => !prev)}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {icon && (
          <Icon name={icon} size={18} className="text-[var(--inv-muted)] flex-shrink-0" />
        )}
        <span className="flex-1 text-[15px] font-medium text-[var(--inv-heading)]">{title}</span>
        <span
          className="text-[var(--inv-muted)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <Icon name="chevron-right" size={16} style={{ transform: 'rotate(90deg)' }} />
        </span>
      </div>

      <div
        style={{
          height: expanded ? contentHeight : 0,
          transition: 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
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
            transition: expanded
              ? 'opacity 0.25s ease 0.1s, filter 0.25s ease 0.1s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
              : 'opacity 0.15s ease, filter 0.15s ease, transform 0.15s ease',
          }}
        >
          <div className="text-[15px] text-[var(--inv-body)] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
