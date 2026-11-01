"use client";
import { NativeSelect } from "../../../../../packages/highway-react/src/components/ui/native-select";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { Button } from "../../../../../packages/highway-react/src/components/ui/button";
import { Input } from "../../../../../packages/highway-react/src/components/ui/input";
import { Textarea } from "../../../../../packages/highway-react/src/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../../../packages/highway-react/src/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { Status } from "../../../../../packages/highway-react/src/components/foundation/status";
import { Feedback } from "../../../../../packages/highway-react/src/components/foundation/feedback";
export { Button, Input, Textarea, Status };
/** Trailing values and their supporting status share one stable end edge. */
export function RowMeta({ children }: { children: ReactNode }) {
  return <div className="yw-row-meta">{children}</div>;
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="yw-empty">
      <div className="yw-empty-mark">
        <Plus size={22} aria-hidden="true" />
      </div>
      <h2>{title}</h2>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}
export function Heading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="yw-heading">
      <div>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      <div className="yw-actions">{children}</div>
    </div>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="yw-search">
      <Search size={18} aria-hidden="true" />
      <Input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string }[];
}) {
  return (
    <div className="yw-tabs" role="group" aria-label="View options">
      {items.map((item) => (
        <Button
          key={item.value}
          variant="ghost"
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
export function Modal({
  title,
  description,
  open,
  pending = false,
  onClose,
  children,
  sidebar,
}: {
  title: string;
  description?: string;
  open: boolean;
  pending?: boolean;
  onClose: () => void;
  children: ReactNode;
  sidebar?: ReactNode;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && !pending && onClose()}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          if (sidebar && titleRef.current) { event.preventDefault(); titleRef.current.focus(); }
        }}
        mobileSheet
        size="wide"
        pending={pending}
        className={sidebar ? "yw-dialog yw-record-dialog" : "yw-dialog"}
      >
        {sidebar ? <div className="yw-record-layout">
          <div className="yw-record-main">
            <header className="yw-record-header">
              <DialogTitle ref={titleRef} tabIndex={-1}>{title}</DialogTitle>
              <DialogDescription>{description || "Review the details below."}</DialogDescription>
            </header>
            {children}
          </div>
          <aside className="yw-record-sidebar" aria-label="Customer profile">{sidebar}</aside>
        </div> : <>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description || "Review the details below."}</DialogDescription>
          {children}
        </>}
      </DialogContent>
    </Dialog>
  );
}
export type FieldSpec = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel" | "url";
  disabled?: boolean;
};
export function Fields({
  fields,
  values,
  set,
  errors = {},
  disabled = false,
}: {
  fields: FieldSpec[];
  errors?: Record<string, string>;
  disabled?: boolean;
  values: Record<string, unknown>;
  set: (name: string, value: unknown) => void;
}) {
  const groupId = useId();
  return (
    <div className="yw-form-grid">
      {fields.map((f) => {
        const fieldId = `${groupId}-${f.name}`;
        const error = errors[f.name];
        const common = {
          id: fieldId,
          name: f.name,
          disabled: disabled || f.disabled,
          "aria-invalid": error ? (true as const) : undefined,
          "aria-describedby":
            [f.hint && `${fieldId}-hint`, error && `${fieldId}-error`]
              .filter(Boolean)
              .join(" ") || undefined,
        };
        return (
          <label
            className={f.type === "textarea" ? "yw-field yw-span" : "yw-field"}
            key={f.name}
            htmlFor={fieldId}
          >
            <span>
              {f.label}
              {f.required === false && (
                <span className="ui-field-optional"> (optional)</span>
              )}
            </span>
            {f.options ? (
              <NativeSelect
                className="yw-select"
                {...common}
                value={String(values[f.name] ?? "")}
                required={f.required !== false}
                onChange={(e) => set(f.name, e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </NativeSelect>
            ) : f.type === "textarea" ? (
              <Textarea
                rows={4}
                {...common}
                value={String(values[f.name] ?? "")}
                required={f.required !== false}
                maxLength={f.max || 4000}
                onChange={(e) => set(f.name, e.target.value)}
              />
            ) : f.type === "checkbox" ? (
              <input
                type="checkbox"
                {...common}
                checked={!!values[f.name]}
                onChange={(e) => set(f.name, e.target.checked)}
              />
            ) : (
              <Input
                {...common}
                type={f.type || "text"}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                value={String(values[f.name] ?? "")}
                required={f.required !== false}
                min={f.min}
                max={f.max}
                step={f.step}
                maxLength={f.type === "number" ? undefined : f.max || 500}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}{" "}
            {f.hint && (
              <small className="muted" id={`${fieldId}-hint`}>
                {f.hint}
              </small>
            )}
            {error && (
              <small className="ui-field-error" id={`${fieldId}-error`}>
                {error}
              </small>
            )}
          </label>
        );
      })}
    </div>
  );
}
export function FormDialog({
  title,
  description,
  fields,
  initial,
  onSave,
  onClose,
  submit = "Save",
}: {
  title: string;
  description?: string;
  fields: FieldSpec[];
  initial: Record<string, unknown>;
  onSave: (values: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  submit?: string;
}) {
  const [values, setValues] = useState(initial),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const submitting = useRef(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorSummary.current?.focus();
  }, [error]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await onSave(values);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  return (
    <Modal
      title={title}
      description={description}
      open
      pending={pending}
      onClose={() => !pending && onClose()}
    >
      <form onSubmit={save} className="stack" aria-busy={pending}>
        <Fields
          fields={fields}
          disabled={pending}
          values={values}
          set={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
        />
        {error && (
          <div tabIndex={-1} ref={errorSummary}>
            <Feedback>
              {error} Your entries are still here; correct them or try again.
            </Feedback>
          </div>
        )}
        <div className="yw-actions yw-end">
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button loading={pending} type="submit">
            {pending ? "Saving…" : submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function Confirm({
  title,
  description,
  onConfirm,
  onClose,
  label = "Confirm",
}: {
  title: string;
  description: string;
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
  label?: string;
}) {
  return (
    <FormDialog
      title={title}
      description={description}
      fields={[]}
      initial={{}}
      onSave={onConfirm}
      onClose={onClose}
      submit={label}
    />
  );
}
export const customerFields: FieldSpec[] = [
  { name: "name", label: "Customer name" },
  { name: "email", label: "Email", type: "email", required: false },
  { name: "phone", label: "Phone", type: "tel", required: false },
  { name: "address", label: "Street address, city, province" },
  { name: "area", label: "Neighbourhood" },
  { name: "recurring", label: "Visit frequency" },
  { name: "notes", label: "Property notes", type: "textarea", required: false },
];
