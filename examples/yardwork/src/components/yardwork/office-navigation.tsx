"use client";
import type { CSSProperties } from "react";
import { House, CalendarDays, Users, ReceiptText } from "lucide-react";
import { Button } from "../../../../../packages/highway-react/src/components/ui/button";
const destinations = [["today", "Today", House], ["schedule", "Schedule", CalendarDays], ["customers", "Customers", Users], ["money", "Money", ReceiptText]] as const;
export type PrimaryDestination = typeof destinations[number][0];
export function OfficeNavigation({ current, onNavigate, onIntent }: { current: string; onNavigate: (destination: PrimaryDestination) => void; onIntent?: (destination: PrimaryDestination) => void }) {
  const index = destinations.findIndex(([key]) => key === current);
  return <nav className="yw-desktop-nav" aria-label="Office navigation" data-active={index >= 0} style={{ "--nav-index": Math.max(0, index) } as CSSProperties}>
    <span className="yw-nav-pill" aria-hidden="true" />
    {destinations.map(([key, label, Icon]) => <Button key={key} variant="ghost" aria-current={current === key ? "page" : undefined} onPointerEnter={() => onIntent?.(key)} onFocus={() => onIntent?.(key)} onClick={() => onNavigate(key)}>
      <Icon className="size-5" size={20} strokeWidth={1.75} aria-hidden="true" />{label}
    </Button>)}
  </nav>;
}
