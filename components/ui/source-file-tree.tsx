"use client";
import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, FileJson, FileCode2, FileText, FileImage, FileCog, FileArchive, GitBranch, CodeXml, FileTerminal, FileMusic, FileVideo, Hash } from "lucide-react";

export function fileKind(path: string) {
  const name = path.split("/").pop()!.toLowerCase();
  if (name.startsWith(".git")) return "git";
  if (/\.(tsx?|mts|cts)$/.test(name)) return "typescript";
  if (/\.(jsx?|mjs|cjs)$/.test(name)) return "javascript";
  if (/\.(json|jsonc|json5)$/.test(name)) return "json";
  if (/\.(html?|xml|svg|vue|svelte)$/.test(name)) return "markup";
  if (/\.(css|scss|sass|less)$/.test(name)) return "style";
  if (/\.(png|jpe?g|gif|webp|ico|avif)$/.test(name)) return "image";
  if (/\.(md|mdx|txt|rst)$/.test(name)) return "text";
  if (/\.(sh|bash|zsh|ps1)$/.test(name)) return "shell";
  if (/\.(zip|gz|tar|7z)$/.test(name)) return "archive";
  if (/\.(mp3|wav|ogg)$/.test(name)) return "audio";
  if (/\.(mp4|webm|mov)$/.test(name)) return "video";
  if (/\.(ya?ml|toml|ini|lock)$/.test(name) || name.startsWith(".env") || /dockerfile|makefile/.test(name)) return "config";
  if (/\.(py|rb|rs|go|java|c|cpp|h|swift|sql)$/.test(name)) return "code";
  return "file";
}
export function SourceFileIcon({ path }: { path: string }) {
  const kind = fileKind(path);
  if (kind === "typescript" || kind === "javascript") return <svg className="source-file-icon" data-kind={kind} width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><text x="1" y="14" fill="currentColor" fontSize="12" fontWeight="600">{kind === "typescript" ? "TS" : "JS"}</text></svg>;
  const Icon = ({ git:GitBranch, json:FileJson, markup:CodeXml, style:Hash, image:FileImage, text:FileText, shell:FileTerminal, archive:FileArchive, audio:FileMusic, video:FileVideo, config:FileCog, code:FileCode2, file:File } as const)[kind as Exclude<ReturnType<typeof fileKind>, "typescript" | "javascript">];
  return <Icon className="source-file-icon" data-kind={kind} size={16} aria-hidden="true"/>;
}
type Node = { path: string; name: string; directory: boolean; children: Node[] };
export function buildFileTree(paths: string[]): Node[] {
  const roots: Node[] = [];
  for (const path of paths) {
    let siblings = roots;
    const parts = path.split("/").filter(Boolean);
    parts.forEach((name, index) => {
      const key = parts.slice(0, index + 1).join("/");
      let node = siblings.find(item => item.path === key);
      if (!node) { node = { path:key, name, directory:index < parts.length - 1, children:[] }; siblings.push(node); }
      siblings = node.children;
    });
  }
  function sort(nodes: Node[]) { nodes.sort((a,b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name, undefined, { numeric:true })); nodes.forEach(node => sort(node.children)); }
  sort(roots);
  return roots;
}
export function SourceFileTree({ paths, selected, onSelect, query = "" }: { paths:string[]; selected:string; onSelect:(path:string)=>void; query?:string }) {
  const tree = useMemo(() => buildFileTree(paths), [paths]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(selected.split("/").slice(0,-1).map((_,i,parts) => parts.slice(0,i+1).join("/"))));
  const [focused, setFocused] = useState(selected);
  const root = useRef<HTMLDivElement>(null);
  const search = query.trim().toLowerCase();
  const matches = (node:Node):boolean => node.path.toLowerCase().includes(search) || node.children.some(matches);
  const rows: { node:Node; depth:number; parent?:string; position:number; count:number }[] = [];
  function flatten(nodes:Node[], depth:number, parent?:string) {
    const visible = search ? nodes.filter(matches) : nodes;
    visible.forEach((node,index) => {
      rows.push({ node, depth, parent, position:index+1, count:visible.length });
      if (node.directory && (search || expanded.has(node.path))) flatten(node.children, depth+1, node.path);
    });
  }
  flatten(tree, 1);
  const activeFocus = rows.some(row => row.node.path === focused) ? focused : rows[0]?.node.path;
  function toggle(path:string, open?:boolean) { setExpanded(previous => { const next = new Set(previous); if (open ?? !next.has(path)) next.add(path); else next.delete(path); return next; }); }
  function focus(path:string) { setFocused(path); const elements = root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]'); elements?.forEach(element => { if(element.dataset.path === path) element.focus(); }); }
  return <div ref={root} role="tree" aria-label="Source files" className="source-file-tree">
    {rows.map(({node,depth,parent,position,count},index) => <div key={node.path} role="treeitem" data-path={node.path} aria-level={depth} aria-posinset={position} aria-setsize={count} aria-selected={!node.directory && selected === node.path} aria-expanded={node.directory ? !!search || expanded.has(node.path) : undefined} tabIndex={activeFocus === node.path ? 0 : -1} className="source-tree-row" style={{ paddingLeft:8+(depth-1)*16 }} title={node.path}
      onFocus={() => setFocused(node.path)} onClick={() => { focus(node.path); if(node.directory) toggle(node.path); else onSelect(node.path); }}
      onKeyDown={event => {
        event.stopPropagation();
        const open = !!search || expanded.has(node.path);
        if(event.key === "ArrowDown") focus(rows[Math.min(index+1,rows.length-1)].node.path);
        else if(event.key === "ArrowUp") focus(rows[Math.max(index-1,0)].node.path);
        else if(event.key === "Home") focus(rows[0].node.path);
        else if(event.key === "End") focus(rows[rows.length-1].node.path);
        else if(event.key === "ArrowRight") { if(node.directory && !open) toggle(node.path,true); else if(node.directory && rows[index+1]) focus(rows[index+1].node.path); }
        else if(event.key === "ArrowLeft") { if(node.directory && open && !search) toggle(node.path,false); else if(parent) focus(parent); }
        else if(event.key === "Enter" || event.key === " ") { if(node.directory) toggle(node.path); else onSelect(node.path); }
        else return;
        event.preventDefault();
      }}>
      <span className="source-tree-chevron">{node.directory && (search || expanded.has(node.path) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>)}</span>
      {node.directory ? (search || expanded.has(node.path) ? <FolderOpen size={16} className="source-folder-icon"/> : <Folder size={16} className="source-folder-icon"/>) : <SourceFileIcon path={node.path}/>}
      <span className="source-tree-name">{node.name}</span>
    </div>)}
    {!rows.length && <p className="small-muted">No matching files.</p>}
  </div>;
}
