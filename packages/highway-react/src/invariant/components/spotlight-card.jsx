"use client";
import { useState, useRef, useCallback } from 'react'

export function SpotlightCard({ children, className = '', spotlightSize = 300, spotlightOpacity = 0.08 }) {
  const cardRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl bg-[var(--inv-surface)] ${className}`}
      style={{ boxShadow: 'var(--inv-shadow-sm)' }}
    >
      {/* Spotlight glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, var(--inv-accent), transparent)`,
          opacity: isHovered ? spotlightOpacity : 0,
          transition: 'opacity var(--motion-soft-duration) ease',
        }}
      />

      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px var(--inv-outline)`,
          background: isHovered
            ? `radial-gradient(${spotlightSize * 0.8}px circle at ${position.x}px ${position.y}px, var(--inv-accent), transparent)`
            : 'none',
          opacity: isHovered ? 0.15 : 0,
          transition: 'opacity var(--motion-soft-duration) ease',
          maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
          borderRadius: 'inherit',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
