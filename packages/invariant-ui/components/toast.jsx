"use client";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import Icon from '../lib/icon.jsx'

const ToastContext = createContext(null)

let toastId = 0

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef()

  useEffect(() => {
    // Double RAF ensures the browser has painted the initial state before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true)
      })
    })

    timeoutRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 500)
    }, toast.duration)

    return () => clearTimeout(timeoutRef.current)
  }, [])

  const handleClick = () => {
    clearTimeout(timeoutRef.current)
    setVisible(false)
    setTimeout(() => onDismiss(toast.id), 500)
  }

  const spring = 'cubic-bezier(0.34, 1.3, 0.64, 1)'

  return (
    <div
      onClick={handleClick}
      className="w-[320px] px-4 py-3.5 rounded-2xl bg-[var(--inv-surface)] cursor-pointer"
      style={{
        boxShadow: 'var(--inv-shadow), 0 0 0 1px var(--inv-outline)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.92)',
        filter: visible ? 'blur(0px)' : 'blur(8px)',
        transition: visible
          ? `opacity 0.45s ${spring}, transform 0.45s ${spring}, filter 0.45s ${spring}`
          : 'opacity 0.35s ease, transform 0.35s ease, filter 0.35s ease',
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[length:var(--type-body)] font-medium text-[var(--inv-heading)]">{toast.title}</span>
        {toast.message && <span className="text-[length:var(--type-secondary)] text-[var(--inv-muted)]">{toast.message}</span>}
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((title, { message, icon = 'check', duration = 3000 } = {}) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, title, message, icon, duration }])
    return id
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <div className="relative" style={{ height: 60 }}>
          {toasts.map((toast, i) => {
            const reverseIndex = toasts.length - 1 - i
            const isTop = reverseIndex === 0
            const offset = reverseIndex * 8
            const scale = 1 - reverseIndex * 0.05
            const opacity = reverseIndex > 2 ? 0 : 1

            return (
              <div
                key={toast.id}
                className="absolute bottom-0 left-1/2 pointer-events-auto"
                style={{
                  transform: `translateX(-50%) translateY(-${offset}px) scale(${scale})`,
                  opacity,
                  zIndex: toasts.length - reverseIndex,
                  transition: 'transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.35s ease',
                }}
              >
                <ToastItem toast={toast} onDismiss={dismissToast} />
              </div>
            )
          })}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
