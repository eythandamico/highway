"use client";
import { useRememberedState } from "./page-memory";
import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useOffice } from "./context";
import {
  Heading,
  Button,
  Status,
  Tabs,
  Empty,
  Modal,
  FormDialog,
  Confirm,
} from "./shared";
import { dateLabel, timeLabel } from "@/lib/yardwork/yardwork";
import { automationPreferences } from "@/lib/yardwork/office-automations";
export default function Activity() {
  const { state, mutate, demo, busy } = useOffice(),
    [tab, setTab] = useRememberedState("activity.tab", "updates"),
    [reply, setReply] = useState<string | null>(null),
    [cancel, setCancel] = useState<string | null>(null),
    [task, setTask] = useState<string | null>(null);
  const prefs = automationPreferences(state.automationPreferences),
    selected = state.automationTasks?.find((t) => t.id === task),
    bookings = state.bookingApprovals || [];
  return (
    <>
      <Heading
        title="Activity"
        description="Decisions, updates and follow-ups in one place."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "updates", label: "Updates" },
          { value: "approvals", label: "Appointment approvals" },
          { value: "followups", label: "Follow-up drafts" },
        ]}
      />
      {tab === "updates" ? (
        state.activity.length ? (
          state.activity.map((a) => (
            <div className="yw-row" key={a.id}>
              <div className="yw-row-main">
                <h3>{a.text}</h3>
                <p>
                  {new Date(a.time).toLocaleString("en-CA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "America/Toronto",
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <Empty title="A fresh start.">
            Saved changes and business updates will appear here.
          </Empty>
        )
      ) : tab === "approvals" ? (
        bookings.length ? (
          bookings.map((b) => (
            <div className="yw-row" key={b.id}>
              <div className="yw-row-main">
                <h3>
                  {b.customerName} · {b.service}
                </h3>
                <p>
                  {dateLabel(b.date)} at {timeLabel(b.time)} · {b.crew}
                </p>
                <p>
                  {b.reason ||
                    b.responseText ||
                    "Waiting for the customer to respond."}
                </p>
                <small>
                  {b.sendStatus === "accepted"
                    ? "Accepted by SMS provider"
                    : b.sendStatus}
                </small>
              </div>
              <div className="yw-actions">
                <Status
                  tone={
                    b.decision === "approved"
                      ? "good"
                      : b.decision === "conflict"
                        ? "bad"
                        : "neutral"
                  }
                >
                  {b.decision}
                </Status>
                {b.unread && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void mutate("booking-read", { id: b.id }).catch(() => {})
                    }
                  >
                    Mark read
                  </Button>
                )}
                {b.decision === "pending" && (
                  <>
                    {demo && (
                      <Button
                        variant="secondary"
                        onClick={() => setReply(b.id)}
                      >
                        Simulate reply
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => setCancel(b.id)}>
                      Cancel request
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <Empty title="No appointment requests yet.">
            Review a quote in Money, then propose a date and crew. A verified
            approval books the visit.
          </Empty>
        )
      ) : (
        <>
          <div className="yw-note stack">
            <h2>Prepare helpful reminders</h2>
            <p>
              These rules create drafts while the app is open. Nothing is sent
              automatically.
            </p>
            <div className="yw-checklist">
              {(["invoiceFollowUps", "quoteFollowUps"] as const).map((rule) => (
                <label key={rule}>
                  <input
                    type="checkbox"
                    checked={prefs[rule]}
                    disabled={busy}
                    onChange={(e) =>
                      void mutate("automation-setting", {
                        rule,
                        enabled: e.target.checked,
                      }).catch(() => {})
                    }
                  />
                  {rule === "invoiceFollowUps"
                    ? "Overdue invoice reminders"
                    : "Pending quote reminders"}
                </label>
              ))}
            </div>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void mutate("automation-run", {}).catch(() => {})}
            >
              <RefreshCw size={16} />
              Check for drafts
            </Button>
          </div>
          {state.automationTasks
            ?.filter((t) => t.status === "pending")
            .map((t) => (
              <div className="yw-row" key={t.id}>
                <div className="yw-row-main">
                  <h3>{t.customerName}</h3>
                  <p>{t.sourceLabel}</p>
                </div>
                <Button variant="secondary" onClick={() => setTask(t.id)}>
                  Review draft
                </Button>
              </div>
            ))}
        </>
      )}
      {reply && (
        <FormDialog
          title="Simulate a customer text"
          description="Demo only. Try YES followed by the displayed code to approve, or NO and the code to decline."
          fields={[{ name: "text", label: "Customer response" }]}
          initial={{
            text: `YES ${bookings.find((b) => b.id === reply)?.code}`,
          }}
          onSave={(v) => mutate("preview-booking-reply", { id: reply, ...v })}
          onClose={() => setReply(null)}
        />
      )}
      {cancel && (
        <Confirm
          title="Cancel this appointment request?"
          description="The pending request will be cancelled. No job will be booked from it."
          onConfirm={() => mutate("booking-cancel", { id: cancel })}
          onClose={() => setCancel(null)}
        />
      )}
      {selected && (
        <Modal
          title={selected.subject}
          description={`${selected.customerName} · ${selected.recipient}`}
          open
          onClose={() => setTask(null)}
        >
          <div className="yw-note">{selected.body}</div>
          <div className="yw-actions">
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(selected.body);
                  toast.success("Draft copied");
                } catch {
                  toast.error("Copy the draft manually.");
                }
              }}
            >
              <Copy size={16} />
              Copy draft
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await mutate("automation-resolve", {
                    id: selected.id,
                    status: "handled",
                  });
                  setTask(null);
                } catch {}
              }}
            >
              Mark handled
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  await mutate("automation-resolve", {
                    id: selected.id,
                    status: "dismissed",
                  });
                  setTask(null);
                } catch {}
              }}
            >
              Dismiss
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
