"use client";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { ChevronDown, Check, Copy } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useAsyncAction } from "../../lib/interaction/use-async-action";
import { LiveStatus } from "./live-status";
export interface ButtonGroupProps extends ComponentProps<"div"> {
  label: string;
}
export function ButtonGroup({
  label,
  className = "",
  children,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      {...props}
      role="group"
      aria-label={label}
      className={`hw-button-group ${className}`}
    >
      {children}
    </div>
  );
}
export interface SplitButtonProps {
  label: string;
  onAction: () => void | Promise<void>;
  disabled?: boolean;
  actions: {
    id: string;
    label: string;
    onAction: () => void | Promise<void>;
    disabled?: boolean;
    destructive?: boolean;
  }[];
  onActionError?: (error: unknown) => void;
  className?: string;
}
export function SplitButton({
  label,
  onAction,
  actions,
  disabled,
  onActionError,
  className,
}: SplitButtonProps) {
  const action = useAsyncAction();
  const run = (operation: () => void | Promise<void>) =>
    action.run(async () => {
      try {
        await operation();
      } catch (error) {
        onActionError?.(error);
        throw error;
      }
    });
  return (
    <div className={className}>
      <ButtonGroup label={`${label} actions`}>
        <Button
          type="button"
          disabled={disabled}
          loading={action.pending}
          onClick={() => void run(onAction)}
        >
          {label}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              disabled={disabled || action.pending}
              aria-label={`${label} alternatives`}
            >
              <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((item) => (
              <DropdownMenuItem
                key={item.id}
                disabled={item.disabled}
                variant={item.destructive ? "destructive" : "default"}
                onSelect={() => void run(item.onAction)}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <LiveStatus>
        {action.pending
          ? "Working"
          : action.state === "success"
            ? "Completed"
            : ""}
      </LiveStatus>
      {action.state === "error" && (
        <p role="alert">Action failed. Try again.</p>
      )}
    </div>
  );
}
export interface CopyButtonProps
  extends Omit<
    ComponentProps<typeof Button>,
    "onClick" | "children" | "loading"
  > {
  value: string;
  label?: string;
  onCopied?: () => void;
  onCopyError?: (error: unknown) => void;
}
export function CopyButton({
  value,
  label = "Copy",
  onCopied,
  onCopyError,
  ...props
}: CopyButtonProps) {
  const action = useAsyncAction(2000);
  return (
    <>
      <Button
        {...props}
        type={props.type ?? "button"}
        loading={action.pending}
        onClick={() =>
          void action.run(async () => {
            try {
              await navigator.clipboard.writeText(value);
            } catch (error) {
              onCopyError?.(error);
              throw error;
            }
            onCopied?.();
          })
        }
      >
        {action.state === "success" ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        <span>
          {action.state === "success"
            ? "Copied"
            : action.state === "error"
              ? "Retry copy"
              : label}
        </span>
      </Button>
      <LiveStatus>
        {action.state === "success"
          ? `${label}: copied`
          : action.state === "error"
            ? "Could not copy. Try again."
            : ""}
      </LiveStatus>
    </>
  );
}
export interface InlineEditProps {
  label: string;
  value: string;
  onSave: (value: string) => void | Promise<void>;
  validate?: (value: string) => string | undefined;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}
export function InlineEdit({
  label,
  value,
  onSave,
  validate,
  disabled,
  placeholder = "Add a value",
  className,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(value),
    [validation, setValidation] = useState("");
  const action = useAsyncAction();
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (editing) {
      input.current?.focus();
      input.current?.select();
    }
  }, [editing]);
  function close() {
    setEditing(false);
    requestAnimationFrame(() => {
      if (mounted.current) trigger.current?.focus();
    });
  }
  async function save() {
    if (disabled || action.pending) return;
    const error = validate?.(draft);
    if (error) {
      setValidation(error);
      input.current?.focus();
      return;
    }
    setValidation("");
    const success = await action.run(() => onSave(draft));
    if (mounted.current) {
      if (success) close();
      else
        requestAnimationFrame(() => {
          if (mounted.current) input.current?.focus();
        });
    }
  }
  return (
    <div className={className}>
      {editing ? (
        <div
          className="hw-inline-edit"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !action.pending) {
              event.stopPropagation();
              close();
            }
          }}
        >
          <Input
            ref={input}
            aria-label={label}
            aria-invalid={!!validation || action.state === "error"}
            value={draft}
            disabled={disabled || action.pending}
            onChange={(event) => {
              setDraft(event.target.value);
              setValidation("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void save();
              }
            }}
          />
          <Button
            type="button"
            loading={action.pending}
            disabled={disabled}
            onClick={() => void save()}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={action.pending}
            onClick={close}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          ref={trigger}
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-label={`Edit ${label}: ${value || placeholder}`}
          onClick={() => {
            action.reset();
            setDraft(value);
            setValidation("");
            setEditing(true);
          }}
        >
          {value || placeholder}
        </Button>
      )}
      {editing && (validation || action.state === "error") && (
        <p role="alert">
          {validation ||
            "Could not save. Your changes are retained. Try again."}
        </p>
      )}
      <LiveStatus>
        {action.pending ? "Saving" : action.state === "success" ? "Saved" : ""}
      </LiveStatus>
    </div>
  );
}
export interface FilterToolbarProps {
  label?: string;
  children: ReactNode;
  activeCount?: number;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}
export function FilterToolbar({
  label = "Filters",
  children,
  activeCount = 0,
  onClear,
  disabled,
  className = "",
}: FilterToolbarProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`hw-filter-toolbar ${className}`}
    >
      <span>{label}</span>
      {children}
      {onClear && (
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || !activeCount}
          onClick={onClear}
        >
          Clear filters
        </Button>
      )}
      <LiveStatus>{activeCount} active filters</LiveStatus>
    </div>
  );
}
