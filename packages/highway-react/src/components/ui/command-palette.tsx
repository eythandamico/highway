"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { SearchOptions, type ChoiceOption } from "./choice-picker";
import { useAsyncAction } from "../../lib/interaction/use-async-action";
import { LiveStatus } from "./live-status";
export interface CommandItem extends ChoiceOption {
  onSelect: () => void | Promise<void>;
}
export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  title?: string;
  description?: string;
  onActionError?: (error: unknown) => void;
}
/** Host registers any global shortcut; no document-level listener is installed. */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  title = "Commands",
  description = "Search for an action. Use arrow keys to navigate and Enter to select.",
  onActionError,
}: CommandPaletteProps) {
  const action = useAsyncAction();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!action.pending) {
          if (!next) action.reset();
          onOpenChange(next);
        }
      }}
    >
      <DialogContent pending={action.pending}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <SearchOptions
          label={title}
          options={items.map((item) => ({
            ...item,
            disabled: action.pending || item.disabled,
          }))}
          selected={[]}
          onSelect={(key) => {
            const item = items.find((candidate) => candidate.value === key);
            if (!item || item.disabled) return;
            void action.run(async () => {
              try {
                await item.onSelect();
                onOpenChange(false);
              } catch (error) {
                onActionError?.(error);
                throw error;
              }
            });
          }}
        />
        <LiveStatus>{action.pending ? "Running command" : ""}</LiveStatus>
        {action.state === "error" && (
          <p role="alert">Command failed. Try again.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
