"use client";
import { CustomerProfile } from "./customer-profile";
import { RecordLink } from "./record-link";
import { RequestReview } from "./request-review";
import { useRememberedState } from "./page-memory";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useOffice } from "./context";
import {
  Heading,
  Button,
  Status,
  Empty,
  Tabs,
  FormDialog,
  Modal,
  Textarea,
} from "./shared";
export default function Inbox() {
  const params = useSearchParams();
  const { state, mutate, busy } = useOffice(),
    [filter, setFilter] = useRememberedState("inbox.filter", "open"),
    [request, setRequest] = useState(false),
    [selected, setSelected] = useState<string | null>(() => params.get("attention") === "lead" ? params.get("record") : null),
    [reply, setReply] = useState(""),
    [error, setError] = useState("");
  const leads = state.leads.filter(
      (l) => filter === "all" || l.status !== "booked",
    ),
    lead = state.leads.find((l) => l.id === selected);
  return (
    <>
      <Heading
        title="Inbox"
        description="Requests, conversations and the next piece of work."
      >
        <Button
          disabled={!state.customers.length}
          onClick={() => setRequest(true)}
        >
          <Plus size={17} />
          Record request
        </Button>
      </Heading>
      <Tabs
        value={filter}
        onChange={setFilter}
        items={[
          { value: "open", label: "Open requests" },
          { value: "all", label: "All requests" },
        ]}
      />
      {leads.length ? (
        leads.map((l) => (
          <div className="yw-row" key={l.id}>
            <div className="yw-row-main">
              <button
                className="yw-row-link"
                onClick={() => {
                  setSelected(l.id);
                  setReply("");
                }}
              >
                <h3>
                  {state.customers.find((c) => c.id === l.customerId)?.name} ·{" "}
                  {l.service}
                </h3>
                <p>{l.messages.at(-1)?.text || l.message}</p>
              </button>
            </div>
            <Status
              tone={
                l.status === "new"
                  ? "warning"
                  : l.status === "booked"
                    ? "good"
                    : "neutral"
              }
            >
              {l.status}
            </Status>
          </div>
        ))
      ) : (
        <Empty title="You’re all caught up.">
          Record customer requests here. Yardwork prepares a quote draft from
          your service pricing for office review.
        </Empty>
      )}
      {request && (
        <FormDialog
          title="Record a customer request"
          description="Quotes are prepared as drafts. Review the scope and price in Money before sharing."
          fields={[
            {
              name: "customerId",
              label: "Customer",
              options: state.customers.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            },
            {
              name: "service",
              label: "Service",
              options: state.rates.map((r) => ({
                value: r.service,
                label: r.service,
              })),
            },
            { name: "message", label: "Customer request", type: "textarea" },
          ]}
          initial={{
            customerId: state.customers[0]?.id,
            service: state.rates[0]?.service,
            message: "",
          }}
          onSave={(values) => mutate("request", values)}
          onClose={() => setRequest(false)}
        />
      )}
      {lead && (
        <Modal
          title={
            state.customers.find((c) => c.id === lead.customerId)?.name ||
            "Request"
          }
          sidebar={<CustomerProfile customerId={lead.customerId} />}
          description={lead.service}
          open
          onClose={() => setSelected(null)}
        >
          <div className="yw-actions">
            {state.quotes.filter(q => q.leadId === lead.id && q.customerId === lead.customerId).map(q => <RecordLink kind="quote" id={q.id} key={q.id}>Review quote</RecordLink>)}
          </div>
          <RequestReview key={lead.id} leadId={lead.id} customerId={lead.customerId}/>
          <div className="yw-chat-log">
            {lead.messages.map((m, i) => (
              <div
                key={i}
                className={`yw-message ${m.from === "office" ? "yw-message-user" : ""}`}
              >
                <small className="muted">
                  {m.from === "office" ? "Office draft" : "Customer request"}
                </small>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <Status>{lead.status}</Status>
          <p className="muted">
            Office replies are saved drafts for manual sending. Quotes are
            reviewed in Money.
          </p>
          <label className="yw-field">
            Reply draft
            <Textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={4000}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <Button
            disabled={busy || !reply.trim()}
            onClick={async () => {
              try {
                await mutate("reply", { id: lead.id, text: reply });
                setReply("");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not save.");
              }
            }}
          >
            Save reply draft
          </Button>
        </Modal>
      )}
    </>
  );
}
