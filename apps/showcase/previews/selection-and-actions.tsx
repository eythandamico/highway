"use client";
import { useExampleState } from "./example-state";
import {
  Combobox,
} from "../../../packages/highway-react/src/components/ui/choice-picker";
import {
  InlineEdit,
  SplitButton,
  CopyButton,
  ButtonGroup,
  FilterToolbar,
} from "../../../packages/highway-react/src/components/ui/action-patterns";
import { DateRangePicker } from "../../../packages/highway-react/src/components/ui/date-range-picker";
import { CommandPalette } from "../../../packages/highway-react/src/components/ui/command-palette";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
const options = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering", keywords: ["development"] },
  { value: "operations", label: "Operations" },
  { value: "archived", label: "Archived team", disabled: true },
];
export function ComboboxPreview() {
  const [disabled] = useExampleState("disabled", false);
  const [value, setValue] = useExampleState("value", "design");
  return (
    <Combobox disabled={disabled}
      label="Team"
      options={options}
      value={value}
      onValueChange={setValue}
    />
  );
}
export function MultiSelectPreview() {
  const [disabled] = useExampleState("disabled", false);
  const [value, setValue] = useExampleState<string[]>("value", ["design"]);
  return (
    <Combobox disabled={disabled} multiple
      label="Teams"
      options={options}
      value={value}
      onValueChange={setValue}
    />
  );
}
export function InlineEditPreview() {
  const [value, setValue] = useExampleState("value", "Highway workspace");
  const [fail] = useExampleState("fail", false);
  return (
    <div>
      <InlineEdit
        label="Workspace name"
        value={value}
        validate={(next) => (!next.trim() ? "Enter a name." : undefined)}
        onSave={async (next) => {
          if (fail) throw new Error("Demo failure");
          setValue(next);
        }}
      />

    </div>
  );
}
export function SplitButtonPreview() {
  const [result, setResult] = useExampleState("result", "Ready");
  return (
    <div>
      <SplitButton
        label="Save"
        onAction={() => setResult("Saved locally")}
        actions={[
          {
            id: "draft",
            label: "Save draft",
            onAction: () => setResult("Draft saved locally"),
          },
          {
            id: "fail",
            label: "Simulate failure",
            onAction: async () => {
              throw new Error("Demo failure");
            },
          },
        ]}
      />
      <p className="sr-only" role="status">{result}</p>
    </div>
  );
}
export function ButtonGroupPreview() {
  const [result, setResult] = useExampleState("result", "Choose an action");
  return (
    <div>
      <ButtonGroup label="Document actions">
        <CopyButton value="Highway" />
        <Button
          type="button"
          variant="secondary"
          onClick={() => setResult("Archived locally")}
        >
          Archive
        </Button>
      </ButtonGroup>
      <p className="sr-only" role="status">{result}</p>
    </div>
  );
}
export function CopyButtonPreview() {
  return <CopyButton value="npm run verify" label="Copy command" />;
}
export function DateRangePreview() {
  return (
    <DateRangePicker
      label="Reporting period"
      defaultValue={{ from: "2026-10-01", to: "2026-10-28" }}
      presets={[
        { label: "October", value: { from: "2026-10-01", to: "2026-10-31" } },
      ]}
    />
  );
}
export function FilterToolbarPreview() {
  const [disabled] = useExampleState("disabled", false);
  const [value, setValue] = useExampleState<string[]>("value", []);
  return (
    <FilterToolbar activeCount={value.length} onClear={() => setValue([])}>
      <Combobox disabled={disabled} multiple
        label="Teams"
        options={options}
        value={value}
        onValueChange={setValue}
      />
    </FilterToolbar>
  );
}
export function CommandPalettePreview() {
  const [open, setOpen] = useExampleState("open", false);
  const [result, setResult] = useExampleState("result", "No action selected");
  return (
    <div>
      <Button type="button" onClick={() => setOpen(true)}>
        Open commands
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={[
          {
            value: "new",
            label: "New project",
            keywords: ["create"],
            onSelect: () => setResult("New project selected"),
          },
          {
            value: "failure",
            label: "Simulate failure",
            onSelect: async () => {
              throw new Error("Demo failure");
            },
          },
        ]}
      />
      <p className="sr-only" role="status">{result}</p>
    </div>
  );
}
