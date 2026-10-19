import {
  AskBar,
  Button,
  DateInput,
  EdgeFade,
  FormDialog,
  FoundationDialog,
  GlassCard,
  HighwayTheme,
  MediaScrim,
  ProgressiveBlur,
  StateIcon,
} from "@highway/react";
import type { AskBarMessage } from "@highway/react";
import { Check, Circle, Play } from "lucide-react";

const messages: AskBarMessage[] = [{ id: "reply-1", role: "assistant", text: "Ready." }];
const save = async () => undefined;

export function PackageTypeFixture() {
  return (
    <HighwayTheme
      mode="dark"
      brand={{ primary: "#1849a9", primaryForeground: "#fff", fontFamily: "Inter, sans-serif" }}
    >
      <Button variant="secondary" loading>Save</Button>
      <GlassCard aria-label="Raised surface" />
      <DateInput aria-label="Visit date" value="2026-10-19" onChange={() => undefined} />
      <AskBar messages={messages} onSend={async () => undefined} />
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
