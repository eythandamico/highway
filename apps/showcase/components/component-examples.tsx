"use client";
import { ComponentPreview } from "./component-preview";
import { stateExamples } from "../previews/state-examples";
import type { ComponentType } from "react";
export function ComponentExamples({ entry }: { entry: { id: string; previewId?: string; preview?: ComponentType } }) {
  const examples = stateExamples[entry.id];
  if (!examples) return null;
  return <>{(["variants", "sizes", "states"] as const).map(kind => examples[kind]?.length ? <section className="library-example-section" key={kind} aria-label={kind === "variants" ? "Appearance" : kind === "sizes" ? "Sizes" : "States"}>
    <h2>{kind === "variants" ? "Appearance" : kind === "sizes" ? "Sizes" : "States"}</h2>
    <div className="library-example-grid">{examples[kind]!.map(example => <figure key={example.label}>
      <figcaption>{example.label}</figcaption>
      <ComponentPreview entry={entry} values={example.values} compact/>
    </figure>)}</div>
  </section> : null)}</>;
}
