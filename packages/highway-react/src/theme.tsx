"use client";
import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ThemeScope, useThemeTokens } from "../../../components/ui/theme-scope";
import { PortalContainerProvider } from "../../../components/ui/portal-container";

export type HighwayTokens = Partial<Record<`--${string}`, string>>;
export interface HighwayBrand {
  primary?: string;
  primaryForeground?: string;
  focus?: string;
  fontFamily?: string;
}
export interface HighwayThemeProps {
  children: ReactNode;
  mode?: "light" | "dark";
  brand?: HighwayBrand;
  tokens?: HighwayTokens;
  className?: string;
}
const BrandContext = createContext<{ mode: "light" | "dark"; brand: HighwayBrand; tokens: HighwayTokens }>({ mode: "light", brand: {}, tokens: {} });
/** Isolates styles and carries the same theme into body-mounted overlays. */
export function HighwayTheme({ children, mode, brand, tokens, className = "" }: HighwayThemeProps) {
  const inherited = useContext(BrandContext);
  const inheritedTokens = useThemeTokens();
  const theme = useMemo(() => ({ mode: mode ?? inherited.mode, brand: { ...inherited.brand, ...brand }, tokens: { ...inherited.tokens, ...tokens } }), [mode, brand, tokens, inherited]);
  const styles = useMemo(() => ({
    ...inheritedTokens,
    ...(theme.brand.primary ? {
      "--primary": theme.brand.primary,
      "--primary-hover": "color-mix(in srgb,var(--primary) 90%,var(--background))",
      "--primary-active": "color-mix(in srgb,var(--primary) 82%,var(--background))",
    } : {}),
    ...(theme.brand.primaryForeground ? { "--primary-foreground": theme.brand.primaryForeground } : {}),
    ...(theme.brand.focus ? { "--ring": theme.brand.focus } : {}),
    ...(theme.brand.fontFamily ? { "--font-sans": theme.brand.fontFamily } : {}),
    ...theme.tokens,
  }) as CSSProperties, [theme, inheritedTokens]);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    const element = document.createElement("div");
    element.dataset.highwayPortalHost = "";
    document.body.appendChild(element);
    // The portal host is an external DOM resource created after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHost(element);
    return () => { element.remove(); };
  }, []);
  const scopeClass = `highway inv-scope ${theme.mode === "dark" ? "dark" : ""}`;
  return <BrandContext.Provider value={theme}><ThemeScope tokens={styles}>
    <PortalContainerProvider container={portal}>
      <div className={`${scopeClass} ${className}`} data-highway-mode={theme.mode} style={styles}>{children}</div>
      {host && createPortal(<div ref={setPortal} className={scopeClass} data-highway-mode={theme.mode} data-highway-portal="" style={styles}/>, host)}
    </PortalContainerProvider>
  </ThemeScope></BrandContext.Provider>;
}
