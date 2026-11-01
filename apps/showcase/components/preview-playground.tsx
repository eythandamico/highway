"use client";
import { useState, type ComponentType } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "../../../packages/highway-react/src/components/ui/dropdown-menu";
import { ComponentPreview } from "./component-preview";
import { stateExamples } from "../previews/state-examples";

const categories = { variants: "Appearance", sizes: "Size", alignment: "Align", states: "State" } as const;
type Category = keyof typeof categories;
export function PreviewPlayground({ entry }: { entry: { id: string; previewId?: string; preview?: ComponentType } }) {
  const [replay, setReplay] = useState(0);
  const replayable = entry.id === "number-roll";
  const examples = stateExamples[entry.id];
  const [selection, setSelection] = useState<Partial<Record<Category, string>>>({});
  const groups = (Object.keys(categories) as Category[]).flatMap(kind => {
    const samples = examples?.[kind];
    if (!samples?.length) return [];
    const options = samples.map((sample, index) => ({ ...sample, id: String(index) }));
    const defaultLabel = examples?.defaults?.[kind] ?? "Default";
    if (!options.some(option => option.label === defaultLabel)) options.unshift({ id: "default", label: "Default", values: {} });
    const selected = options.find(option => option.id === selection[kind]) ?? options.find(option => option.label === defaultLabel)!;
    return [{ kind, label: examples?.labels?.[kind] ?? categories[kind], options, selected }];
  });
  const values = Object.assign({}, ...groups.map(group => group.selected.values));
  return <div className="preview-playground" data-controls={groups.length > 0 || replayable || undefined} data-replayable={replayable || undefined}>
    <ComponentPreview key={`${entry.id}:${replay}`} entry={entry} values={values}/>
    {(groups.length > 0 || replayable) && <div className="preview-playground-controls" role="group" aria-label="Preview settings">
      {replayable && <Button variant="ghost" size="sm" onClick={() => setReplay(value => value + 1)}><RotateCcw aria-hidden="true"/>Replay</Button>}
      {groups.map(({ kind, label, options, selected }) => <DropdownMenu key={kind}>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" aria-label={`${label}: ${selected.label}`}>
          <span className="preview-setting-label">{label}</span><span>{selected.label}</span><ChevronDown size={14} aria-hidden="true"/>
        </Button></DropdownMenuTrigger>
        <DropdownMenuContent align="center"><DropdownMenuRadioGroup value={selected.id} onValueChange={id => setSelection(current => ({ ...current, [kind]: id }))}>
          {options.map(option => <DropdownMenuRadioItem key={option.id} value={option.id}>{option.label}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup></DropdownMenuContent>
      </DropdownMenu>)}
    </div>}
  </div>;
}
