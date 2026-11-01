import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

function PortalLayerContracts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [channel, setChannel] = useState("field-notes");
  const [pageChannel, setPageChannel] = useState("field-notes");
  const [date, setDate] = useState("2026-10-19");

  return (
    <main className="portal-layer-story">
      <Button onClick={() => setDialogOpen(true)}>Open nested-control dialog</Button>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild><Button variant="secondary">Open shared sheet</Button></SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Shared sheet surface</SheetTitle>
            <SheetDescription>
              The overlay surface keeps its own opaque base.
            </SheetDescription>
          </SheetHeader>
          <label className="portal-layer-field">
            Sheet channel
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger aria-label="Sheet channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="field-notes">Field notes</SelectItem>
                <SelectItem value="northstar">Northstar</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </SheetContent>
      </Sheet>
      <Button size="icon" aria-label="Open compact action">+</Button>
      <label className="portal-layer-field">
        Page channel
        <Select value={pageChannel} onValueChange={setPageChannel}>
          <SelectTrigger aria-label="Page channel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="field-notes">Field notes</SelectItem>
            <SelectItem value="northstar">Northstar</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="portal-layer-dialog">
          <DialogTitle>Popup layer contract</DialogTitle>
          <DialogDescription>
            Shared popups stay above their owning dialog and remain dismissible by keyboard.
          </DialogDescription>

          <label className="portal-layer-field">
            Notification channel
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger aria-label="Notification channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="field-notes">Field notes</SelectItem>
                <SelectItem value="northstar">Northstar</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="portal-layer-field">
            Start date
            <DateInput
              aria-label="Start date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </DialogContent>
      </Dialog>

    </main>
  );
}

const meta = {
  title: "Foundation/Portal layer contracts",
  component: PortalLayerContracts,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PortalLayerContracts>;

export default meta;
type Story = StoryObj<typeof meta>;
export const AllStates: Story = {};
