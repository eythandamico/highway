"use client";
import { useReducedMotion } from '../lib/use-reduced-motion.js'

export function Skeleton({
  variant = 'line',
  width,
  height,
  lines = 3,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotion()
  const shimmer = prefersReducedMotion
    ? {}
    : {
        backgroundImage: 'linear-gradient(90deg, transparent 0%, var(--inv-border) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'inv-shimmer var(--shimmer-duration) ease-in-out infinite',
      }

  const base = `rounded-lg bg-[var(--inv-bg-alt)]`

  if (variant === 'circle') {
    const size = width || 40
    return (
      <>
        <div
          className={`rounded-full ${className}`}
          style={{ width: size, height: size, ...shimmer }}
        />
        <SkeletonKeyframes />
      </>
    )
  }

  if (variant === 'card') {
    return (
      <>
        <div
          className={`rounded-2xl bg-[var(--inv-surface)] p-5 ${className}`}
          style={{ boxShadow: 'var(--inv-shadow-sm)', width, height }}
        >
          <div className="flex flex-col gap-3">
            <div className={`${base} h-5 w-2/5`} style={shimmer} />
            <div className={`${base} h-4 w-full`} style={shimmer} />
            <div className={`${base} h-4 w-4/5`} style={shimmer} />
            <div className={`${base} h-4 w-3/5`} style={shimmer} />
          </div>
        </div>
        <SkeletonKeyframes />
      </>
    )
  }

  if (variant === 'avatar-line') {
    return (
      <>
        <div className={`flex items-center gap-3 ${className}`}>
          <div className="rounded-full bg-[var(--inv-bg-alt)] flex-shrink-0" style={{ width: 36, height: 36, ...shimmer }} />
          <div className="flex-1 flex flex-col gap-2">
            <div className={`${base} h-4 w-2/5`} style={shimmer} />
            <div className={`${base} h-3.5 w-3/5`} style={shimmer} />
          </div>
        </div>
        <SkeletonKeyframes />
      </>
    )
  }

  // Default: 'line' — renders a group of text placeholder lines
  return (
    <>
      <div className={`flex flex-col gap-2.5 ${className}`} style={{ width }}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${base} h-4`}
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              ...shimmer,
              animationDelay: prefersReducedMotion ? undefined : `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
      <SkeletonKeyframes />
    </>
  )
}

function SkeletonKeyframes() {
  return (
    <style>{`
      @keyframes inv-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  )
}
