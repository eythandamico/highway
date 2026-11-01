"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export type ActionState = "idle" | "pending" | "success" | "error";
/** Owns presentation only. The caller owns the operation, persistence and cancellation. */
export function useAsyncAction(resetAfterMs = 0) {
  const [state, setState] = useState<ActionState>("idle");
  const [error, setError] = useState<unknown>();
  const active = useRef(false),
    mounted = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const run = useCallback(
    async (action: () => unknown | Promise<unknown>) => {
      if (active.current) return false;
      active.current = true;
      clearTimeout(timer.current);
      setError(undefined);
      setState("pending");
      try {
        await action();
        if (mounted.current) {
          setState("success");
          if (resetAfterMs > 0)
            timer.current = setTimeout(() => setState("idle"), resetAfterMs);
        }
        return true;
      } catch (cause) {
        if (mounted.current) {
          setError(cause);
          setState("error");
        }
        return false;
      } finally {
        active.current = false;
      }
    },
    [resetAfterMs],
  );
  const reset = useCallback(() => {
    if (active.current) return;
    clearTimeout(timer.current);
    setState("idle");
    setError(undefined);
  }, []);
  return { state, error, run, reset, pending: state === "pending" };
}
