"use client";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  nextEnabledIndex,
  toggleSelection,
} from "../../lib/interaction/selection";
export interface ChoiceOption {
  value: string;
  label: string;
  disabled?: boolean;
  keywords?: string[];
  description?: string;
}
interface SearchOptionsProps {
  label: string;
  options: ChoiceOption[];
  selected: readonly string[];
  multiple?: boolean;
  onSelect: (value: string) => void;
  emptyMessage?: string;
}
export function SearchOptions({
  label,
  options,
  selected,
  multiple,
  onSelect,
  emptyMessage = "No results found.",
}: SearchOptionsProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [activeValue, setActiveValue] = useState<string>();
  const list = useRef<HTMLDivElement>(null);
  const filtered = options.filter((option) =>
    `${option.label} ${option.keywords?.join(" ") ?? ""}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const active = filtered.findIndex(
    (option) => option.value === activeValue && !option.disabled,
  );
  const index =
    active < 0 ? filtered.findIndex((option) => !option.disabled) : active;
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowUp")
      next = nextEnabledIndex(
        filtered.map((option) => !!option.disabled),
        index,
        event.key === "ArrowDown" ? 1 : -1,
      );
    else if (event.key === "Home")
      next = filtered.findIndex((option) => !option.disabled);
    else if (event.key === "End")
      next = nextEnabledIndex(
        filtered.map((option) => !!option.disabled),
        0,
        -1,
      );
    else if (event.key === "Enter") {
      event.preventDefault();
      if (index >= 0) onSelect(filtered[index].value);
      return;
    } else return;
    event.preventDefault();
    setActiveValue(filtered[next]?.value);
    list.current
      ?.querySelectorAll('[role="option"]')
      [next]?.scrollIntoView({ block: "nearest" });
  }
  return (
    <div className="hw-choice-search">
      <Input
        aria-label={`Search ${label}`}
        role="combobox"
        aria-expanded="true"
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={index >= 0 ? `${id}-${index}` : undefined}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveValue(undefined);
        }}
        onKeyDown={keyDown}
      />
      <div
        ref={list}
        id={`${id}-list`}
        role="listbox"
        aria-label={label}
        aria-multiselectable={multiple || undefined}
        className="hw-choice-options"
      >
        {filtered.map((option, i) => (
          <div
            id={`${id}-${i}`}
            key={option.value}
            role="option"
            aria-selected={selected.includes(option.value)}
            aria-disabled={option.disabled || undefined}
            data-active={index === i || undefined}
            className="hw-choice-option"
            onPointerMove={() => {
              if (!option.disabled) setActiveValue(option.value);
            }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (!option.disabled) onSelect(option.value);
            }}
          >
            <span>
              {option.label}
              {option.description && (
                <span className="hw-choice-description">
                  {option.description}
                </span>
              )}
            </span>
            <Check
              className="hw-choice-check"
              data-visible={selected.includes(option.value)}
              size={16}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
      {!filtered.length && <p role="status">{emptyMessage}</p>}
    </div>
  );
}
interface SingleComboboxProps {
  multiple?: false;
  label: string;
  options: ChoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
  emptyMessage?: string;
}
export interface MultiSelectProps
  extends Omit<SingleComboboxProps, "multiple" | "value" | "defaultValue" | "onValueChange"> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}
export type ComboboxProps = SingleComboboxProps | (MultiSelectProps & { multiple: true });
function Picker({
  label,
  options,
  value,
  onChange,
  multiple,
  placeholder = "Choose…",
  disabled,
  name,
  className,
  emptyMessage,
}: Omit<SingleComboboxProps, "multiple" | "value" | "defaultValue" | "onValueChange"> & {
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const labels = value.map(
    (key) => options.find((option) => option.value === key)?.label ?? key,
  );
  return (
    <div className={className}>
      <label htmlFor={id} className="hw-field-label">
        {label}
      </label>
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="secondary"
            disabled={disabled}
            className="hw-choice-trigger"
            aria-label={`${label}: ${labels.join(", ") || placeholder}`}
          >
            <span>{labels.length ? labels.join(", ") : placeholder}</span>
            <ChevronsUpDown size={16} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="hw-choice-popover">
          <SearchOptions
            label={label}
            options={options}
            selected={value}
            multiple={multiple}
            emptyMessage={emptyMessage}
            onSelect={(key) => {
              onChange(multiple ? toggleSelection(value, key) : [key]);
              if (!multiple) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {name &&
        (multiple ? (
          value.map((key) => (
            <input
              key={key}
              type="hidden"
              name={name}
              value={key}
              disabled={disabled}
            />
          ))
        ) : (
          <input
            type="hidden"
            name={name}
            value={value[0] ?? ""}
            disabled={disabled}
          />
        ))}
    </div>
  );
}
export function Combobox(props: ComboboxProps) {
  const [local, setLocal] = useState<string[]>(() => props.multiple
    ? (props.defaultValue ?? []) : (props.defaultValue ? [props.defaultValue] : []));
  const current = props.value === undefined ? local : props.multiple ? props.value : (props.value ? [props.value] : []);
  return <Picker {...props} value={current} multiple={props.multiple} onChange={next => {
    if (props.value === undefined) setLocal(next);
    if (props.multiple) props.onValueChange?.(next);
    else props.onValueChange?.(next[0] ?? "");
  }}/>;
}
/** Compatibility name for the multiple-selection Combobox. */
export function MultiSelect(props: MultiSelectProps) {
  return <Combobox {...props} multiple/>;
}
