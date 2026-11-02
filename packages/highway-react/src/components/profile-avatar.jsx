"use client";
import { useState } from 'react'
import { popoverStyle } from '../lib/popover.js'

/** @param {import('../types').ProfileAvatarProps} props */
export function ProfileAvatar(props) {
  return <AvatarArtwork {...props} />
}

function AvatarArtwork({ name, avatarUrl, size = 40, rounded = 'xl', alert = false, grouped = false, onClick, nextAvatar = false }) {
  const [hovered, setHovered] = useState(false)
  const radiusClass = rounded === 'full' ? 'rounded-full' : 'rounded-xl'

  // Mask only the artwork, leaving the button focus ring and tooltip intact.
  const extent = size + 16
  const nextRadius = rounded === 'full' ? size / 2 + 3 : 15
  const holes = `${alert ? `<circle cx="${size + 5}" cy="11" r="8" fill="black"/>` : ''}${nextAvatar ? `<rect x="${size * .7 + 5}" y="5" width="${size + 6}" height="${size + 6}" rx="${nextRadius}" fill="black"/>` : ''}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${extent}" height="${extent}" viewBox="0 0 ${extent} ${extent}"><defs><mask id="cut"><rect width="100%" height="100%" fill="white"/>${holes}</mask></defs><rect width="100%" height="100%" fill="white" mask="url(#cut)"/></svg>`
  const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  // The dot sits outside its own circular cutout; it still needs the group cutout.
  const groupSvg = svg.replace(alert ? `<circle cx="${size + 5}" cy="11" r="8" fill="black"/>` : '', '')
  const groupMask = `url("data:image/svg+xml,${encodeURIComponent(groupSvg)}")`
  if (!avatarUrl) return null

  return (
    <div className="relative inline-flex" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        type="button"
        onClick={onClick}
        className={`relative ${radiusClass} cursor-pointer transition-[scale] duration-[var(--duration-normal)] ease-out active:scale-[0.96] hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-2`}
        aria-label={name}
        style={{ width: size, height: size }}
      >
        <span className="absolute pointer-events-none" style={{ inset: -8, maskImage: mask, WebkitMaskImage: mask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }}>
          <span className={`absolute ${radiusClass}`} style={{ inset: 8, boxShadow: grouped ? 'none' : 'var(--inv-shadow)' }}>
            <img src={avatarUrl} alt="" className={`w-full h-full ${radiusClass} object-cover`} />
            <span className={`absolute inset-0 ${radiusClass}`} style={{ boxShadow: 'inset 0 0 0 1px var(--inv-outline)' }} />
          </span>
        </span>
        {alert && <span className="absolute pointer-events-none" style={{ inset: -8, maskImage: nextAvatar ? groupMask : undefined, WebkitMaskImage: nextAvatar ? groupMask : undefined, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }}>
          <span className="absolute rounded-full bg-red-500" style={{ width: 12, height: 12, top: 5, left: size - 1 }} />
        </span>}
      </button>

      {name && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 rounded-xl bg-[var(--inv-nav)] text-[var(--inv-nav-text-active)] highway-type-body highway-weight-medium whitespace-nowrap pointer-events-none"
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

/** @param {import('../types').ProfileAvatarGroupProps} props */
export function ProfileAvatarGroup({ avatars = [], size = 40, rounded = 'xl', max = 3 }) {
  const visible = avatars.slice(0, max)
  const overflow = avatars.length - max
  const radiusClass = rounded === 'full' ? 'rounded-full' : 'rounded-xl'
  const offset = size * 0.3

  return (
    <div className="flex" style={{ paddingLeft: offset }}>
      {visible.map((avatar, i) => (
        <div
          key={avatar.name || i}
          style={{ marginLeft: -offset, zIndex: i, width: size, height: size, flexShrink: 0 }}
        >
          <AvatarArtwork
            name={avatar.name}
            avatarUrl={avatar.avatarUrl}
            size={size}
            rounded={rounded}
            alert={avatar.alert}
            grouped
            nextAvatar={i < visible.length - 1 || overflow > 0}
            onClick={avatar.onClick}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`flex items-center justify-center ${radiusClass} bg-[var(--inv-heading)] text-[var(--inv-bg)] font-semibold flex-shrink-0`}
          style={{
            width: size,
            height: size,
            marginLeft: -offset,
            zIndex: visible.length,
            fontSize: size * 0.35,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
