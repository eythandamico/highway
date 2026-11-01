import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider, useTheme } from "next-themes";
import { ContextTray, ReviewApplyCard, VoiceRecorder } from "../packages/highway-react/src/components/ui/agent-tools";

function AgentToolsHarness() {
  const { resolvedTheme, setTheme } = useTheme();
  const [voiceMounted, setVoiceMounted] = useState(true);
  const [voiceDisabled, setVoiceDisabled] = useState(false);
  const [voiceResult, setVoiceResult] = useState("No recording attached.");
  const [attachAttempts, setAttachAttempts] = useState(0);
  const attachAttemptsRef = useRef(0);

  const [contextDisabled, setContextDisabled] = useState(false);
  const [contextItems, setContextItems] = useState([
    {
      id: "brief",
      label: "Product brief",
      description: "Project goals and constraints",
      content: <article><h3>Product brief</h3><p>Design a thoughtful foundation for teams that build tools for other people.</p><p>Keep decisions reviewable, preserve existing data, and make every state easy to understand.</p></article>,
    },
    {
      id: "reference",
      label: "API reference",
      description: "A long reference that remains readable in a narrow dialog",
      content: <article><h3>API reference</h3><p>Components receive explicit values and return to the host for side effects.</p><pre>{"{ id, label, description, content }"}</pre><p>Long content stays inside the review surface and remains available to assistive technology.</p></article>,
    },
  ]);
  const [removedContext, setRemovedContext] = useState("No context removed.");

  const [applyDisabled, setApplyDisabled] = useState(false);
  const [applyAttempts, setApplyAttempts] = useState(0);
  const applyAttemptsRef = useRef(0);
  const [applyResult, setApplyResult] = useState("Change not applied.");
  const [rejectResult, setRejectResult] = useState("Change not rejected.");

  return <main style={{ margin: "0 auto", maxWidth: 1040, padding: 24, display: "grid", gap: 24 }}>
    <h1>Agent tools component contracts</h1>
    <button data-testid="toggle-agent-tools-theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      {resolvedTheme === "dark" ? "Use light theme" : "Use dark theme"}
    </button>

    <section aria-labelledby="agent-tools-recorder-heading" style={{ display: "grid", gap: 12 }}>
      <h2 id="agent-tools-recorder-heading">Voice recorder</h2>
      <button data-testid="toggle-voice-mounted" onClick={() => setVoiceMounted((value) => !value)}>
        {voiceMounted ? "Unmount recorder fixture" : "Mount recorder fixture"}
      </button>
      <button data-testid="toggle-voice-disabled" onClick={() => setVoiceDisabled((value) => !value)}>
        {voiceDisabled ? "Enable recorder fixture" : "Disable recorder fixture"}
      </button>
      {voiceMounted && <VoiceRecorder
          disabled={voiceDisabled}
          onAttach={async ({ blob, durationMs, mimeType }) => {
            const attempt = attachAttemptsRef.current + 1;
            attachAttemptsRef.current = attempt;
            setAttachAttempts(attempt);
            await new Promise((resolve) => setTimeout(resolve, 300));
            if (attempt === 1) {
              setVoiceResult("Attach failed. The recording is still available to retry.");
              throw new Error("Could not attach this recording. Try again.");
            }
            setVoiceResult(`Attached ${mimeType} audio (${blob.size} bytes, ${Math.round(durationMs)} ms).`);
          }}
        />}
      <output data-testid="voice-result">{voiceResult}</output>
      <output data-testid="voice-attempts">{attachAttempts}</output>
    </section>

    <section aria-labelledby="agent-tools-context-heading" style={{ display: "grid", gap: 12 }}>
      <h2 id="agent-tools-context-heading">Context tray</h2>
      <button data-testid="toggle-context-disabled" onClick={() => setContextDisabled((value) => !value)}>
        {contextDisabled ? "Enable context fixture" : "Disable context fixture"}
      </button>
      <ContextTray
        disabled={contextDisabled}
        items={contextItems}
        onRemove={(id) => {
          setContextItems((items) => items.filter((item) => item.id !== id));
          setRemovedContext(`Removed ${id}.`);
        }}
      />
      <output data-testid="context-result">{removedContext}</output>
    </section>

    <section aria-labelledby="agent-tools-review-heading" style={{ display: "grid", gap: 12 }}>
      <h2 id="agent-tools-review-heading">Review and apply</h2>
      <button data-testid="toggle-review-disabled" onClick={() => setApplyDisabled((value) => !value)}>
        {applyDisabled ? "Enable apply fixture" : "Disable apply fixture"}
      </button>
      <ReviewApplyCard
        title="Update the onboarding copy"
        before={"Welcome to the app.\nChoose a workspace."}
        after={"Start with your team's workspace.\nYou can invite collaborators later."}
        scope="Only the onboarding screen will change."
        disabled={applyDisabled}
        onApply={async () => {
          const attempt = applyAttemptsRef.current + 1;
          applyAttemptsRef.current = attempt;
          setApplyAttempts(attempt);
          await new Promise((resolve) => setTimeout(resolve, 450));
          if (attempt === 1) {
            setApplyResult("Apply failed. The proposed change is still available to retry.");
            throw new Error("Could not apply the proposed change. Try again.");
          }
          setApplyResult("Applied after retry.");
        }}
        onReject={() => setRejectResult("Change rejected.")}
      />
      <output data-testid="apply-result">{applyResult}</output>
      <output data-testid="apply-attempts">{applyAttempts}</output>
      <output data-testid="reject-result">{rejectResult}</output>
    </section>
  </main>;
}

const meta = {
  title: "Foundation/Agent tools",
  component: AgentToolsHarness,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <ThemeProvider attribute="class" defaultTheme="light"><Story /></ThemeProvider>],
} satisfies Meta<typeof AgentToolsHarness>;

export default meta;
type Story = StoryObj<typeof meta>;
export const AllStates: Story = {};
