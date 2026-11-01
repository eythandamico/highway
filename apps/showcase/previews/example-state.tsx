"use client";
import { createContext, useContext, useState, useCallback, type Dispatch, type SetStateAction, type ReactNode } from "react";
export type ExampleValues = Readonly<Record<string, unknown>>;
const ExampleState = createContext<ExampleValues>({});
export function ExampleStateProvider({ values, children }: { values: ExampleValues; children: ReactNode }) {
  return <ExampleState.Provider value={values}>{children}</ExampleState.Provider>;
}
/** Preview settings update live; unrelated settings retain local interaction state. */
export function useExampleState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const values = useContext(ExampleState);
  const [seed] = useState<T>(initial);
  const override = Object.hasOwn(values, key) ? values[key] as T : seed;
  const [state, setState] = useState(() => ({ override, value: override }));
  if (!Object.is(state.override, override)) setState({ override, value: override });
  const value = Object.is(state.override, override) ? state.value : override;
  const setValue: Dispatch<SetStateAction<T>> = useCallback(next => setState(current => ({ ...current, value: typeof next === "function" ? (next as (value: T) => T)(current.value) : next })), []);
  return [value, setValue];
}
