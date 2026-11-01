"use client";
import { lazy, Suspense, useId, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
const Calendar = /* @__PURE__ */ lazy(() =>
  import("./calendar").then((module) => ({ default: module.Calendar })),
);
export interface DateRangeValue {
  from: string;
  to: string;
}
export interface DateRangePickerProps {
  label: string;
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  presets?: { label: string; value: DateRangeValue }[];
}
function date(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) || iso(parsed) !== value
    ? undefined
    : parsed;
}
function iso(value: Date | undefined) {
  return value
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
    : "";
}
export function DateRangePicker({
  label,
  value,
  defaultValue = { from: "", to: "" },
  onValueChange,
  min,
  max,
  disabled,
  className = "",
  name,
  presets = [],
}: DateRangePickerProps) {
  const id = useId();
  const [local, setLocal] = useState(defaultValue),
    [open, setOpen] = useState(false);
  const current = value ?? local;
  const update = (next: DateRangeValue) => {
    if (value === undefined) setLocal(next);
    onValueChange?.(next);
  };
  const invalid =
    !!(current.from && current.to && current.from > current.to) ||
    !!(
      min &&
      ((current.from && current.from < min) || (current.to && current.to < min))
    ) ||
    !!(
      max &&
      ((current.to && current.to > max) || (current.from && current.from > max))
    );
  return (
    <fieldset disabled={disabled} className={`hw-range ${className}`}>
      <legend className="hw-field-label">{label}</legend>
      <div className="hw-inline-edit">
        <label>
          From
          <Input
            type="date"
            name={name ? `${name}.from` : undefined}
            value={current.from}
            min={min}
            max={current.to || max}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            onChange={(event) =>
              update({ ...current, from: event.target.value })
            }
          />
        </label>
        <label>
          To
          <Input
            type="date"
            name={name ? `${name}.to` : undefined}
            value={current.to}
            min={current.from || min}
            max={max}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            onChange={(event) => update({ ...current, to: event.target.value })}
          />
        </label>
        <Popover open={open && !disabled} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              aria-label={`Choose ${label}`}
            >
              <CalendarDays aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="ui-date-popover hw-range-popover" align="start">
            {presets.length > 0 && (
              <div className="hw-button-group">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="ghost"
                    disabled={
                      !!(
                        (min && preset.value.from < min) ||
                        (max && preset.value.to > max) ||
                        preset.value.from > preset.value.to
                      )
                    }
                    onClick={() => {
                      update(preset.value);
                      setOpen(false);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            )}
            {open && (
              <Suspense fallback={<p role="status">Loading calendar…</p>}>
                <Calendar
                  mode="range"
                  selected={{ from: date(current.from), to: date(current.to) }}
                  defaultMonth={date(current.from) ?? date(min)}
                  autoFocus
                  disabled={[
                    ...(date(min) ? [{ before: date(min)! }] : []),
                    ...(date(max) ? [{ after: date(max)! }] : []),
                  ]}
                  onSelect={(next) =>
                    update({ from: iso(next?.from), to: iso(next?.to) })
                  }
                />
              </Suspense>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      {invalid && (
        <p id={`${id}-error`} role="alert">
          Choose an ordered range within the allowed dates.
        </p>
      )}
    </fieldset>
  );
}
