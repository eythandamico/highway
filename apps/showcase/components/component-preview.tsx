"use client";
import { lazy, Suspense, useSyncExternalStore, type ComponentType } from "react";
import { ExampleStateProvider, type ExampleValues } from "../previews/example-state";
import { useTheme } from "next-themes";
const CraftedPreview = lazy(() => import("../previews/interactive-preview.jsx").then(module => ({ default: module.CraftedPreview })));

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type PreviewEntry = { id: string; previewId?: string; preview?: ComponentType };
/** One canvas for documentation, directory thumbnails, and standalone previews. */
export function ComponentPreview({ entry, gallery = false, values = {}, compact = false }: { entry: PreviewEntry; gallery?: boolean; values?: ExampleValues; compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const Preview = entry.preview;
  return <section className="highway-preview" data-gallery={gallery || undefined} data-compact={compact || undefined} aria-label="Interactive component preview">
    <ExampleStateProvider values={values}><Suspense fallback={null}>{mounted && (entry.previewId
      ? <CraftedPreview key={entry.id} id={entry.previewId} dark={resolvedTheme === "dark"} onToggleTheme={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}/>
      : <div className="library-preview-inner">{Preview && <Preview key={entry.id}/>}</div>)}</Suspense></ExampleStateProvider>
  </section>;
}
