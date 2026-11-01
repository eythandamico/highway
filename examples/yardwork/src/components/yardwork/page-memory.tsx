"use client";
import { createContext, useContext, useLayoutEffect, useState, useSyncExternalStore, type Dispatch, type ReactNode, type SetStateAction } from "react";

class PageStore {
  private values = new Map<string, unknown>();
  private listeners = new Set<() => void>();
  has = (key: string) => this.values.has(key);
  get = (key: string) => this.values.get(key);
  set = (key: string, value: unknown) => {
    if (Object.is(this.values.get(key), value) && this.values.has(key)) return;
    this.values.set(key, value);
    this.listeners.forEach(listener => listener());
  };
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
}
// Only retain the active workspace, in browser memory. Never share SSR request state.
let active: { scope: string; store: PageStore } | undefined;
function scopedStore(scope: string) {
  if (typeof window === "undefined") return new PageStore();
  if (active?.scope !== scope) active = { scope, store: new PageStore() };
  return active.store;
}
const Memory = createContext<PageStore | null>(null);
export function PageMemory({ scope, children }: { scope: string; children: ReactNode }) {
  const [memory] = useState(() => scopedStore(scope));
  return <Memory.Provider value={memory}>{children}</Memory.Provider>;
}
export function usePageMemory() { return useContext(Memory); }
export function useRememberedState<T>(key: string, initial: T | (() => T), override?: T) {
  const context = useContext(Memory);
  const [local] = useState(() => new PageStore());
  const memory = context ?? local;
  const [fallback] = useState(initial);
  const value = useSyncExternalStore(memory.subscribe, () => memory.has(key) ? memory.get(key) as T : fallback, () => fallback);
  useLayoutEffect(() => { if (override !== undefined) memory.set(key, override); }, [key, memory, override]);
  const setValue: Dispatch<SetStateAction<T>> = next => {
    const previous = memory.has(key) ? memory.get(key) as T : fallback;
    memory.set(key, typeof next === "function" ? (next as (value: T) => T)(previous) : next);
  };
  return [value, setValue] as const;
}
export function RememberedPage({ name, children }: { name: string; children: ReactNode }) {
  const memory = useContext(Memory);
  useLayoutEffect(() => {
    window.scrollTo({ top: (memory?.get(`scroll:${name}`) as number | undefined) ?? 0, behavior: "instant" });
    const remember = () => { memory?.set(`scroll:${name}`, window.scrollY); };
    window.addEventListener("popstate", remember);
    return () => { window.removeEventListener("popstate", remember); };
  }, [name, memory]);
  return children;
}
