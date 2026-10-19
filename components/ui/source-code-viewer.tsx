"use client";
import { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, keymap, drawSelection } from "@codemirror/view";
import { foldGutter, syntaxHighlighting, HighlightStyle, bracketMatching, LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { defaultKeymap } from "@codemirror/commands";
import { search, searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { tags } from "@lezer/highlight";
const highlighting = HighlightStyle.define([
  { tag:tags.keyword, color:"var(--code-keyword)" },
  { tag:[tags.string,tags.special(tags.string)], color:"var(--code-string)" },
  { tag:[tags.number,tags.bool,tags.null], color:"var(--code-number)" },
  { tag:[tags.propertyName,tags.attributeName], color:"var(--code-property)" },
  { tag:[tags.tagName,tags.typeName,tags.className], color:"var(--code-type)" },
  { tag:[tags.function(tags.variableName),tags.function(tags.propertyName)], color:"var(--code-function)" },
  { tag:[tags.comment,tags.meta], color:"var(--code-comment)", fontStyle:"italic" },
  { tag:tags.operator, color:"var(--code-keyword)" },
]);
export function SourceCodeViewer({ source,path,wrap }: { source:string; path:string; wrap:boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView | null>(null);
  const wrapping = useRef(new Compartment());
  useEffect(() => {
    if (!host.current) return;
    const language = new Compartment();
    let disposed = false;
    const view = new EditorView({ parent:host.current, state:EditorState.create({ doc:source, extensions:[
      EditorState.readOnly.of(true), EditorView.editable.of(false), EditorView.contentAttributes.of({ tabindex:"0", "aria-label":`Source of ${path}` }),
      lineNumbers(), highlightActiveLineGutter(), highlightSpecialChars(), drawSelection(), foldGutter(), bracketMatching(), highlightSelectionMatches(),
      search({ top:true }), keymap.of([...searchKeymap,...defaultKeymap]), syntaxHighlighting(highlighting), language.of([]),
      wrapping.current.of([]),
      EditorView.theme({ "&":{height:"100%",fontSize:"var(--type-secondary)",backgroundColor:"var(--surface)",color:"var(--ink)"}, ".cm-scroller":{fontFamily:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",lineHeight:"1.65",overflow:"auto"}, ".cm-content":{padding:"var(--space-4) 0"}, ".cm-line":{padding:"0 var(--space-5) 0 var(--space-2)"}, ".cm-gutters":{backgroundColor:"var(--surface)",color:"var(--code-comment)",border:"none"}, ".cm-gutterElement":{padding:"0 var(--space-2)"}, ".cm-activeLineGutter":{backgroundColor:"var(--surface-muted)"}, "&.cm-focused":{outline:"none"}, ".cm-selectionBackground, &.cm-focused .cm-selectionBackground":{backgroundColor:"var(--code-selection)"}, ".cm-searchMatch":{backgroundColor:"var(--code-match)"}, ".cm-panels":{backgroundColor:"var(--surface-muted)",color:"var(--ink)"} }),
    ]}) });
    editor.current = view;
    const description = LanguageDescription.matchFilename(languages,path);
    description?.load().then(support => { if(!disposed) view.dispatch({ effects:language.reconfigure(support) }); }).catch(() => {});
    return () => { disposed=true; editor.current=null; view.destroy(); };
  }, [source,path]);
  useEffect(() => {
    editor.current?.dispatch({ effects:wrapping.current.reconfigure(wrap ? EditorView.lineWrapping : []) });
  }, [wrap,source,path]);
  return <div ref={host} className="source-code-viewer"/>;
}
