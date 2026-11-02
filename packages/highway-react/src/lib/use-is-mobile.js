import { useCallback, useSyncExternalStore } from 'react'
export function useIsMobile(breakpoint = 640) {
 const query = `(max-width: ${breakpoint - 1}px)`
 const subscribe = useCallback(notify => {
  const media = window.matchMedia(query)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
 }, [query])
 return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
