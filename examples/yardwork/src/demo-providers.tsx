"use client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
export function PreviewProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class" defaultTheme="system" storageKey="foundation.theme" enableSystem disableTransitionOnChange>{children}<Toaster richColors position="bottom-right"/></ThemeProvider>;
}
