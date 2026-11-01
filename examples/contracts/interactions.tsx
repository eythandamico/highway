import { useState } from "react";
import {
  HighwayTheme,
  Combobox,
  MultiSelect,
  DateRangePicker,
  InlineEdit,
  Button,
  ButtonGroup,
  CopyButton,
  SplitButton,
  FilterToolbar,
  CommandPalette,
} from "@highway/react";
import "@highway/styles/styles.css";
export function InteractionExamples() {
  const [team, setTeam] = useState("design"),
    [teams, setTeams] = useState<string[]>([]),
    [name, setName] = useState("Workspace"),
    [open, setOpen] = useState(false);
  const options = [
    { value: "design", label: "Design" },
    { value: "engineering", label: "Engineering" },
  ];
  return (
    <HighwayTheme>
      <Combobox
        label="Team"
        options={options}
        value={team}
        onValueChange={setTeam}
      />
      <FilterToolbar activeCount={teams.length} onClear={() => setTeams([])}>
        <MultiSelect
          label="Teams"
          options={options}
          value={teams}
          onValueChange={setTeams}
        />
      </FilterToolbar>
      <DateRangePicker
        label="Reporting period"
        defaultValue={{ from: "2026-10-01", to: "2026-10-28" }}
      />
      <InlineEdit
        label="Workspace name"
        value={name}
        validate={(value) => (value.trim() ? undefined : "Enter a name")}
        onSave={async (next) => {
          /* Await your existing API here. */ setName(next);
        }}
      />
      <ButtonGroup label="Commands">
        <CopyButton value="npm run verify" />
        <Button type="button" onClick={() => setOpen(true)}>
          Commands
        </Button>
      </ButtonGroup>
      <SplitButton
        label="Save"
        onAction={async () => {
          /* Await your existing save operation. */
        }}
        actions={[
          {
            id: "draft",
            label: "Save draft",
            onAction: async () => {
              /* Await draft save. */
            },
          },
        ]}
      />
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={[
          {
            value: "reset",
            label: "Reset filters",
            onSelect: () => setTeams([]),
          },
        ]}
      />
    </HighwayTheme>
  );
}
