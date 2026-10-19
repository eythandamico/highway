"use client";

import { createContext, useContext, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./dropdown-menu";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "./sheet";
import { X } from "lucide-react";

const MenuContext = createContext({ mobile: false, close: () => {} });
export function ResponsiveMenu({ children }: { children: ReactNode }) {
  const mobile = useIsMobile(641);
  const [open, setOpen] = useState(false);
  const Root = mobile ? Sheet : DropdownMenu;
  return <MenuContext.Provider value={{ mobile, close: () => setOpen(false) }}><Root open={open} onOpenChange={setOpen} modal={mobile}>{children}</Root></MenuContext.Provider>;
}
export function ResponsiveMenuTrigger(props: ComponentProps<typeof DropdownMenuTrigger>) {
  const { mobile } = useContext(MenuContext);
  return mobile ? <SheetTrigger {...props}/> : <DropdownMenuTrigger {...props}/>;
}
export function ResponsiveMenuContent({ title, children, className, align }: { title: string; children: ReactNode; className?: string; align?: "start" | "center" | "end" }) {
  const { mobile } = useContext(MenuContext);
  const selected = useRef(false);
  return mobile ? <SheetContent side="bottom" className="action-menu-sheet" overlayClassName="notifications-backdrop" showCloseButton={false}
    onCloseAutoFocus={event => { if (selected.current) { event.preventDefault(); selected.current = false; document.getElementById("main")?.focus({preventScroll:true}); } }}>
    <SheetHeader className="action-menu-sheet-header"><SheetTitle>{title}</SheetTitle><SheetDescription className="sr-only">Choose an action.</SheetDescription><SheetClose asChild><Button variant="ghost" size="icon" aria-label="Close menu"><X size={20}/></Button></SheetClose></SheetHeader>
    <div className="action-menu-sheet-items" onClick={event => { if ((event.target as Element).closest('button')) selected.current = true; }}>{children}</div>
  </SheetContent> : <DropdownMenuContent className={className} align={align}>{children}</DropdownMenuContent>;
}
export function ResponsiveMenuItem({ children, onSelect, disabled }: { children: ReactNode; onSelect?: (event: Event) => void; disabled?: boolean }) {
  const { mobile, close } = useContext(MenuContext);
  return mobile ? <Button variant="ghost" disabled={disabled} onClick={() => { const event = new Event("select", { cancelable: true }); onSelect?.(event); if (!event.defaultPrevented) close(); }}>{children}</Button> : <DropdownMenuItem disabled={disabled} onSelect={onSelect}>{children}</DropdownMenuItem>;
}
export function ResponsiveMenuSeparator() {
  const { mobile } = useContext(MenuContext);
  return mobile ? <hr className="action-menu-separator"/> : <DropdownMenuSeparator/>;
}
