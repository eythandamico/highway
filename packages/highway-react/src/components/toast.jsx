"use client";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { useThemeTokens } from './ui/theme-scope'
import { usePortalContainer } from './ui/portal-container'
import { Button } from './ui/button'
import { useReducedMotion } from '../lib/use-reduced-motion.js'
import { useDismissalTimer } from '../lib/interaction/use-dismissal-timer'
import { StatusIcon } from './alert.jsx'
import Icon from '../lib/icon.jsx'

/** @type {import('react').Context<import('../types').ToastController | null>} */
const ToastContext = createContext(null)
let toastId = 0

function ToastItem({ toast, onDismiss, expanded, onHeight }) {
  const card = useRef(null)
  useEffect(() => {
    const node = card.current
    if (!node) return
    const measure = () => onHeight(toast.id, node.offsetHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [toast.id, onHeight])
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [drag, setDrag] = useState(0)
  const origin = useRef(null)
  const removal = useRef(null)
  const closing = useRef(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => { cancelAnimationFrame(frame); clearTimeout(removal.current) }
  }, [])
  const dismiss = useCallback(() => {
    if (closing.current) return
    closing.current = true
    setVisible(false)
    removal.current = setTimeout(() => onDismiss(toast.id), reduced ? 0 : 180)
  }, [onDismiss, toast.id, reduced])
  const timer = useDismissalTimer(toast.variant === 'loading' ? 0 : toast.duration, dismiss)
  const { pause, resume } = timer
  useEffect(() => { if (expanded) pause('stack'); else resume('stack') }, [expanded, pause, resume])
  const variant = toast.variant === 'loading' ? 'info' : toast.variant
  const color = `var(--status-${variant})`
  return <div ref={card} className="hw-toast" data-visible={visible} data-reduced={reduced || undefined}
    style={{ transform: `translateX(${drag}px) translateY(${visible || reduced ? 0 : 12}px)`, opacity: visible ? Math.max(0.2, 1 - Math.abs(drag) / 220) : 0 }}
    onPointerEnter={() => timer.pause('pointer')} onPointerLeave={() => timer.resume('pointer')}
    onFocusCapture={() => timer.pause('focus')}
    onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) timer.resume('focus') }}
    onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); dismiss() } }}
    onPointerDown={e => {
      if (e.button !== 0 || e.target.closest('button,a,input')) return
      origin.current = e.clientX; timer.pause('drag'); e.currentTarget.setPointerCapture(e.pointerId)
    }}
    onPointerMove={e => { if (origin.current !== null) setDrag(e.clientX - origin.current) }}
    onPointerUp={e => {
      if (origin.current === null) return
      const distance = e.clientX - origin.current
      origin.current = null; timer.resume('drag')
      if (Math.abs(distance) > 80) dismiss(); else setDrag(0)
    }}
    onPointerCancel={() => { origin.current = null; setDrag(0); timer.resume('drag') }}>
    <div className="hw-toast-status" style={{ background: color, '--alert-icon-bg': color }}>
      {toast.variant === 'loading' ? <Icon name="loader" size={16} className="animate-spin"/> : <StatusIcon variant={variant}/>}
    </div>
    <div className="hw-toast-content">
      <div role={toast.variant === 'error' ? 'alert' : 'status'} aria-atomic="true">
        <div className="highway-type-body highway-weight-medium">{toast.title}</div>
        {toast.message && <div className="highway-type-body-sm hw-toast-description">{toast.message}</div>}
      </div>
      {toast.action && <div className="hw-toast-action">{toast.action}</div>}
    </div>
    <Button variant="ghost" size="icon-xs" aria-label={`Dismiss ${toast.title}`} onClick={dismiss}><Icon name="close" size={16}/></Button>
  </div>
}

export function ToastProvider({ children }) {
  const tokens = useThemeTokens()
  const container = usePortalContainer()
  const [toasts, setToasts] = useState([])
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const expanded = hovered || focused
  const [heights, setHeights] = useState({})
  const measure = useCallback((id, height) => setHeights(current => current[id] === height ? current : { ...current, [id]: height }), [])
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  const addToast = useCallback((title, options = {}) => {
    const id = ++toastId
    const variant = options.variant || ({ check: 'success', close: 'error', alert: 'warning' }[options.icon || 'check'] || 'info')
    setToasts(current => [...current, { duration: 3000, ...options, variant, title, id }])
    return id
  }, [])
  const dismissToast = useCallback(id => {
    setToasts(current => current.filter(item => item.id !== id))
    setHeights(current => { const next = { ...current }; delete next[id]; return next })
  }, [])
  const updateToast = useCallback((id, options) => {
    if (alive.current) setToasts(current => current.map(item => item.id === id ? { ...item, ...options, id } : item))
  }, [])
  const promiseToast = useCallback((promise, { loading = 'Working…', success = 'Complete', error = 'Something went wrong', ...options } = {}) => {
    const id = addToast(loading, { ...options, variant: 'loading' })
    Promise.resolve(promise).then(
      result => updateToast(id, { ...options, title: typeof success === 'function' ? success(result) : success, variant: 'success' }),
      reason => updateToast(id, { ...options, title: typeof error === 'function' ? error(reason) : error, variant: 'error' }),
    )
    return id
  }, [addToast, updateToast])
  const visible = toasts.slice(0, 3)
  const frontHeight = heights[visible[visible.length - 1]?.id] || 80
  const stackHeight = expanded ? visible.reduce((total, toast) => total + (heights[toast.id] || 80), 0) + Math.max(0, visible.length - 1) * 12 : frontHeight + Math.max(0, visible.length - 1) * 10
  return <ToastContext.Provider value={{ addToast, dismissToast, updateToast, promiseToast }}>
    {children}
    {toasts.length > 0 && typeof document !== 'undefined' && createPortal(
      <section className="highway-theme hw-toast-region" style={{ ...tokens, height: stackHeight }} aria-label="Notifications"
        onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
        {visible.map((toast, index) => {
          const depth = visible.length - 1 - index
          const offset = expanded ? visible.slice(index + 1).reduce((total, item) => total + (heights[item.id] || 80) + 12, 0) : depth * 10
          return <div key={toast.id} className="hw-toast-layer" data-expanded={expanded || undefined}
            style={{ zIndex: index + 1, transform: `translateY(-${offset}px) scale(${expanded ? 1 : 1 - depth * 0.04})` }}>
            <ToastItem toast={toast} expanded={expanded} onHeight={measure} onDismiss={dismissToast}/>
          </div>
        })}
      </section>, container || document.body)}
  </ToastContext.Provider>
}
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
