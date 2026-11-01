import {
  ActionButton,
  AskBar,
  Button,
  ButtonGroup,
  Combobox,
  CommandPalette,
  CopyButton,
  DateRangePicker,
  DateInput,
  EdgeFade,
  FilterToolbar,
  FormDialog,
  FoundationDialog,
  GlassCard,
  HighwayTheme,
  InlineEdit,
  MediaScrim,
  MultiSelect,
  ProgressiveBlur,
  SplitButton,
  StateIcon,
  Select,
  Table,
  ToastProvider,
  VoiceRecorder,
  ContextTray,
  ReviewApplyCard,
  useToast,
} from "@highway/react";
import type { AskBarMessage, ContextItem, VoiceRecording } from "@highway/react";
import { Check, Circle, Play } from "lucide-react";

const messages: AskBarMessage[] = [{ id: "reply-1", role: "assistant", text: "Ready." }];
const save = async () => undefined;
const context: ContextItem[] = [{ id: "fixture", label: "Current context", content: "The host owns this value." }];
const attachRecording = async (recording: VoiceRecording) => {
  void recording.blob;
  void recording.durationMs;
  void recording.mimeType;
};

function ToastTypeFixture() {
  const { addToast } = useToast();
  return <Button onClick={() => addToast("Saved", { message: "The update is available.", duration: 0, action: <Button type="button">Undo</Button> })}>Show toast</Button>;
}

export function PackageTypeFixture() {
  return (
    <HighwayTheme
      mode="dark"
      brand={{ primary: "#1849a9", primaryForeground: "#fff", fontFamily: "Inter, sans-serif" }}
    >
      <Button variant="secondary" loading>Save</Button>
      <ActionButton label="Archive" pendingLabel="Archiving" errorLabel="Archive failed" onAction={async () => undefined} />
      <GlassCard aria-label="Raised surface" />
      <DateInput aria-label="Visit date" value="2026-10-19" onChange={() => undefined} />
      <Select
        label="Channel"
        options={[{ id: "email", label: "Email" }, { id: "voice", label: "Voice", disabled: true }]}
        value="email"
        onChange={() => undefined}
      />
      <Table
        columns={[{ key: "name", label: "Name" }, { key: "id", label: "ID" }]}
        data={[{ id: "north", name: "North" }, { id: "south", name: "South" }]}
        selectable
        rowKey="id"
        defaultSelectedKeys={["north"]}
        onSelectedKeysChange={(keys) => keys.map(String)}
        onSelectionChange={(indices) => indices.map(Number)}
      />
  <Combobox label="Region" options={[{ value: "north", label: "North" }]} value="north" onValueChange={(value: string) => value.toUpperCase()} />
  <Combobox
    multiple
    label="Regions"
    options={[{ value: "north", label: "North" }, { value: "south", label: "South" }]}
    value={["north"]}
    onValueChange={(values: string[]) => values.map((value) => value.toUpperCase())}
  />
  {/* @ts-expect-error multiple selection must use string[] values */}
  <Combobox multiple label="Invalid regions" options={[]} value="north" />
  {/* @ts-expect-error multiple selection callbacks receive the complete selection */}
  <Combobox multiple label="Invalid callback" options={[]} onValueChange={(value: string) => value.toUpperCase()} />
      <MultiSelect label="Segments" options={[{ value: "active", label: "Active" }]} defaultValue={["active"]} onValueChange={() => undefined} />
      <DateRangePicker label="Visit window" defaultValue={{ from: "2026-10-01", to: "2026-10-31" }} name="visit" />
      <InlineEdit label="Project name" value="North" onSave={async () => undefined} />
      <ButtonGroup label="Record actions"><Button type="button">Open</Button><Button type="button">Archive</Button></ButtonGroup>
      <SplitButton label="Create report" onAction={async () => undefined} actions={[{ id: "template", label: "Use template", onAction: async () => undefined }]} />
      <CopyButton value="copyable text" onCopied={() => undefined} onCopyError={() => undefined} />
      <FilterToolbar label="Project filters" activeCount={1} onClear={() => undefined}><Button type="button">Assigned to me</Button></FilterToolbar>
      <CommandPalette open={false} onOpenChange={() => undefined} items={[{ value: "reindex", label: "Reindex", onSelect: async () => undefined }]} />
      <ToastProvider><ToastTypeFixture /></ToastProvider>
      <AskBar messages={messages} onSend={async () => undefined} />
      <VoiceRecorder label="Package voice note" disabled onAttach={attachRecording} />
      <ContextTray items={context} disabled onRemove={(id) => { void id; }} />
      <ReviewApplyCard title="Package proposal" before="Before" after="After" onApply={save} onReject={() => undefined} disabled />
      <FormDialog
        title="Add record"
        fields={[{ name: "name", label: "Name", required: true }]}
        initial={{ name: "" }}
        onSave={save}
        onClose={() => undefined}
        submit="Save record"
      />
      <FoundationDialog open={false} />
      <ProgressiveBlur edge="right" recipe="panel" />
      <EdgeFade axis="vertical" />
      <MediaScrim softness />
      <StateIcon active inactiveIcon={<Play />} activeIcon={<Check />} size={20} />
      <span aria-hidden="true"><Circle /></span>
    </HighwayTheme>
  );
}
