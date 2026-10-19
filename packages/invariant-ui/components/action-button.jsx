"use client";
import { useState, useEffect } from 'react'
import Icon from '../lib/icon.jsx'

export function ActionButton({ label = 'Save', icon, loadingDuration = 2000, onAction, className = '' }) {
  const [state, setState] = useState('idle')

  useEffect(() => {
    if (state === 'loading') {
      const t = setTimeout(() => setState('done'), loadingDuration)
      return () => clearTimeout(t)
    }
    if (state === 'done') {
      const t = setTimeout(() => setState('idle'), 1500)
      return () => clearTimeout(t)
    }
  }, [state, loadingDuration])

  const handleClick = () => {
    if (state !== 'idle') return
    setState('loading')
    onAction?.()
  }

  const isIdle = state === 'idle'
  const isLoading = state === 'loading'
  const isDone = state === 'done'

  const spring = 'cubic-bezier(0.34, 1.3, 0.64, 1)'
  const contentIn = `opacity 0.2s ${spring} 0.08s, scale 0.2s ${spring} 0.08s, filter 0.2s ${spring} 0.08s`
  const contentOut = 'opacity 0.12s cubic-bezier(0.4, 0, 1, 1), scale 0.12s cubic-bezier(0.4, 0, 1, 1), filter 0.12s cubic-bezier(0.4, 0, 1, 1)'

  return (
    <div className={`inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!isIdle}
        className="relative flex items-center justify-center font-medium cursor-pointer overflow-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-2"
        style={{
          height: 44,
          minWidth: 44,
          paddingLeft: isIdle ? 20 : 12,
          paddingRight: isIdle ? 20 : 12,
          borderRadius: isIdle ? 12 : 22,
          backgroundColor: isDone ? 'var(--inv-accent)' : 'var(--inv-heading)',
          color: 'var(--inv-bg)',
          transition: `padding 0.35s ${spring}, border-radius 0.35s ${spring}, background-color 0.3s ease`,
        }}
      >
        {/* Idle — label + icon */}
        <span
          className="flex items-center gap-2 text-[length:var(--type-body)] whitespace-nowrap"
          style={{
            opacity: isIdle ? 1 : 0,
            scale: isIdle ? '1' : '0.85',
            filter: isIdle ? 'blur(0px)' : 'blur(6px)',
            transition: isIdle ? contentIn : contentOut,
            width: isIdle ? 'auto' : 0,
            overflow: 'hidden',
          }}
        >
          {icon && <Icon name={icon} size={18} />}
          {label}
        </span>

        {/* Loading — spinner */}
        <span
          style={{
            opacity: isLoading ? 1 : 0,
            scale: isLoading ? '1' : '0.85',
            filter: isLoading ? 'blur(0px)' : 'blur(6px)',
            transition: isLoading ? contentIn : contentOut,
            width: isLoading ? 20 : 0,
            height: 20,
            overflow: 'hidden',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" className="animate-spin">
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="24" strokeLinecap="round" />
          </svg>
        </span>

        {/* Done — check */}
        <span
          style={{
            opacity: isDone ? 1 : 0,
            scale: isDone ? '1' : '0.85',
            filter: isDone ? 'blur(0px)' : 'blur(6px)',
            transition: isDone ? contentIn : contentOut,
            width: isDone ? 20 : 0,
            height: 20,
            overflow: 'hidden',
          }}
        >
          <Icon name="check" size={20} />
        </span>
      </button>
    </div>
  )
}
