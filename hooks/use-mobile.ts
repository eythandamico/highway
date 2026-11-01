import * as React from "react"

const MOBILE_BREAKPOINT = 768
const serverSnapshot = () => false

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const query = `(max-width: ${breakpoint - 1}px)`
  const subscribe = React.useCallback((notify: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener("change", notify)
    return () => media.removeEventListener("change", notify)
  }, [query])
  const getSnapshot = React.useCallback(() => window.matchMedia(query).matches, [query])
  return React.useSyncExternalStore(subscribe, getSnapshot, serverSnapshot)
}
