"use client";
import { useState, useMemo, useId } from 'react'
import { popoverStyle } from '../lib/popover.js'

function hashName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

const BASE_PALETTES = [
  ['#2467c7', '#afb6fe', '#e05cc3', '#f72f1b'],
  ['#06b6d4', '#8b5cf6', '#ec4899', '#f97316'],
  ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
  ['#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
  ['#f43f5e', '#a855f7', '#3b82f6', '#14b8a6'],
  ['#d946ef', '#6366f1', '#0ea5e9', '#f97316'],
]

function generateGradient(name) {
  const hash = hashName(name)
  const rand = seededRandom(hash)

  const palette = BASE_PALETTES[hash % BASE_PALETTES.length]

  const blobs = palette.map((color) => ({
    color,
    x: rand() * 80 + 10,
    y: rand() * 80 + 10,
    w: rand() * 40 + 40,
    h: rand() * 40 + 40,
  }))

  return blobs
}

export function AgentAvatar({ name, avatarUrl, size = 40, state = 'default', onClick }) {
  const [hovered, setHovered] = useState(false)
  const blobs = useMemo(() => generateGradient(name), [name])
  const uid = useId()

  const svgSize = 100
  const blurAmount = 25
  const isThinking = state === 'thinking'
  const isInactive = state === 'inactive'

  return (
    <div className="relative inline-flex" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        type="button"
        onClick={onClick}
        className="relative rounded-full cursor-pointer transition-[scale] duration-[var(--duration-normal)] ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-2 overflow-hidden"
        aria-label={name}
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full rounded-full object-cover"
            style={{ opacity: isInactive ? 0.4 : 1, transition: 'opacity 0.3s ease' }}
          />
        ) : (
          <svg
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="w-full h-full"
            aria-hidden="true"
            style={{ opacity: isInactive ? 0.35 : 1, transition: 'opacity 0.3s ease' }}
          >
            <defs>
              <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={blurAmount} />
              </filter>
              <filter id={`noise-${uid}`} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" result="turbulence" stitchTiles="stitch" />
                <feBlend in="SourceGraphic" in2="turbulence" mode="overlay" />
              </filter>
              <clipPath id={`circle-${uid}`}>
                <circle cx={svgSize / 2} cy={svgSize / 2} r={svgSize / 2} />
              </clipPath>
            </defs>
            <g clipPath={`url(#circle-${uid})`}>
              <rect width={svgSize} height={svgSize} fill="#151721" />
              <g filter={`url(#blur-${uid})`}>
                {blobs.map((blob, i) => (
                  <rect
                    key={i}
                    x={blob.x}
                    y={blob.y}
                    width={blob.w}
                    height={blob.h}
                    fill={blob.color}
                  >
                    {isThinking && (
                      <>
                        <animate
                          attributeName="x"
                          values={`${blob.x};${blob.x + 35};${blob.x - 25};${blob.x + 15};${blob.x}`}
                          dur={`${5 + i * 1.2}s`}
                          calcMode="spline"
                          keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="y"
                          values={`${blob.y};${blob.y - 30};${blob.y + 20};${blob.y - 10};${blob.y}`}
                          dur={`${6 + i * 1.1}s`}
                          calcMode="spline"
                          keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="width"
                          values={`${blob.w};${blob.w * 1.5};${blob.w * 0.6};${blob.w * 1.3};${blob.w}`}
                          dur={`${7 + i * 0.9}s`}
                          calcMode="spline"
                          keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="height"
                          values={`${blob.h};${blob.h * 0.6};${blob.h * 1.5};${blob.h * 0.8};${blob.h}`}
                          dur={`${6.5 + i * 1.3}s`}
                          calcMode="spline"
                          keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
                          repeatCount="indefinite"
                        />
                      </>
                    )}
                  </rect>
                ))}
              </g>
              <rect
                width={svgSize}
                height={svgSize}
                style={{ mixBlendMode: 'luminosity', filter: `url(#noise-${uid})`, opacity: 0.15 }}
              />
            </g>
          </svg>
        )}
        <span className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px var(--inv-outline)' }} />
      </button>

      {name && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 rounded-xl bg-[var(--inv-nav)] text-[var(--inv-nav-text-active)] text-[length:var(--type-body)] font-medium whitespace-nowrap pointer-events-none"
          style={{
            ...popoverStyle(hovered, 'bottom center'),
            boxShadow: 'var(--inv-shadow)',
          }}
        >
          {name}
        </div>
      )}
    </div>
  )
}
