import { useEffect, useRef } from 'react'

export function useClickOutside(isOpen, onClose) {
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const handleClick = () => onCloseRef.current()
    const handleKey = (e) => { if (e.key === 'Escape') onCloseRef.current() }
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    document.addEventListener('keydown', handleKey)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])
}
