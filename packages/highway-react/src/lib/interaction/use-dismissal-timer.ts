"use client";
import { useEffect, useRef, useCallback } from "react";
/** Zero duration persists. Multiple independent pause reasons cannot resume each other. */
export function useDismissalTimer(duration: number, onDismiss: () => void) {
  const callback = useRef(onDismiss);
  useEffect(() => {
    callback.current = onDismiss;
  }, [onDismiss]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const remaining = useRef(duration),
    started = useRef(0),
    reasons = useRef(new Set<string>());
  const start = useCallback(() => {
    clearTimeout(timer.current);
    if (duration <= 0 || !Number.isFinite(duration) || reasons.current.size) return;
    started.current = Date.now();
    timer.current = setTimeout(
      () => {
        remaining.current = 0;
        callback.current();
      },
      Math.max(0, remaining.current),
    );
  }, [duration]);
  const pause = useCallback((reason: string) => {
    if (!reasons.current.size) {
      clearTimeout(timer.current);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started.current),
      );
    }
    reasons.current.add(reason);
  }, []);
  const resume = useCallback(
    (reason: string) => {
      if (reasons.current.delete(reason) && !reasons.current.size) start();
    },
    [start],
  );
  useEffect(() => {
    remaining.current = duration;
    const visibility = () =>
      document.hidden ? pause("document") : resume("document");
    if (document.hidden) reasons.current.add("document");
    else reasons.current.delete("document");
    start();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [duration, start, pause, resume]);
  return { pause, resume };
}
