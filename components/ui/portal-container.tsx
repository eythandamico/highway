"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCallback, useImperativeHandle, useState, type Ref, type RefCallback } from "react";

const PortalContainerContext = createContext<Element | DocumentFragment | null>(null);

export function PortalContainerProvider({
  container,
  children,
}: {
  container: Element | DocumentFragment | null;
  children: ReactNode;
}) {
  return (
    <PortalContainerContext.Provider value={container}>
      {children}
    </PortalContainerContext.Provider>
  );
}

export function usePortalContainer() {
  return useContext(PortalContainerContext);
}

export function usePortalContainerRef<T extends Element>(forwardedRef?: Ref<T>) {
  const [container, setContainer] = useState<T | null>(null);
  useImperativeHandle(forwardedRef, () => container as T, [container]);
  const ref = useCallback<RefCallback<T>>((node) => setContainer(node), []);

  return { container, ref };
}
