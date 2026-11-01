"use client";
import { CustomerProfile } from "./customer-profile";
import { RecordLink } from "./record-link";
import { useRememberedState } from "./page-memory";
import { useSearchParams } from "next/navigation";
import BookingsChart from "./bookings-chart";
import { InvoicePayment } from "./invoice-payment";
import { useState, useEffect } from "react";
import { Plus, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { useOffice, type Snapshot } from "./context";
import {
  Heading,
  Button,
  Input,
  Textarea,
  Status,
  Empty,
  Tabs,
  Modal,
  Fields,
  Confirm,
  SearchField,
  RowMeta,
} from "./shared";
import {
  today,
  plusDay,
  dateLabel,
  money,
  type Quote,
} from "../../lib/yardwork/yardwork";
import {
  makeDocument,
  cad,
  quoteTotals,
  documentHash,
  createToken,
  type LineItem,
  type DocumentRecord,
} from "../../lib/yardwork/business-documents";
import {
  needsQuoteApproval,
  quoteReviewSnapshot,
} from "../../lib/yardwork/request-quotes";
import {
  prepareBooking,
  bookingSnapshot,
  type BookingInput,
} from "../../lib/yardwork/booking-approvals";
import { weeklyBookings, weeklyChange } from "../../lib/yardwork/money-growth";
import { DocumentPaper } from "./document";
export default function Money() {
  const params = useSearchParams();
  const { state, mutate } = useOffice(),
    [tab, setTab] = useRememberedState("money.tab", "quotes", params.get("attention") === "invoice" ? "invoices" : undefined),
    [search, setSearch] = useRememberedState("money.search", ""),
    [edit, setEdit] = useState<Quote | "new" | null>(null),
    [detail, setDetail] = useState<{
      id: string;
      kind: "quote" | "invoice";
    } | null>(() => { const kind = params.get("attention"), id = params.get("record"); return id && ((kind === "quote" && state.quotes.some(q => q.id === id)) || (kind === "invoice" && state.invoices.some(i => i.id === id))) ? { id, kind: kind as "quote" | "invoice" } : null; }),
    [paid, setPaid] = useState<string | null>(null);
  const quotes = state.quotes.filter((q) =>
      `${state.customers.find((c) => c.id === q.customerId)?.name} ${q.service}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    invoices = state.invoices.filter(
      (i) =>
        (tab === "paid" ? i.status === "paid" : i.status === "unpaid") &&
        `${state.customers.find((c) => c.id === i.customerId)?.name} ${i.service}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
  const weeks = weeklyBookings(state.jobs),
    current = weeks.at(-1)!,
    change = weeklyChange(current, weeks.at(-2)!);
  return (
    <>
      <Heading
        title="Money"
        description="From the first quote to the final payment."
      >
        <Button
          disabled={!state.customers.length}
          onClick={() => setEdit("new")}
        >
          <Plus size={17} />
          New quote
        </Button>
      </Heading>
      <BookingsChart jobs={state.jobs}/>
      <div aria-label="Invoice views">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "quotes", label: "Quotes" },
          { value: "invoices", label: "Unpaid invoices" },
          { value: "paid", label: "Paid archive" },
          { value: "growth", label: "Business growth" },
        ]}
      />
      </div>
      {tab === "growth" ? (
        <>
          <div className="yw-section-title">
            <h2>Six weeks of booked work</h2>
            <Status>
              {change.kind === "no-history"
                ? "No previous history"
                : `${change.delta! >= 0 ? "+" : ""}${cad(change.delta!)} vs last week`}
            </Status>
          </div>
          <div
            className="yw-chart"
            role="img"
            aria-label={weeks
              .map((w) => `${w.start}: ${cad(w.value)}`)
              .join("; ")}
          >
            {weeks.map((w) => (
              <div key={w.start} className="yw-chart-col">
                <span>{w.recorded ? money(w.value) : "—"}</span>
                <div
                  className="yw-chart-bar"
                  style={{
                    height: Math.max(
                      2,
                      (w.value / Math.max(1, ...weeks.map((x) => x.value))) *
                        90,
                    ),
                  }}
                />
                <span>
                  {dateLabel(w.start, { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
          <p className="muted">
            Booked work before tax, grouped by service date. This is not cash
            collected.
          </p>
        </>
      ) : (
        <>
          <div className="yw-toolbar">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search customer or service"
            />
          </div>
          {tab === "quotes" ? (
            quotes.length ? (
              quotes.map((q) => (
                <div className="yw-row yw-quote-row" key={q.id}>
                  <div className="yw-row-main">
                    <button
                      className="yw-row-link"
                      onClick={() => setDetail({ id: q.id, kind: "quote" })}
                    >
                      <h3>
                        {
                          state.customers.find((c) => c.id === q.customerId)
                            ?.name
                        }
                      </h3>
                      <p>
                        {q.service} · {q.documentNumber || "Quote"}
                      </p>
                    </button>
                  </div>
                  <RowMeta>
                    <strong>
                      {cad(quoteTotals(q, state.business.tax).total)}
                    </strong>
                      <Status
                        tone={
                          needsQuoteApproval(state, q)
                            ? "warning"
                            : q.status === "accepted"
                              ? "good"
                              : "neutral"
                        }
                      >
                        {needsQuoteApproval(state, q)
                          ? "Needs review"
                          : q.status === "accepted"
                            ? "Booked"
                            : state.quoteDeliveries?.find(
                                (d) => d.entityId === q.id,
                              )?.decision || "Draft"}
                      </Status>
                  </RowMeta>
                </div>
              ))
            ) : (
              <Empty title="Put good work in writing.">
                Add a customer, then create an itemized quote. Customer requests
                also prepare drafts here.
              </Empty>
            )
          ) : invoices.length ? (
            invoices.map((i) => (
              <div className="yw-row" key={i.id}>
                <div className="yw-row-main">
                  <button
                    className="yw-row-link"
                    onClick={() => setDetail({ id: i.id, kind: "invoice" })}
                  >
                    <h3>
                      {state.customers.find((c) => c.id === i.customerId)?.name}
                    </h3>
                    <p>
                      {i.service} ·{" "}
                      {i.status === "paid" ? "Paid" : `Due ${i.due}`}
                    </p>
                  </button>
                </div>
                <RowMeta>
                  <strong>{cad(i.amount + i.tax)}</strong>
                  {i.status === "unpaid" && (
                    <div className="yw-actions"><InvoicePayment invoiceId={i.id}/><Button variant="secondary" onClick={() => setPaid(i.id)}>
                      Record payment
                    </Button></div>
                  )}
                </RowMeta>
              </div>
            ))
          ) : (
            <Empty
              title={
                tab === "paid"
                  ? "No recorded payments yet."
                  : "Nothing outstanding."
              }
            >
              Invoices are created from approved quotes and completed work.
              Payments are recorded manually.
            </Empty>
          )}
        </>
      )}
      {edit && (
        <QuoteEditor
          quote={edit === "new" ? undefined : edit}
          onClose={() => setEdit(null)}
        />
      )}
      {detail && (
        <DocumentDetail
          {...detail}
          onRecordPayment={(id) => { setDetail(null); setPaid(id); }}
          onClose={() => setDetail(null)}
          onEdit={(q) => {
            setDetail(null);
            setEdit(q);
          }}
        />
      )}
      {paid && (
        <Confirm
          title="Record this invoice as paid?"
          description="Confirm that you have received the full payment. This records your update; it does not charge a card or verify a bank transfer."
          label="Record full payment"
          onConfirm={() => mutate("paid", { id: paid })}
          onClose={() => setPaid(null)}
        />
      )}
    </>
  );
}
function QuoteEditor({
  quote,
  onClose,
}: {
  quote?: Quote;
  onClose: () => void;
}) {
  const { state, mutate } = useOffice(),
    [values, setValues] = useState<Record<string, unknown>>({
      customerId: quote?.customerId || state.customers[0]?.id,
      service: quote?.service || state.rates[0]?.service || "",
      duration: quote?.duration || 60,
      validUntil: quote?.validUntil || plusDay(today(), 14),
      notes: quote?.notes || "",
    }),
    [items, setItems] = useState<LineItem[]>(
      quote?.items || [
        {
          description: quote?.service || state.rates[0]?.service || "",
          quantity: 1,
          unitPrice: quote?.amount || state.rates[0]?.price || 0,
        },
      ],
    ),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const total = quoteTotals(
    { amount: 0, items, taxRate: state.business.tax } as Quote,
    state.business.tax,
  );
  return (
    <Modal
      title={quote ? "Edit quote" : "New customer quote"}
      description="Set out the work, review the price, then share it for customer approval."
      open
      onClose={() => !pending && onClose()}
    >
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          try {
            await mutate("customer-quote", {
              ...values,
              ...(quote ? { id: quote.id } : {}),
              items,
            });
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save.");
          } finally {
            setPending(false);
          }
        }}
      >
        <Fields
          fields={[
            {
              name: "customerId",
              label: "Customer",
              options: state.customers.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            },
            { name: "service", label: "Service summary" },
            {
              name: "duration",
              label: "Duration (minutes)",
              type: "number",
              min: 15,
              max: 480,
              step: 15,
            },
            { name: "validUntil", label: "Valid until", type: "date" },
          ]}
          values={values}
          set={(n, v) => setValues((s) => ({ ...s, [n]: v }))}
        />
        <h2>Itemized work</h2>
        {items.map((item, index) => (
          <div className="yw-item" key={index}>
            <label className="yw-field">
              Description
              <Input
                required
                maxLength={250}
                value={item.description}
                onChange={(e) =>
                  setItems((all) =>
                    all.map((v, i) =>
                      i === index ? { ...v, description: e.target.value } : v,
                    ),
                  )
                }
              />
            </label>
            <label className="yw-field">
              Quantity
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                max="10000"
                value={item.quantity}
                onChange={(e) =>
                  setItems((all) =>
                    all.map((v, i) =>
                      i === index
                        ? { ...v, quantity: Number(e.target.value) }
                        : v,
                    ),
                  )
                }
              />
            </label>
            <label className="yw-field">
              Unit price
              <Input
                required
                type="number"
                min="0"
                max="100000"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) =>
                  setItems((all) =>
                    all.map((v, i) =>
                      i === index
                        ? { ...v, unitPrice: Number(e.target.value) }
                        : v,
                    ),
                  )
                }
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={items.length === 1}
              aria-label={`Remove item ${index + 1}`}
              onClick={() =>
                setItems((all) => all.filter((_, i) => i !== index))
              }
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          disabled={items.length >= 20}
          onClick={() =>
            setItems((all) => [
              ...all,
              { description: "", quantity: 1, unitPrice: 0 },
            ])
          }
        >
          Add line item
        </Button>
        <label className="yw-field">
          Notes & added value
          <Textarea
            maxLength={2000}
            value={String(values.notes)}
            onChange={(e) =>
              setValues((s) => ({ ...s, notes: e.target.value }))
            }
          />
        </label>
        <p className="yw-total">
          Total {cad(total.total)} · including {cad(total.tax)} tax
        </p>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save quote draft"}
        </Button>
      </form>
    </Modal>
  );
}
function DocumentDetail({
  onRecordPayment,
  id,
  kind,
  onClose,
  onEdit,
}: {
  id: string;
  kind: "quote" | "invoice";
  onRecordPayment: (id: string) => void;
  onClose: () => void;
  onEdit: (q: Quote) => void;
}) {
  const { state, mutate, demo, request, revision, adopt, refresh, busy } =
      useOffice(),
    quote = state.quotes.find((q) => q.id === id),
    document = makeDocument(state, kind, id),
    [records, setRecords] = useState<DocumentRecord[]>(
      state.quoteDeliveries || [],
    ),
    [connection, setConnection] = useState<{
      canSend: boolean;
      reason?: string;
    }>({ canSend: false, reason: "Checking business email…" }),
    [booking, setBooking] = useState(false),
    [confirm, setConfirm] = useState<"email" | "withdraw" | null>(null),
    [error, setError] = useState(""),
    [sending, setSending] = useState(false);
  const preview = state.documentPreviews?.find(
      (d) => d.kind === kind && d.entityId === id,
    ),
    record = demo
      ? preview
      : records.find((d) => d.kind === kind && d.entityId === id),
    needs = kind === "quote" && quote && needsQuoteApproval(state, quote);
  const appointment = state.bookingApprovals?.find(
    (b) =>
      b.quoteId === id &&
      ["pending", "approved", "conflict"].includes(b.decision),
  );
  useEffect(() => {
    let active = true;
    if (!demo)
      request<{
        connection: { canSend: boolean; reason: string };
        records: DocumentRecord[];
      }>("/api/documents")
        .then((r) => {
          if (active) {
            setConnection(r.connection);
            setRecords(r.records);
          }
        })
        .catch((e) => {
          if (active) setConnection({ canSend: false, reason: e.message });
        });
    return () => {
      active = false;
    };
  }, [demo, request]);
  async function run(fn: () => Promise<unknown>) {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete.");
    } finally {
      setSending(false);
    }
  }
  if (booking && quote)
    return <BookingDialog quote={quote} onClose={() => setBooking(false)} />;
  if (confirm)
    return (
      <Confirm
        title={
          confirm === "email"
            ? "Send this customer email?"
            : "Withdraw this quote?"
        }
        description={
          confirm === "email"
            ? `Send the reviewed ${kind} for ${cad(document.total)} to ${document.customer.email}. A provider acceptance will be recorded separately from customer approval.`
            : "The shared quote link will no longer accept a customer response."
        }
        label={confirm === "email" ? "Send email" : "Withdraw quote"}
        onConfirm={async () => {
          if (confirm === "email") {
            const result = await request<{ record: DocumentRecord }>(
              "/api/documents",
              {
                action: "send",
                kind,
                entityId: id,
                reviewedHash: await documentHash(document),
                revision,
              },
            );
            setRecords((all) => [
              result.record,
              ...all.filter((r) => r.id !== result.record.id),
            ]);
          } else {
            await request("/api/documents", {
              action: "withdraw",
              quoteId: id,
            });
            await refresh();
            onClose();
          }
        }}
        onClose={() => setConfirm(null)}
      />
    );
  return (
    <Modal
      sidebar={<CustomerProfile customerId={(kind === "quote" ? quote : state.invoices.find(i => i.id === id))!.customerId} />}
      title={`${kind === "quote" ? "Quote" : "Invoice"} ${document.number}`}
      description="Review the exact customer document before taking the next step."
      open
      onClose={onClose}
    >
      <div className="yw-actions">
        {state.jobs.filter(j => kind === "quote" ? j.sourceQuoteId === id : j.id === state.invoices.find(i => i.id === id)?.jobId).map(j => <RecordLink key={j.id} kind="job" id={j.id}>View visit</RecordLink>)}
      </div>
      {kind === "invoice" && <div className="yw-actions">
        <Status tone={state.invoices.find(i => i.id === id)?.status === "paid" ? "good" : "warning"}>{state.invoices.find(i => i.id === id)?.status === "paid" ? "Paid" : "Unpaid"}</Status>
        {state.invoices.find(i => i.id === id)?.status === "unpaid" && <Button disabled={busy} onClick={() => onRecordPayment(id)}>Record payment</Button>}
      </div>}
      <DocumentPaper document={document} />
      {appointment && (
        <p>
          <Status
            tone={appointment.decision === "approved" ? "good" : "neutral"}
          >
            Appointment {appointment.decision}
          </Status>{" "}
          <span className="muted">Review customer replies in Activity.</span>
        </p>
      )}
      {record && (
        <p>
          <Status>
            {record.emailStatus === "preview"
              ? "Example"
              : record.emailStatus === "accepted"
                ? "Accepted by email provider"
                : record.emailStatus}
          </Status>{" "}
          <Status tone={record.decision === "approved" ? "good" : "neutral"}>
            {record.decision}
          </Status>
        </p>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="yw-actions">
        <Button variant="ghost" onClick={() => window.print()}>
          <Printer size={16} />
          Print
        </Button>
        {quote &&
          kind === "quote" &&
          !record &&
          !appointment &&
          quote.status !== "accepted" && (
            <Button variant="secondary" onClick={() => onEdit(quote)}>
              Edit quote
            </Button>
          )}
        {needs && quote && (
          <Button
            disabled={busy}
            onClick={() =>
              void run(() =>
                mutate("approve-request-quote", {
                  id,
                  reviewedSnapshot: quoteReviewSnapshot(state, quote),
                }),
              )
            }
          >
            Approve scope & price
          </Button>
        )}
        {!needs && !record && !appointment && (
          <Button
            disabled={sending || (!demo && !connection.canSend)}
            onClick={() =>
              demo
                ? void run(() =>
                    mutate("preview-document", { kind, entityId: id }),
                  )
                : setConfirm("email")
            }
          >
            {demo ? "Preview customer flow" : "Send reviewed email"}
          </Button>
        )}
        {kind === "quote" &&
          !needs &&
          !appointment &&
          quote?.status !== "accepted" && (
            <Button variant="secondary" onClick={() => setBooking(true)}>
              Propose appointment
            </Button>
          )}
        {(record?.decision === "approved" ||
          appointment?.decision === "approved") &&
          kind === "quote" &&
          !state.invoices.some((i) => i.sourceQuoteId === id) && (
            <Button
              disabled={sending}
              onClick={() =>
                void run(async () => {
                  if (demo) await mutate("preview-invoice", { quoteId: id });
                  else {
                    const next = await request<Snapshot>("/api/documents", {
                      action: "invoice",
                      quoteId: id,
                      revision,
                    });
                    adopt(next);
                  }
                  toast.success("Invoice created");
                })
              }
            >
              Create invoice
            </Button>
          )}
        {!demo && record?.decision === "pending" && kind === "quote" && (
          <Button variant="ghost" onClick={() => setConfirm("withdraw")}>
            Withdraw email quote
          </Button>
        )}
      </div>
      {!demo && !connection.canSend && !record && (
        <p className="muted">{connection.reason}</p>
      )}
      {demo &&
        preview &&
        kind === "quote" &&
        preview.decision === "pending" && (
          <div className="yw-note">
            <p>
              Try the customer response. This is a simulation; no customer is
              contacted.
            </p>
            <div className="yw-actions">
              <Button
                variant="secondary"
                onClick={() =>
                  void run(() =>
                    mutate("preview-decision", {
                      id: preview.id,
                      decision: "approved",
                      name: document.customer.name,
                      note: "Approved in sample preview.",
                    }),
                  )
                }
              >
                Simulate approval
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  void run(() =>
                    mutate("preview-decision", {
                      id: preview.id,
                      decision: "declined",
                      name: document.customer.name,
                      note: "Declined in sample preview.",
                    }),
                  )
                }
              >
                Simulate decline
              </Button>
            </div>
          </div>
        )}
    </Modal>
  );
}
export function BookingDialog({
  quote,
  onClose,
}: {
  quote: Quote;
  onClose: () => void;
}) {
  const { state, mutate, request, demo, revision, adopt } = useOffice(),
    [input, setInput] = useState<BookingInput>({
      id: crypto.randomUUID(),
      token: createToken(),
      quoteId: quote.id,
      date: plusDay(today(), 1),
      time: "10:00",
      crew: state.business.crew1,
    }),
    [review, setReview] = useState(false),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [connection, setConnection] = useState<{
      canSend: boolean;
      reason?: string;
    }>({ canSend: false, reason: "Checking text connection…" });
  useEffect(() => {
    let active = true;
    if (!demo)
      request<{ connection: { canSend: boolean; reason: string } }>(
        "/api/quote-bookings",
      )
        .then((r) => {
          if (active) setConnection(r.connection);
        })
        .catch((e) => {
          if (active) setConnection({ canSend: false, reason: e.message });
        });
    return () => {
      active = false;
    };
  }, [demo, request]);
  let prepared: ReturnType<typeof prepareBooking> | undefined;
  let preparationError = "";
  try {
    prepared = prepareBooking(
      state,
      input,
      typeof window === "undefined"
        ? "http://localhost:5188"
        : window.location.origin,
      new Date(),
      demo,
    );
  } catch (e) {
    preparationError =
      e instanceof Error ? e.message : "Check the appointment.";
  }
  async function send() {
    if (!prepared || pending) return;
    setPending(true);
    try {
      if (demo) await mutate("preview-booking-request", input);
      else
        adopt(
          await request<Snapshot>("/api/quote-bookings", {
            input,
            revision,
            reviewedSnapshot: bookingSnapshot(prepared.booking),
          }),
        );
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send.");
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal
      title="Propose an appointment"
      description="The visit is booked only after a verified customer approval. A conflicting slot is never silently reserved."
      open
      onClose={onClose}
    >
      <Fields
        fields={[
          { name: "date", label: "Visit date", type: "date" },
          { name: "time", label: "Start time", type: "time" },
          {
            name: "crew",
            label: "Crew",
            options: [state.business.crew1, state.business.crew2].map((c) => ({
              value: c,
              label: c,
            })),
          },
        ]}
        values={input}
        set={(key, value) => {
          setInput((s) => ({ ...s, [key]: value }));
          setReview(false);
        }}
      />
      {preparationError && (
        <p role="alert" className="error-message">
          {preparationError}
        </p>
      )}
      {prepared && (
        <div className="yw-note">
          <strong>Text to {prepared.booking.customerName}</strong>
          <p>{prepared.booking.body}</p>
        </div>
      )}
      {!demo && !connection.canSend && (
        <p className="muted">{connection.reason}</p>
      )}
      {error && <p role="alert">{error}</p>}
      <label className="yw-checklist">
        <span>
          <input
            type="checkbox"
            checked={review}
            onChange={(e) => setReview(e.target.checked)}
          />{" "}
          I reviewed the customer, quote, date and message.
        </span>
      </label>
      <Button
        disabled={
          !prepared || !review || pending || (!demo && !connection.canSend)
        }
        onClick={() => void send()}
      >
        {pending
          ? "Preparing…"
          : demo
            ? "Create sample approval request"
            : "Send reviewed text"}
      </Button>
    </Modal>
  );
}
