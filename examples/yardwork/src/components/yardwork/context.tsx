"use client";
import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { actionFeedback } from "../../../../../lib/ui/action-feedback";
import type { Workspace, ActionName } from "../../lib/yardwork/yardwork";
export type Snapshot = { state: Workspace; revision: number; workspaceId?: string; role?: string };
type OfficeContext = Snapshot & {
  now: string; demo: boolean; busy: boolean; error: string;
  mutate: (action: ActionName, payload: unknown) => Promise<Workspace>;
  refresh: () => Promise<void>;
  request: <T = Record<string, unknown>>(url: string, data?: unknown) => Promise<T>;
  adopt: (snapshot: Snapshot) => void;
};
const Context = createContext<OfficeContext | null>(null);
export const useOffice = () => {
  const value = useContext(Context);
  if (!value) throw new Error("Office context missing");
  return value;
};
/** Demo-only provider: the copied screens have no live workspace transport. */
export function OfficeProvider({ initial, initialNow, children }: { initial: Snapshot; initialNow: string; demo: boolean; children: ReactNode }) {
  const [now, setNow] = useState(initialNow);
  const [snapshot, setSnapshot] = useState(initial), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const latest = useRef(snapshot), locked = useRef(false);
  useEffect(() => {
    const update = () => setNow(new Date().toISOString());
    const timer = setInterval(update, 60000); window.addEventListener("focus", update);
    return () => { clearInterval(timer); window.removeEventListener("focus", update); };
  }, []);
  const adopt = useCallback((next: Snapshot) => { latest.current = { ...latest.current, ...next }; setSnapshot(latest.current); }, []);
  const request = useCallback(async <T = Record<string, unknown>,>(): Promise<T> => {
    throw new Error("This is a standalone demo. Live connections, messages, payments, and uploads are disabled.");
  }, []);
  const refresh = useCallback(async () => {}, []);
  const mutate = useCallback(async (action: ActionName, payload: unknown) => {
    if (locked.current) throw new Error("Wait for the current change to finish.");
    locked.current = true; setBusy(true); setError("");
    try {
      const { applyAction } = await import("../../lib/yardwork/yardwork");
      const next = { ...latest.current, state: applyAction(latest.current.state, action, payload, new Date(), true), revision: latest.current.revision + 1 };
      adopt(next);
      const confirmation = actionFeedback(action, true); if (confirmation) toast.success(confirmation);
      return next.state;
    } catch (e) { const message = e instanceof Error ? e.message : "Could not update the demo."; setError(message); toast.error(message); throw e; }
    finally { locked.current = false; setBusy(false); }
  }, [adopt]);
  useEffect(() => {
    const timer = setInterval(() => {
      const enabled = latest.current.state.automationPreferences;
      if (!locked.current && document.visibilityState === "visible" && (enabled?.invoiceFollowUps || enabled?.quoteFollowUps)) void mutate("automation-run", {}).catch(() => {});
    }, 60000);
    return () => clearInterval(timer);
  }, [mutate]);
  return <Context.Provider value={{ ...snapshot, now, demo: true, busy, error, mutate, refresh, request, adopt }}>{children}</Context.Provider>;
}
