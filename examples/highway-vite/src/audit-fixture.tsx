import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import {
  ActionButton,
  BottomSheet,
  Button,
  ButtonGroup,
  Combobox,
  CommandPalette,
  CopyButton,
  DateRangePicker,
  Dropdown,
  ExpandCard,
  FilterToolbar,
  HighwayTheme,
  InlineEdit,
  MultiSelect,
  NumberInput,
  ProfileMenu,
  Progress,
  SliderInput,
  Select,
  SplitButton,
  SplitPane,
  Table,
  Tabs,
  ToastProvider,
  VoiceRecorder,
  ContextTray,
  ReviewApplyCard,
  Dialog,
  Modal,
  Row,
  SearchBar,
  SearchToggle,
  Stack,
  useToast,
  WorkspaceSwitcher,
} from "@highway/react";
import type { ContextItem, VoiceRecording } from "@highway/react";
import "@highway/styles/styles.css";
import "./host.css";

declare global {
  interface Window {
    __highwayAuditNumberChanges?: number;
    __highwayCompletePendingCommand?: () => void;
  }
}

const initialAgentContext: ContextItem[] = [
  {
    id: "brief",
    label: "Package product brief",
    description: "A context item supplied by the installed consumer fixture.",
    content: <p>Host-controlled context remains inspectable and removable.</p>,
  },
];

function AuditToastControls() {
  const { addToast } = useToast();
  return (
    <section aria-label="Toast timer controls" data-testid="audit-toast-controls">
      <button type="button" onClick={() => addToast("Persistent toast", { message: "This notification has no timer.", duration: 0 })}>
        Show persistent toast
      </button>
      <button type="button" onClick={() => addToast("Timed toast", { message: "Focus pauses its timer.", duration: 5000 })}>
        Show timed toast
      </button>
    </section>
  );
}

function AuditFixture() {
  const actionResolution = useRef<(() => void) | null>(null);
  const inlineResolution = useRef<(() => void) | null>(null);
  const splitResolution = useRef<(() => void) | null>(null);
  const commandResolution = useRef<(() => void) | null>(null);
  const [number, setNumber] = useState(5);
  const [numberDisabled, setNumberDisabled] = useState(false);
  const [numberMounted, setNumberMounted] = useState(true);
  const [slider, setSlider] = useState(3);
  const [decimalSlider, setDecimalSlider] = useState(0.15);
  const [sliderMounted, setSliderMounted] = useState(true);
  const [splitMounted, setSplitMounted] = useState(true);
  const [activeTab, setActiveTab] = useState('overview"quoted');
  const [pageSheetOpen, setPageSheetOpen] = useState(false);
  const [nestedSheetOpen, setNestedSheetOpen] = useState(false);
  const [unmountSheetOwner, setUnmountSheetOwner] = useState(true);
  const [menuActions, setMenuActions] = useState<string[]>([]);
  const [expandActionCount, setExpandActionCount] = useState(0);
  const [actionFail, setActionFail] = useState(false);
  const [actionCalls, setActionCalls] = useState(0);
  const [actionErrors, setActionErrors] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Array<string | number>>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([]);
  const [channel, setChannel] = useState("email");
  const [region, setRegion] = useState("north");
  const [segments, setSegments] = useState<string[]>([]);
  const [combinedSegments, setCombinedSegments] = useState<string[]>([]);
  const [staticSearchValue, setStaticSearchValue] = useState("");
  const [searchBarValue, setSearchBarValue] = useState("");
  const [searchToggleValue, setSearchToggleValue] = useState("");
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("Apollo project");
  const [inlineEditFail, setInlineEditFail] = useState(true);
  const [inlineSaveCalls, setInlineSaveCalls] = useState(0);
  const [dateRange, setDateRange] = useState({ from: "2026-05-20", to: "2026-05-10" });
  const [splitFail, setSplitFail] = useState(true);
  const [splitCalls, setSplitCalls] = useState(0);
  const [splitErrors, setSplitErrors] = useState(0);
  const [copyErrors, setCopyErrors] = useState(0);
  const [copySuccesses, setCopySuccesses] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandFailuresRemaining, setCommandFailuresRemaining] = useState(1);
  const [commandCalls, setCommandCalls] = useState(0);
  const [commandErrors, setCommandErrors] = useState(0);
  const [slotButtonPending, setSlotButtonPending] = useState(false);
  const [slotButtonCalls, setSlotButtonCalls] = useState(0);
  const [filterClearCount, setFilterClearCount] = useState(0);
  const [recordingAttempts, setRecordingAttempts] = useState(0);
  const recordingAttemptsRef = useRef(0);
  const [recordingResult, setRecordingResult] = useState("No package recording attached.");
  const [agentContext, setAgentContext] = useState(initialAgentContext);
  const [contextResult, setContextResult] = useState("No context removed.");
  const [reviewAttempts, setReviewAttempts] = useState(0);
  const reviewAttemptsRef = useRef(0);
  const [reviewResult, setReviewResult] = useState("No package proposal applied.");
  const [reviewRejectResult, setReviewRejectResult] = useState("No package proposal rejected.");
  const pageTarget = document.getElementById('page-target') ?? undefined;
  const sheetMount = document.getElementById('sheet-mount');

  function recordMenuAction(action: string) {
    setMenuActions((actions) => [...actions, action]);
  }

  function changeNumber(next: number) {
    window.__highwayAuditNumberChanges = (window.__highwayAuditNumberChanges ?? 0) + 1;
    setNumber(next);
  }

  return (
    <HighwayTheme>
      <ToastProvider>
      <AuditToastControls />
      <main className="example-layout" data-testid="audit-fixture">
        <h1>Highway package behavior audit</h1>

        <section aria-label="Checkbox marks" data-testid="audit-checkbox-marks">
          <h2>Checkbox marks</h2>
          <Table
            columns={[{ key: "name", label: "Project" }]}
            data={[
              { id: "cedar", name: "Cedar" },
              { id: "aspen", name: "Aspen" },
            ]}
            selectable
            rowKey="id"
            defaultSelectedKeys={["cedar"]}
          />
        </section>

        <section aria-label="Menu controls" data-testid="audit-menus">
          <h2>Menus</h2>
          <div className="example-controls">
            <Dropdown
              items={[
                { label: "Dropdown first", onAction: () => recordMenuAction("Dropdown first") },
                { label: "Dropdown second", onAction: () => recordMenuAction("Dropdown second") },
                { label: "Dropdown third", onAction: () => recordMenuAction("Dropdown third") },
              ]}
            />
            <Dropdown trigger={<button type="button" aria-label="Empty menu">Empty menu</button>} items={[]} />
            <ProfileMenu
              avatarUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%234055d8'/%3E%3C/svg%3E"
              profile={{ name: "Taylor Example", email: "taylor@example.test" }}
              profileItems={[
                { label: "Profile first", icon: "user", onAction: () => recordMenuAction("Profile first") },
                { label: "Profile second", icon: "settings", onAction: () => recordMenuAction("Profile second") },
                { label: "Profile third", icon: "help", onAction: () => recordMenuAction("Profile third") },
              ]}
            />
            <WorkspaceSwitcher
              currentStartup={{ slug: "north", name: "North startup", initials: "NS", color: "#4055d8" }}
              startups={[
                { slug: "north", name: "North startup", initials: "NS", color: "#4055d8" },
                { slug: "south", name: "South startup", initials: "SS", color: "#157363" },
                { slug: "west", name: "West startup", initials: "WS", color: "#8c5418" },
              ]}
              onStartupChange={(slug) => recordMenuAction(`Startup ${slug}`)}
            />
            <button type="button" data-testid="after-menus">After menus</button>
          </div>
          <output data-testid="menu-actions">{menuActions.join(", ")}</output>
        </section>

        <section aria-label="Number input" data-testid="audit-number">
          <h2>Number input</h2>
          {numberMounted && (
            <NumberInput label="Quantity" value={number} onChange={changeNumber} min={0} max={100} step={1} disabled={numberDisabled} />
          )}
          <output data-testid="number-value">{number}</output>
          <div className="example-controls">
            <button type="button" onClick={() => setNumberDisabled((value) => !value)}>Toggle number disabled</button>
            <button type="button" onClick={() => setNumberMounted(false)}>Unmount number input</button>
          </div>
        </section>

        <section aria-label="Slider and split controls" data-testid="audit-ranges">
          <h2>Slider input</h2>
          {sliderMounted && (
            <>
              <SliderInput label="Range" value={slider} onChange={setSlider} min={3} max={13} step={5} />
              <output data-testid="slider-value">{slider}</output>
              <SliderInput label="Decimal range" value={decimalSlider} onChange={setDecimalSlider} min={0.15} max={0.55} step={0.1} />
              <output data-testid="decimal-slider-value">{decimalSlider}</output>
            </>
          )}
          <output data-testid="range-values">{slider}|{decimalSlider}</output>
          <button type="button" onClick={() => setSliderMounted(false)}>Unmount sliders</button>
          <h2>Split pane</h2>
          {splitMounted && (
            <SplitPane
              defaultSplit={50}
              minSize={20}
              height="220px"
              left={<div data-testid="left-pane">Left pane</div>}
              right={<div data-testid="right-pane">Right pane</div>}
            />
          )}
          <button type="button" onClick={() => setSplitMounted(false)}>Unmount split pane</button>
        </section>

        <section aria-label="Tabs and progress" data-testid="audit-tabs-progress">
          <h2>Tabs and progress</h2>
          <Tabs
            tabs={[
              { id: 'overview"quoted', label: "Overview" },
              { id: "details", label: "Details" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <output data-testid="active-tab">{activeTab}</output>
          <Progress value={5} max={10} label="Upload progress" showValue animated />
        </section>

        <section aria-label="Expandable card motion" data-testid="audit-expand-card">
          <h2>Expandable card motion</h2>
          <ExpandCard title="Expansion details" icon="chevron-right">
            <p>Content can change while the card remains expanded.</p>
            <button type="button" data-testid="expand-card-action" onClick={() => setExpandActionCount((count) => count + 1)}>Add detail</button>
            {expandActionCount > 0 && <p data-testid="expanded-detail">Added detail {expandActionCount}</p>}
          </ExpandCard>
          <output data-testid="expand-action-count">{expandActionCount}</output>
        </section>

        <section aria-label="Async action" data-testid="audit-action-button">
          <h2>Async action</h2>
          <button type="button" onClick={() => setActionFail((value) => !value)}>
            {actionFail ? "Allow archive" : "Fail archive"}
          </button>
          <button type="button" onClick={() => actionResolution.current?.()}>Complete pending archive</button>
          <ActionButton
            label="Archive record"
            pendingLabel="Archiving record"
            successLabel="Record archived"
            errorLabel="Archive failed. Try again."
            resetAfterMs={0}
            onAction={async () => {
              setActionCalls((count) => count + 1);
              await new Promise<void>((resolve) => { actionResolution.current = resolve; });
              actionResolution.current = null;
              if (actionFail) throw new Error("Example archive failure");
            }}
            onActionError={() => setActionErrors((count) => count + 1)}
          />
          <output data-testid="action-call-count">{actionCalls}</output>
          <output data-testid="action-error-count">{actionErrors}</output>
        </section>

        <section aria-label="Sortable table" data-testid="audit-table">
          <h2>Sortable table</h2>
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "score", label: "Score", align: "right" },
            ]}
            data={[
              { id: "cedar", name: "Cedar", score: 30 },
              { id: "aspen", name: "Aspen", score: 10 },
              { id: "birch", name: "Birch", score: 20 },
            ]}
            selectable
            rowKey="id"
            selectedKeys={selectedRows}
            onSelectedKeysChange={setSelectedRows}
            onSelectionChange={setSelectedRowIndices}
          />
          <output data-testid="selected-row-ids">{selectedRows.join(",")}</output>
          <output data-testid="selected-row-indices">{selectedRowIndices.join(",")}</output>
        </section>

        <section aria-label="Keyboard select" data-testid="audit-select">
          <h2>Keyboard select</h2>
          <Select
            label="Notification channel"
            value={channel}
            onChange={setChannel}
            options={[
              { id: "email", label: "Email" },
              { id: "voice", label: "Voice call", disabled: true },
              { id: "push", label: "Push notification" },
              { id: "sms", label: "SMS" },
            ]}
          />
          <output data-testid="channel-value">{channel}</output>
        </section>

        <section aria-label="Searchable choices" data-testid="audit-choice-pickers">
          <h2>Searchable choices</h2>
          <Combobox
            label="Region"
            value={region}
            onValueChange={setRegion}
            options={[
              { value: "north", label: "North" },
              { value: "northwind", label: "Northwind", disabled: true },
              { value: "northstar", label: "Northstar Enterprise Region for Shared Projects and Accounts" },
              { value: "south", label: "South" },
            ]}
          />
          <output data-testid="region-value">{region}</output>
          <MultiSelect
            label="Segments"
            value={segments}
            onValueChange={setSegments}
            options={[
              { value: "reports", label: "Reports" },
              { value: "private-reports", label: "Private reports", disabled: true },
              { value: "revenue-report", label: "Revenue report" },
              { value: "long-revenue-report", label: "Quarterly revenue report for distributed teams and finance reviewers" },
              { value: "finance", label: "Finance" },
            ]}
          />
          <output data-testid="segment-values">{segments.join(",")}</output>
          <Combobox
            multiple
            label="Combined segments"
            value={combinedSegments}
            onValueChange={setCombinedSegments}
            options={[
              { value: "reports", label: "Reports" },
              { value: "revenue-report", label: "Revenue report" },
              { value: "finance", label: "Finance" },
            ]}
          />
          <output data-testid="combined-segment-values">{combinedSegments.join(",")}</output>
        </section>

        <section aria-label="Search and layout family" data-testid="audit-search-layout-family">
          <h2>Search and layout family</h2>
          <SearchBar placeholder="Search static projects" onSearch={setStaticSearchValue} />
          <output data-testid="static-search-value">{staticSearchValue}</output>
          <SearchBar expandable placeholder="Search projects" onSearch={setSearchBarValue} />
          <output data-testid="search-bar-value">{searchBarValue}</output>
          <SearchToggle placeholder="Search legacy projects" onSearch={setSearchToggleValue} />
          <output data-testid="search-toggle-value">{searchToggleValue}</output>
          <Stack data-testid="horizontal-stack" direction="horizontal" gap="sm" align="start">
            <span>Stack first</span><span>Stack second</span>
          </Stack>
          <Stack data-testid="vertical-stack" gap="sm">
            <span>Vertical first</span><span>Vertical second</span>
          </Stack>
          <Row data-testid="legacy-row" gap="sm">
            <span>Row first</span><span>Row second</span>
          </Row>
          <Row data-testid="aligned-row" align="start" gap="sm">
            <span>Aligned first</span><span>Aligned second</span>
          </Row>
        </section>

        <section aria-label="Shared dialog family" data-testid="audit-dialog-family">
          <h2>Shared dialog family</h2>
          <button type="button" onClick={() => setFamilyDialogOpen(true)}>Open legacy dialog</button>
          <Dialog
            isOpen={familyDialogOpen}
            onClose={() => setFamilyDialogOpen(false)}
            title="Shared shell dialog"
            description="A composed content-light dialog."
            actions={<button type="button" onClick={() => setFamilyDialogOpen(false)}>Close shared shell dialog</button>}
          />
          <button type="button" onClick={() => setFamilyModalOpen(true)}>Open legacy modal</button>
          <Modal isOpen={familyModalOpen} onClose={() => setFamilyModalOpen(false)} title="Shared shell modal">
            <p>Modal content remains inside the shared dialog shell.</p>
          </Modal>
        </section>

        <section aria-label="Inline edit" data-testid="audit-inline-edit">
          <h2>Inline edit</h2>
          <button type="button" onClick={() => setInlineEditFail((value) => !value)}>
            {inlineEditFail ? "Allow project save" : "Fail project save"}
          </button>
          <button type="button" onClick={() => inlineResolution.current?.()}>Complete pending project save</button>
          <InlineEdit
            label="Project name"
            value={projectName}
            onSave={async (nextValue) => {
              setInlineSaveCalls((count) => count + 1);
              await new Promise<void>((resolve) => { inlineResolution.current = resolve; });
              inlineResolution.current = null;
              if (inlineEditFail) throw new Error("Example project save failure");
              setProjectName(nextValue);
            }}
          />
          <output data-testid="inline-save-count">{inlineSaveCalls}</output>
        </section>

        <section aria-label="Date range" data-testid="audit-date-range">
          <h2>Date range</h2>
          <DateRangePicker
            label="Booking window"
            value={dateRange}
            onValueChange={setDateRange}
            min="2026-05-01"
            max="2026-06-30"
            name="booking-window"
            presets={[{ label: "Invalid preset", value: { from: "2026-05-25", to: "2026-05-10" } }]}
          />
          <output data-testid="date-range-value">{dateRange.from}|{dateRange.to}</output>
        </section>

        <section aria-label="Action patterns" data-testid="audit-action-patterns">
          <h2>Action patterns</h2>
          <ButtonGroup label="Record actions">
            <Button type="button" variant="secondary">Review</Button>
            <Button type="button" variant="secondary">Duplicate</Button>
          </ButtonGroup>
          <FilterToolbar label="Current filters" activeCount={2} onClear={() => setFilterClearCount((count) => count + 1)}>
            <span>Status: open</span>
          </FilterToolbar>
          <output data-testid="filter-clear-count">{filterClearCount}</output>
          <button type="button" onClick={() => setSplitFail((value) => !value)}>
            {splitFail ? "Allow report creation" : "Fail report creation"}
          </button>
          <button type="button" onClick={() => splitResolution.current?.()}>Complete pending report creation</button>
          <SplitButton
            label="Create report"
            onAction={async () => {
              setSplitCalls((count) => count + 1);
              await new Promise<void>((resolve) => { splitResolution.current = resolve; });
              splitResolution.current = null;
              if (splitFail) throw new Error("Example report creation failure");
            }}
            onActionError={() => setSplitErrors((count) => count + 1)}
            actions={[{ id: "template", label: "Create from template", onAction: async () => undefined }]}
          />
          <output data-testid="split-action-count">{splitCalls}</output>
          <output data-testid="split-error-count">{splitErrors}</output>
          <CopyButton
            value="Quarterly report notes"
            onCopied={() => setCopySuccesses((count) => count + 1)}
            onCopyError={() => setCopyErrors((count) => count + 1)}
            data-testid="copy-notes"
          />
          <output data-testid="copy-error-count">{copyErrors}</output>
          <output data-testid="copy-success-count">{copySuccesses}</output>
          <Button asChild loading={slotButtonPending} onClick={() => setSlotButtonCalls((count) => count + 1)}>
            <a href="#slot-action">Publish report</a>
          </Button>
          <button type="button" onClick={() => setSlotButtonPending(true)}>Set publish pending</button>
          <output data-testid="slot-button-call-count">{slotButtonCalls}</output>
        </section>

        <section aria-label="Command palette" data-testid="audit-command-palette">
          <h2>Command palette</h2>
          <button type="button" onClick={() => setCommandOpen(true)}>Open commands</button>
          <CommandPalette
            open={commandOpen}
            onOpenChange={setCommandOpen}
            title="Project commands"
            items={[
              {
                value: "rebuild-index",
                label: "Rebuild search index",
                keywords: ["refresh", "search"],
                onSelect: async () => {
                  setCommandCalls((count) => count + 1);
                  await new Promise<void>((resolve) => {
                    commandResolution.current = resolve;
                    window.__highwayCompletePendingCommand = () => commandResolution.current?.();
                  });
                  commandResolution.current = null;
                  window.__highwayCompletePendingCommand = undefined;
                  if (commandFailuresRemaining > 0) {
                    setCommandFailuresRemaining((count) => count - 1);
                    throw new Error("Example command failure");
                  }
                },
              },
            ]}
            onActionError={() => setCommandErrors((count) => count + 1)}
          />
          <output data-testid="command-call-count">{commandCalls}</output>
          <output data-testid="command-error-count">{commandErrors}</output>
        </section>

        <section aria-label="Agent tools" data-testid="audit-agent-tools">
          <h2>Agent tools</h2>
          <VoiceRecorder
            label="Package voice note"
            onAttach={async (recording: VoiceRecording) => {
              const attempt = recordingAttemptsRef.current + 1;
              recordingAttemptsRef.current = attempt;
              setRecordingAttempts(attempt);
              await new Promise((resolve) => setTimeout(resolve, 100));
              if (attempt === 1) throw new Error("Package attach failed. Retry the recording.");
              setRecordingResult(`Attached ${recording.mimeType} (${recording.blob.size} bytes, ${Math.round(recording.durationMs)} ms).`);
            }}
          />
          <output data-testid="agent-recorder-result">{recordingResult}</output>
          <output data-testid="agent-recorder-attempts">{recordingAttempts}</output>
          <ContextTray
            label="Package context"
            items={agentContext}
            onRemove={(id) => {
              setAgentContext((items) => items.filter((item) => item.id !== id));
              setContextResult(`Removed ${id}.`);
            }}
          />
          <output data-testid="agent-context-result">{contextResult}</output>
          <ReviewApplyCard
            title="Package review proposal"
            scope="A change owned by the consuming application."
            before="Original package consumer text."
            after="Updated package consumer text."
            onApply={async () => {
              const attempt = reviewAttemptsRef.current + 1;
              reviewAttemptsRef.current = attempt;
              setReviewAttempts(attempt);
              await new Promise((resolve) => setTimeout(resolve, 100));
              if (attempt === 1) throw new Error("Package apply failed. Retry the proposal.");
              setReviewResult("Package proposal applied after retry.");
            }}
            onReject={() => setReviewRejectResult("Package proposal rejected.")}
          />
          <output data-testid="agent-review-result">{reviewResult}</output>
          <output data-testid="agent-review-attempts">{reviewAttempts}</output>
          <output data-testid="agent-review-reject-result">{reviewRejectResult}</output>
        </section>

        <section aria-label="Bottom sheet" data-testid="audit-sheet">
          <h2>Bottom sheet</h2>
          <div className="example-controls">
            <button type="button" onClick={() => setPageSheetOpen(true)}>Open page-target sheet</button>
            <button type="button" onClick={() => setNestedSheetOpen(true)}>Open nested sheet</button>
            <button type="button" onClick={() => setUnmountSheetOwner(false)}>Unmount sheet owner</button>
          </div>
        </section>
      </main>
      {sheetMount && createPortal(
        <HighwayTheme>
          {unmountSheetOwner ? (
            <>
              <BottomSheet isOpen={pageSheetOpen} onClose={() => setPageSheetOpen(false)} title="Page target sheet" pageTarget={pageTarget}>
                <p>The caller-owned sibling is an explicit transformation target.</p>
                <button type="button" onClick={() => setPageSheetOpen(false)}>Close page sheet</button>
                <button type="button" onClick={() => setNestedSheetOpen(true)}>Open nested sheet</button>
                <button type="button" onClick={() => setUnmountSheetOwner(false)}>Unmount sheet owner</button>
              </BottomSheet>
              <BottomSheet isOpen={nestedSheetOpen} onClose={() => setNestedSheetOpen(false)} title="Nested sheet">
                <p>This sheet uses the default page behavior.</p>
                <button type="button" onClick={() => setNestedSheetOpen(false)}>Close nested sheet</button>
              </BottomSheet>
            </>
          ) : null}
        </HighwayTheme>,
        sheetMount,
      )}
      </ToastProvider>
    </HighwayTheme>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Audit fixture root is missing");
createRoot(root).render(<AuditFixture />);
