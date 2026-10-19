"use client";
import { lazy, Suspense, useRef, useState, type ComponentProps } from "react";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";

const Calendar = lazy(() => import("./calendar").then(module => ({ default: module.Calendar })));

const dateFrom = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : undefined;
export function DateInput({ ref, ...props }: ComponentProps<"input">) {
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(dateFrom(props.value ?? props.defaultValue));
  const min = dateFrom(props.min), max = dateFrom(props.max);
  return <span className="ui-date-field">
    <input {...props} type="date" ref={node => { input.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} />
    <Popover open={open} onOpenChange={next => { if (next) setSelected(dateFrom(input.current?.value)); setOpen(next); }}>
      <PopoverTrigger asChild><Button type="button" variant="ghost" className="ui-date-trigger" disabled={props.disabled || props.readOnly} aria-label="Choose date"><CalendarDays size={18} /></Button></PopoverTrigger>
      <PopoverContent className="ui-date-popover" align="start" onCloseAutoFocus={e => { e.preventDefault(); input.current?.focus(); }}>
        {open && <Suspense fallback={<div className="ui-date-calendar-loading" role="status">Loading calendar…</div>}><Calendar mode="single" selected={selected} defaultMonth={selected ?? min} autoFocus disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]} onSelect={date => {
          if (!date || !input.current) return;
          const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input.current, next);
          input.current.dispatchEvent(new Event("input", { bubbles: true }));
          input.current.dispatchEvent(new Event("change", { bubbles: true }));
          setSelected(date); setOpen(false);
        }} /></Suspense>}
      </PopoverContent>
    </Popover>
  </span>;
}
