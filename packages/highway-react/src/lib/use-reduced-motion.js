import { useSyncExternalStore } from 'react'

const subscribe = callback => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}
const snapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const serverSnapshot = () => true

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot)
}
