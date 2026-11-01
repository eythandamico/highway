"use client";
import { CustomerProfile } from "./customer-profile";
import { useSearchParams } from "next/navigation";
import { RecordLink } from "./record-link";
import { cad } from "../../lib/yardwork/business-documents";
import { customerAccount } from "../../lib/yardwork/customer-account";
import { useRememberedState } from "./page-memory";
import { AccountAvatar } from "./account-avatar";
import { useMemo, useState } from "react";
import { Plus, ArrowUpRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { useOffice } from "./context";
import {
  Heading,
  Button,
  Status,
  SearchField,
  Empty,
  FormDialog,
  Modal,
  Textarea,
  customerFields,
  Confirm,
} from "./shared";
import {
  customerFollowups,
  type FollowupSuggestion,
} from "../../lib/yardwork/customer-followups";
import { dateLabel, type Customer } from "../../lib/yardwork/yardwork";
export default function Customers() {
  const params = useSearchParams();
  const { state, mutate } = useOffice(),
    [search, setSearch] = useRememberedState("customers.search", ""),
    [page, setPage] = useRememberedState("customers.page", 1),
    [editing, setEditing] = useState<Customer | "new" | null>(null),
    [selected, setSelected] = useState<string | null>(() => params.get("attention") === "customer" ? params.get("record") : null),
    [followup, setFollowup] = useState<{
      customer: Customer;
      suggestion: FollowupSuggestion;
    } | null>(null),
    [permission, setPermission] = useState<Customer | null>(null);
  const filtered = useMemo(
      () =>
        state.customers.filter((c) =>
          `${c.name} ${c.area} ${c.address} ${c.email}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      [state.customers, search],
    ),
    customer = state.customers.find((c) => c.id === selected),
    account = customer ? customerAccount(state, customer.id) : null,
    visible = filtered.slice((page - 1) * 30, page * 30);
  return (
    <>
      <Heading
        title="Customers"
        description={`${state.customers.length} relationships, and the details that make good service personal.`}
      >
        <Button onClick={() => setEditing("new")}>
          <Plus size={17} />
          Add customer
        </Button>
      </Heading>
      <div className="yw-toolbar">
        <SearchField
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search names, properties or neighbourhoods"
        />
        <Status>{filtered.length} {filtered.length === 1 ? "customer" : "customers"}</Status>
      </div>
      {visible.length ? (
        visible.map((c) => {
          const reminders = customerFollowups(state, c);
          return (
            <div className="yw-row yw-customer-row" key={c.id}>
              <AccountAvatar identity={`yardwork:customer:${c.id}`} />
              <div className="yw-row-main">
                <button
                  className="yw-row-link"
                  onClick={() => setSelected(c.id)}
                >
                  <h3>{c.name}</h3>
                  <p>{c.address}</p>
                  <small>
                    {c.area} · {c.recurring}
                  </small>
                </button>
              </div>
              <div className="yw-actions">
                {reminders.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setFollowup({ customer: c, suggestion: reminders[0] })
                    }
                  >
                    Check in
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Open ${c.name}`}
                  onClick={() => setSelected(c.id)}
                >
                  <ArrowUpRight size={18} />
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <Empty
          title={
            search
              ? "No matching customers."
              : "Every good job starts with a customer."
          }
          action={
            !search && (
              <Button onClick={() => setEditing("new")}>
                Add your first customer
              </Button>
            )
          }
        >
          {search
            ? "Try a name or a nearby street."
            : "Keep contact details, property instructions and visit history together."}
        </Empty>
      )}
      {filtered.length > 30 && (
        <div className="yw-pager">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {Math.ceil(filtered.length / 30)}
          </span>
          <Button
            variant="secondary"
            disabled={page * 30 >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
      {customer && (
        <Modal
          title="Customer overview"
          sidebar={<CustomerProfile customerId={customer.id} current />}
          description={customer.address}
          open
          onClose={() => setSelected(null)}
        >
          <div className="yw-actions">
            <Button
              onClick={() => {
                setSelected(null);
                setEditing(customer);
              }}
            >
              Edit details
            </Button>
          </div>
          <div className="yw-row">
            <div className="yw-row-main">
              <h3>Offer text permission</h3>
              <p>
                {customer.outreachPermission?.allowed
                  ? "Permission recorded for this phone number."
                  : "No offer permission recorded."}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setPermission(customer);
                setSelected(null);
              }}
            >
              Update
            </Button>
          </div>
          <h2>Follow-up reminders</h2>
          {customerFollowups(state, customer).map((s) => (
            <div className="yw-row" key={s.key}>
              <div className="yw-row-main">
                <h3>{s.title}</h3>
                <p>{s.reason}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelected(null);
                  setFollowup({ customer, suggestion: s });
                }}
              >
                Review
              </Button>
            </div>
          ))}
          {account && <>
            <h2>Work & money</h2>
            <h3>Visits</h3>
            {account.jobs.map(j => <div className="yw-row" key={j.id}>
              <div className="yw-row-main"><h3>{j.service}</h3><p>{dateLabel(j.date)} · {j.status.replace("-", " ")}</p></div>
              <RecordLink kind="job" id={j.id}>View visit</RecordLink>
            </div>)}
            {!account.jobs.length && <p className="muted">No recorded visits yet.</p>}
            <h3>Invoices</h3>
            {account.invoices.map(i => <div className="yw-row" key={i.id}>
              <div className="yw-row-main"><h3>{i.service}</h3><p>{cad(i.amount + i.tax)} · {i.status} · due {dateLabel(i.due)}</p></div>
              <RecordLink kind="invoice" id={i.id}>View invoice</RecordLink>
            </div>)}
            {!account.invoices.length && <p className="muted">No invoices yet. Completing a visit creates its invoice.</p>}
            <h3>Quotes & requests</h3>
            {account.quotes.map(q => <div className="yw-row" key={q.id}><div className="yw-row-main"><h3>{q.service}</h3><p>Quote · {q.status}</p></div><RecordLink kind="quote" id={q.id}>View quote</RecordLink></div>)}
            {account.requests.map(l => <div className="yw-row" key={l.id}><div className="yw-row-main"><h3>{l.service}</h3><p>Request · {l.status}</p></div><RecordLink kind="lead" id={l.id}>View request</RecordLink></div>)}
            {!account.quotes.length && !account.requests.length && <p className="muted">No quotes or requests yet.</p>}
          </>}
        </Modal>
      )}
      {editing && (
        <FormDialog
          title={editing === "new" ? "Add customer" : "Edit customer"}
          fields={customerFields}
          initial={
            editing === "new"
              ? {
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  area: "",
                  notes: "",
                  recurring: "As needed",
                }
              : editing
          }
          onSave={(values) => mutate("customer", values)}
          onClose={() => setEditing(null)}
        />
      )}
      {followup && (
        <Followup
          customer={followup.customer}
          suggestion={followup.suggestion}
          onClose={() => setFollowup(null)}
        />
      )}
      {permission && (
        <Confirm
          title={
            permission.outreachPermission?.allowed
              ? "Revoke offer permission?"
              : "Record offer permission?"
          }
          description={
            permission.outreachPermission?.allowed
              ? "This customer will no longer be eligible for offer texts."
              : "Only record this after the customer has explicitly agreed to receive service offers at their current mobile number. Saving permission does not send a message."
          }
          label={
            permission.outreachPermission?.allowed
              ? "Revoke permission"
              : "Record permission"
          }
          onConfirm={() =>
            mutate("outreach-permission", {
              id: permission.id,
              allowed: !permission.outreachPermission?.allowed,
            })
          }
          onClose={() => setPermission(null)}
        />
      )}
    </>
  );
}
function Followup({
  customer,
  suggestion,
  onClose,
}: {
  customer: Customer;
  suggestion: FollowupSuggestion;
  onClose: () => void;
}) {
  const { state, mutate, busy } = useOffice(),
    [text, setText] = useState(
      state.customerFollowups?.find(
        (f) => f.customerId === customer.id && f.key === suggestion.key,
      )?.body || suggestion.body,
    ),
    [error, setError] = useState("");
  async function save(
    action:
      | "customer-followup-save"
      | "customer-followup-done"
      | "customer-followup-snooze",
  ) {
    try {
      await mutate(action, {
        customerId: customer.id,
        key: suggestion.key,
        sourceBody: suggestion.body,
        ...(action === "customer-followup-snooze" ? {} : { body: text }),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }
  return (
    <Modal
      title={suggestion.title}
      description={`${customer.name} · ${suggestion.reason}`}
      open
      onClose={onClose}
    >
      <label className="yw-field">
        Message draft
        <Textarea
          rows={7}
          value={text}
          maxLength={1500}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <p className="muted">
        Review and send this message yourself. These reminders never send
        automatically.
      </p>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="yw-actions">
        <Button
          disabled={busy}
          onClick={() => void save("customer-followup-save")}
        >
          Save draft
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              toast.success("Copied");
            } catch {
              toast.error("Select and copy the draft manually.");
            }
          }}
        >
          <Copy size={16} />
          Copy
        </Button>
        <Button
          disabled={busy}
          variant="ghost"
          onClick={() => void save("customer-followup-snooze")}
        >
          Snooze 7 days
        </Button>
        <Button
          disabled={busy}
          variant="ghost"
          onClick={() => void save("customer-followup-done")}
        >
          Mark followed up
        </Button>
      </div>
    </Modal>
  );
}
