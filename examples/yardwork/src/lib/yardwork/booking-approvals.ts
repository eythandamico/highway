import { z } from "zod/v3";
import type { Workspace, Quote } from "./yardwork.ts";
import {
  makeDocument,
  documentExpiry,
  cad,
  cents,
  lineItemSchema,
  lineSubtotal,
  quoteJobNotes,
  type BusinessDocument,
} from "./business-documents.ts";
import { needsQuoteApproval, sharedQuoteRecord } from "./request-quotes.ts";
import {
  SCHEDULE_WORKDAY_START,
  SCHEDULE_WORKDAY_END,
} from "./schedule-capacity.ts";
import { torontoScheduleTime } from "./traffic.ts";

export type BookingApproval = {
  id: string;
  quoteId: string;
  customerId: string;
  customerName: string;
  recipient: string;
  code: string;
  token: string;
  date: string;
  time: string;
  duration: number;
  crew: string;
  service: string;
  notes: string;
  document: BusinessDocument;
  body: string;
  createdAt: string;
  expiresAt: string;
  sendStatus:
    | "preview"
    | "sending"
    | "accepted"
    | "delivered"
    | "failed"
    | "unknown";
  providerSid?: string;
  decision:
    | "pending"
    | "approved"
    | "declined"
    | "conflict"
    | "cancelled"
    | "expired";
  responseAt?: string;
  responseText?: string;
  responseSid?: string;
  replySids?: string[];
  jobId?: string;
  unread: boolean;
  reason?: string;
};
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    try {
      return new Date(s + "T12:00:00Z").toISOString().slice(0, 10) === s;
    } catch {
      return false;
    }
  });
const short = z.string().trim().min(1).max(250);
export const bookingInputSchema = z
  .object({
    id: z.string().uuid(),
    token: z.string().regex(/^[a-f0-9]{64}$/),
    quoteId: short.optional(),
    customerId: short.optional(),
    service: short.optional(),
    amount: z.coerce.number().min(0).max(100000).optional(),
    items: z.array(lineItemSchema).min(1).max(20).optional(),
    duration: z.coerce.number().int().min(15).max(480).optional(),
    notes: z.string().trim().max(2000).optional(),
    date,
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    crew: short,
  })
  .strict();
export type BookingInput = z.infer<typeof bookingInputSchema>;
export const bookingActionSchemas = {
  "preview-booking-request": bookingInputSchema,
  "preview-booking-reply": z
    .object({ id: z.string().uuid(), text: z.string().trim().min(1).max(1600) })
    .strict(),
  "booking-read": z.object({ id: z.string().uuid() }).strict(),
  "booking-cancel": z.object({ id: z.string().uuid() }).strict(),
};
export function bookingPhone(value: string, preview = false) {
  const phone = value.trim().replace(/[\s().-]/g, "");
  if (preview) return phone;
  if (!/^\+[1-9]\d{7,14}$/.test(phone) || /^\+1\d{3}55501\d{2}$/.test(phone))
    throw new Error(
      "Add the customer’s real mobile number with a country code before sending.",
    );
  return phone;
}
const minutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export function bookingFits(
  s: Workspace,
  b: Pick<BookingApproval, "date" | "time" | "duration" | "crew">,
  now = new Date(),
) {
  const start = minutes(b.time),
    end = start + b.duration;
  return (
    [s.business.crew1, s.business.crew2].includes(b.crew) &&
    b.crew !== "all" &&
    torontoScheduleTime(b.date, b.time) > now.getTime() &&
    start >= SCHEDULE_WORKDAY_START &&
    end <= SCHEDULE_WORKDAY_END &&
    !s.jobs.some(
      (j) =>
        j.date === b.date &&
        j.crew === b.crew &&
        start < minutes(j.time) + j.duration &&
        end > minutes(j.time),
    )
  );
}
export function bookingSnapshot(b: BookingApproval) {
  return JSON.stringify({
    document: b.document,
    recipient: b.recipient,
    date: b.date,
    time: b.time,
    duration: b.duration,
    crew: b.crew,
    notes: b.notes,
    body: b.body,
  });
}
export function prepareBooking(
  s: Workspace,
  value: unknown,
  origin: string,
  now = new Date(),
  preview = false,
) {
  const input = bookingInputSchema.parse(value),
    next = structuredClone(s);
  const existing = next.bookingApprovals?.find((b) => b.id === input.id);
  if (existing) return { state: next, booking: existing };
  let q: Quote | undefined = input.quoteId
    ? next.quotes.find((q) => q.id === input.quoteId)
    : undefined;
  if (input.quoteId && !q) throw new Error("Quote not found.");
  if (input.quoteId && input.items)
    throw new Error(
      "Edit the saved quote in Money before proposing the appointment.",
    );
  if (
    input.items &&
    (lineSubtotal(input.items) > 100000 ||
      cents(lineSubtotal(input.items)) !== cents(input.amount ?? -1))
  )
    throw new Error("Review the itemized quote total before sending.");
  if (
    q &&
    (q.status === "accepted" ||
      next.bookingApprovals?.some(
        (b) => b.quoteId === q!.id && b.decision === "pending",
      ))
  )
    throw new Error(
      "This quote is already booked or waiting for a text response.",
    );
  if (q && needsQuoteApproval(next, q, now))
    throw new Error("Review and approve this quote in Activity first.");
  const customer = next.customers.find(
    (c) => c.id === (q?.customerId || input.customerId),
  );
  if (!customer) throw new Error("Choose a customer first.");
  const recipient = bookingPhone(customer.phone, preview);
  if (
    ![next.business.crew1, next.business.crew2].includes(input.crew) ||
    input.crew === "all"
  )
    throw new Error("Choose one of your configured crews.");
  if (!q) {
    if (input.amount === undefined || !input.duration || !input.service)
      throw new Error("Enter a service, price and duration.");
    q = {
      id: input.id,
      customerId: customer.id,
      leadId: "",
      service: input.service,
      amount: cents(input.amount) / 100,
      duration: input.duration,
      status: "draft",
      items: input.items || [
        {
          description: input.service,
          quantity: 1,
          unitPrice: cents(input.amount) / 100,
        },
      ],
      taxRate: s.business.tax,
      createdAt: now.toISOString(),
      validUntil: input.date,
      documentNumber: "Q-" + input.id.slice(0, 8).toUpperCase(),
      notes: input.notes || "",
    };
    next.quotes.unshift(q);
  }
  const document = structuredClone(
    sharedQuoteRecord(s, q)?.document ||
      q.approvedDocument ||
      makeDocument(next, "quote", q.id, now),
  );
  const expiresAt = new Date(
    Math.min(
      Date.parse(documentExpiry(document)),
      torontoScheduleTime(input.date, input.time),
    ),
  ).toISOString();
  if (Date.parse(expiresAt) <= now.getTime())
    throw new Error("Choose a future appointment and a current quote.");
  const code = input.id.replaceAll("-", "").slice(0, 12).toUpperCase();
  const body = `${document.business.name}: ${q.service} quote ${document.number}, ${cad(document.total)} CAD including tax. Proposed visit: ${input.date} at ${input.time} Toronto time (${q.duration} min). Review scope and price: ${origin}/booking-quotes/${input.token}\nReply YES ${code} to approve the quote and appointment, or NO ${code} to decline. The time is confirmed after we receive approval and check availability.`;
  if (body.length > 1500)
    throw new Error(
      "Shorten the business or service name before sending the quote text.",
    );
  const booking: BookingApproval = {
    id: input.id,
    token: input.token,
    quoteId: q.id,
    customerId: customer.id,
    customerName: customer.name,
    recipient,
    code,
    date: input.date,
    time: input.time,
    crew: input.crew,
    duration: q.duration,
    service: q.service,
    notes: input.notes || "",
    document,
    body,
    createdAt: now.toISOString(),
    expiresAt,
    sendStatus: preview ? "preview" : "sending",
    decision: "pending",
    unread: false,
  };
  if (!bookingFits(next, booking, now))
    throw new Error(
      "This appointment does not fit an available crew slot. Choose another time.",
    );
  next.bookingApprovals ??= [];
  next.bookingApprovals.unshift(booking);
  next.activity.unshift({
    id: crypto.randomUUID(),
    text: `${preview ? "Text approval preview prepared" : "Quote text prepared"} · ${customer.name} · awaiting customer approval; not on calendar`,
    time: now.toISOString(),
  });
  next.activity = next.activity.slice(0, 80);
  return { state: next, booking };
}
export function parseBookingReply(text: string) {
  const match = text
    .trim()
    .toUpperCase()
    .match(
      /^(YES|APPROVE|APPROVED|NO|DECLINE|DECLINED)\s+([A-F0-9]{12})[.!]?$/,
    );
  return match
    ? {
        decision: ["YES", "APPROVE", "APPROVED"].includes(match[1])
          ? ("approved" as const)
          : ("declined" as const),
        code: match[2],
      }
    : null;
}
export function recordBookingReply(
  s: Workspace,
  id: string,
  text: string,
  sid: string,
  now = new Date(),
) {
  const next = structuredClone(s),
    b = next.bookingApprovals?.find((b) => b.id === id);
  if (
    !b ||
    b.decision !== "pending" ||
    next.bookingApprovals?.some((request) =>
      request.replySids?.includes(sid),
    ) ||
    b.sendStatus === "failed"
  )
    return next;
  b.replySids ??= [];
  b.replySids.push(sid);
  const parsed = parseBookingReply(text);
  if (!parsed || parsed.code !== b.code) {
    b.responseSid = sid;
    b.responseText = text;
    b.unread = true;
    b.reason = "Customer replied. Review the message; no booking was made.";
    next.activity.unshift({
      id: crypto.randomUUID(),
      text: `Customer reply needs review · ${b.customerName}: ${text.slice(0, 240)}`,
      time: now.toISOString(),
    });
    next.activity = next.activity.slice(0, 80);
    return next;
  }
  b.responseAt = now.toISOString();
  b.responseText = text;
  b.responseSid = sid;
  b.unread = true;
  b.reason = undefined;
  if (Date.parse(b.expiresAt) <= now.getTime()) {
    b.decision = "expired";
    b.reason = "The quote or appointment expired. Send a new proposal.";
  } else if (parsed.decision === "declined") {
    b.decision = "declined";
  } else {
    const q = next.quotes.find((q) => q.id === b.quoteId),
      customer = next.customers.find((c) => c.id === b.customerId);
    let phone = "";
    try {
      phone = customer
        ? bookingPhone(customer.phone, b.sendStatus === "preview")
        : "";
    } catch {}
    if (
      !q ||
      q.status === "accepted" ||
      !customer ||
      phone !== b.recipient ||
      customer.name !== b.document.customer.name ||
      customer.address !== b.document.customer.address ||
      !bookingFits(next, b, now)
    ) {
      b.decision = "conflict";
      b.reason =
        "Quote approved, but the time or customer details changed. Arrange a new appointment.";
    } else {
      b.decision = "approved";
      b.jobId = "booking-" + b.id;
      q.status = "accepted";
      q.approvedDocument = b.document;
      q.items = b.document.items;
      q.taxRate = b.document.subtotal
        ? (b.document.tax / b.document.subtotal) * 100
        : 0;
      q.amount = b.document.subtotal;
      next.jobs.push({
        id: b.jobId,
        sourceQuoteId: q.id,
        employeeIds: [],
        customerId: b.customerId,
        service: b.service,
        date: b.date,
        time: b.time,
        duration: b.duration,
        crew: b.crew,
        amount: b.document.subtotal,
        status: "scheduled",
        notes: quoteJobNotes(b.document, b.notes || customer.notes),
      });
      const invoice = next.invoices.find((i) => i.sourceQuoteId === q.id);
      if (invoice) invoice.jobId = b.jobId;
      const lead = next.leads.find((l) => l.id === q.leadId);
      if (lead) {
        lead.status = "booked";
        lead.messages.push({ from: "customer", text });
      }
    }
  }
  const result =
    b.decision === "approved"
      ? `Quote approved · ${b.customerName} · work added to your calendar for ${b.date} at ${b.time}`
      : b.decision === "declined"
        ? `Quote declined · ${b.customerName} · no work booked`
        : `Quote reply needs attention · ${b.customerName} · ${b.reason}`;
  next.activity.unshift({
    id: crypto.randomUUID(),
    text: result,
    time: now.toISOString(),
  });
  next.activity = next.activity.slice(0, 80);
  return next;
}
