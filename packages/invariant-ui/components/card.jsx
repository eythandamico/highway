"use client";
import { useMemo, useId, useState, useRef } from 'react'
import Icon from '../lib/icon.jsx'

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

const PALETTES = [
  ['#2467c7', '#afb6fe', '#e05cc3', '#f72f1b'],
  ['#06b6d4', '#8b5cf6', '#ec4899', '#f97316'],
  ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
  ['#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
  ['#f43f5e', '#a855f7', '#3b82f6', '#14b8a6'],
  ['#d946ef', '#6366f1', '#0ea5e9', '#f97316'],
]

function generateBlobs(seed) {
  const hash = hashName(seed)
  const rand = seededRandom(hash)
  const palette = PALETTES[hash % PALETTES.length]
  return palette.map((color) => ({
    color,
    x: rand() * 80 + 10,
    y: rand() * 80 + 10,
    w: rand() * 40 + 40,
    h: rand() * 40 + 40,
  }))
}

export function Card({
  image,
  title,
  description,
  children,
  variant = 'default',
  gradientSeed,
  className = '',
}) {
  const uid = useId()
  const blobs = useMemo(() => generateBlobs(gradientSeed || title || 'card'), [gradientSeed, title])
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)

  if (variant === 'gradient') {
    return (
      <div
        className={`rounded-3xl overflow-hidden relative ${className}`}
        style={{ boxShadow: 'var(--inv-shadow-sm)' }}
      >
        {/* Gradient background — matches AgentAvatar style */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="25" />
            </filter>
            <filter id={`noise-${uid}`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="4" result="turbulence" stitchTiles="stitch" />
              <feBlend in="SourceGraphic" in2="turbulence" mode="overlay" />
            </filter>
          </defs>
          <rect width="100" height="100" fill="#151721" />
          <g filter={`url(#blur-${uid})`}>
            {blobs.map((blob, i) => (
              <rect
                key={i}
                x={blob.x}
                y={blob.y}
                width={blob.w}
                height={blob.h}
                fill={blob.color}
              />
            ))}
          </g>
          <rect
            width="100"
            height="100"
            style={{ mixBlendMode: 'luminosity', filter: `url(#noise-${uid})`, opacity: 0.15 }}
          />
        </svg>


        {/* Content */}
        <div className="relative p-6 flex flex-col justify-end min-h-[420px]">
          {title && (
            <h3 className="text-[22px] font-normal text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[var(--inv-text-sm)] text-white/70 mt-1">
              {description}
            </p>
          )}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'video') {
    return (
      <div
        className={`rounded-3xl overflow-hidden relative ${className}`}
        style={{ boxShadow: 'var(--inv-shadow-sm)' }}
      >
        <video
          ref={videoRef}
          src={image}
          autoPlay
          loop
          muted={muted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Mute/unmute button */}
        <button
          type="button"
          onClick={() => setMuted(m => !m)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--inv-heading)]/[0.32] backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-[color,scale] duration-[var(--duration-fast)] active:scale-[0.96] z-10"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          <Icon name={muted ? 'volume-off' : 'volume'} size={16} />
        </button>

        <div className="relative p-6 flex flex-col justify-end min-h-[420px]">
          {title && (
            <h3 className="text-[22px] font-normal text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[var(--inv-text-sm)] text-white/70 mt-1">
              {description}
            </p>
          )}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'subdued') {
    return (
      <div
        className={`rounded-3xl bg-[var(--inv-bg-alt)] overflow-hidden ${className}`}
      >
        <div className="p-6 flex flex-col justify-end min-h-[420px]">
          {title && (
            <h3 className="text-[22px] font-normal text-[var(--inv-heading)]">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[var(--inv-text-sm)] text-[var(--inv-muted)] mt-1">
              {description}
            </p>
          )}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={`rounded-3xl bg-[var(--inv-surface)] overflow-hidden ${className}`}
      style={{ boxShadow: 'var(--inv-shadow-sm)' }}
    >
      {image && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {title && (
          <h3 className="text-[var(--inv-text-base)] font-semibold text-[var(--inv-heading)]">
            {title}
          </h3>
        )}

        {description && (
          <p className="text-[var(--inv-text-sm)] text-[var(--inv-muted)] mt-1">
            {description}
          </p>
        )}

        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
