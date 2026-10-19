"use client";
import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
const ThemeContext = createContext<CSSProperties>({});
/** React context crosses portals; CSS inheritance does not. Keep overlays in the same theme. */
export function ThemeScope({
  tokens,
  children,
}: {
  tokens: CSSProperties;
  children: ReactNode;
}) {
  const inherited = useContext(ThemeContext);
  return (
    <ThemeContext.Provider value={{ ...inherited, ...tokens }}>{children}</ThemeContext.Provider>
  );
}
export function useThemeTokens() {
  return useContext(ThemeContext);
}
