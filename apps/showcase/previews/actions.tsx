"use client";
import { useExampleState } from "./example-state";
import { ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../../packages/highway-react/src/components/ui/dropdown-menu";

export function ButtonPreview() {
  const [variant]=useExampleState<"default"|"secondary"|"ghost"|"destructive">("variant", "default"),[disabled]=useExampleState("disabled", false),[loading]=useExampleState("loading", false),[count,setCount]=useExampleState("count", 0);
  const [size] = useExampleState<"xs"|"sm"|"default"|"lg">("size", "default");
  const iconSize = size === "default" ? "icon" : `icon-${size}` as const;
  return <><div className="library-preview-row"><Button size={size} iconPosition="start" variant={variant} disabled={disabled} loading={loading} onClick={()=>setCount(n=>n+1)}><Plus/>Add something good</Button><Button variant={variant} size={iconSize} loading={loading} disabled={disabled} aria-label="Search example" onClick={()=>setCount(n=>n+1)}><Search/></Button></div><p className="sr-only" role="status">{count} preview clicks</p></>;
}

export function MenuPreview(){
  const [selected,setSelected]=useExampleState("selected", "");
  return <div className="library-preview-menu">
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="secondary">Actions<ChevronDown aria-hidden="true"/></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {["Edit", "Duplicate", "Delete"].map(label=><DropdownMenuItem key={label} variant={label === "Delete" ? "destructive" : "default"} onSelect={()=>setSelected(`${label} selected`)}>{label}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
    <span className="sr-only" role="status">{selected}</span>
  </div>;
}
