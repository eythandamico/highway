"use client";
import { Children, isValidElement, useRef, useId, useState, useEffect, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

type Option = { value: string; label: ReactNode; disabled?: boolean };
function optionsFrom(children: ReactNode, disabled = false): Option[] {
  return Children.toArray(children).flatMap(child => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child)) return [];
    if (child.type === "option") return [{ value: String(child.props.value ?? child.props.children ?? ""), label: child.props.children, disabled: disabled || child.props.disabled }];
    return optionsFrom(child.props.children, disabled || child.props.disabled);
  });
}
/** Retain the native form control while presenting an accessible, themed listbox. */
export function NativeSelect({ className, children, id, ref, defaultValue, ...props }: ComponentProps<"select">) {
  const native = useRef<HTMLSelectElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const errorId = useId();
  const [invalid, setInvalid] = useState(false);
  const options = optionsFrom(children);
  const [local, setLocal] = useState(String(defaultValue ?? options[0]?.value ?? ""));
  const value = props.value === undefined ? local : String(props.value);
  useEffect(() => {
    const form = native.current?.form;
    const reset = () => { setLocal(String(defaultValue ?? optionsFrom(children)[0]?.value ?? "")); setInvalid(false); };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue, children]);
  if (props.multiple || (props.size && props.size > 1)) return <select id={id} className={cn("ui-native-select", className)} ref={ref} defaultValue={defaultValue} {...props}>{children}</select>;
  const encode = (v: string) => `option:${v}`;
  return <>
    <select {...props} id={undefined} ref={node => { native.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} className="ui-select-form-control" aria-hidden="true" tabIndex={-1} value={value} onChange={e => { setLocal(e.target.value); setInvalid(false); props.onChange?.(e); }} onInvalid={e => { props.onInvalid?.(e); e.preventDefault(); setInvalid(true); trigger.current?.focus(); }}>{children}</select>
    <Select value={encode(value)} disabled={props.disabled} onValueChange={encoded => {
      const next = encoded.slice(7); setLocal(next);
      if (native.current) { native.current.value = next; native.current.dispatchEvent(new Event("change", { bubbles: true })); }
    }}>
      <SelectTrigger ref={trigger} id={id} className={cn("ui-native-select", className)} aria-label={props["aria-label"]} aria-labelledby={props["aria-labelledby"]} aria-describedby={[props["aria-describedby"], invalid ? errorId : undefined].filter(Boolean).join(" ") || undefined} aria-invalid={invalid || props["aria-invalid"]} aria-required={props.required}><SelectValue /></SelectTrigger>
      <SelectContent position="popper" align="start">{options.map(o => <SelectItem key={o.value} value={encode(o.value)} disabled={o.disabled}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
    {invalid && <span id={errorId} role="alert" className="ui-select-error">Choose an option.</span>}
  </>;
}
