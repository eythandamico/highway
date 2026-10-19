import { z } from "zod/v3";
import type { Workspace, Quote } from "./yardwork.ts";
import { makeDocument, documentDay, cents } from "./business-documents.ts";

export type OwnerQuoteReview = {
  status: "pending" | "approved";
  pricing: "saved-rate" | "needs-price" | "reviewed";
  approvedAt?: string;
  approvedSnapshot?: string;
};
export const requestQuoteSchemas = {
  "prepare-request-quotes": z.object({}).strict(),
  "approve-request-quote": z
    .object({
      id: z.string().min(1).max(250),
      reviewedSnapshot: z.string().min(1).max(30000),
    })
    .strict(),
};

export function quoteReviewSnapshot(s: Workspace, q: Quote, now = new Date()) {
  const lead = s.leads.find((lead) => lead.id === q.leadId);
  return JSON.stringify({
    document: makeDocument(s, "quote", q.id, now),
    duration: q.duration,
    request: lead
      ? {
          customerId: lead.customerId,
          service: lead.service,
          message:
            lead.messages
              .filter((message) => message.from === "customer")
              .at(-1)?.text || lead.message,
        }
      : null,
  });
}
export function sharedQuoteRecord(s: Workspace, q: Quote) {
  return [...(s.quoteDeliveries || []), ...(s.documentPreviews || [])].find(
    (record) => record.kind === "quote" && record.entityId === q.id,
  );
}
export function needsQuoteApproval(s: Workspace, q: Quote, now = new Date()) {
  return (
    !!q.ownerReview &&
    q.status === "draft" &&
    !q.approvedDocument &&
    !s.bookingApprovals?.some(
      (b) =>
        b.quoteId === q.id &&
        ["pending", "approved", "conflict"].includes(b.decision),
    ) &&
    !sharedQuoteRecord(s, q) &&
    (q.ownerReview.status !== "approved" ||
      q.ownerReview.approvedSnapshot !== quoteReviewSnapshot(s, q, now))
  );
}
export function assertQuoteApproved(s: Workspace, q: Quote, now = new Date()) {
  if (needsQuoteApproval(s, q, now))
    throw new Error(
      "Approve this quote in Activity before sharing or booking.",
    );
}

// Only customer requests qualify. Office offers and payment reminders are not new work requests.
export function prepareRequestQuotes(s: Workspace, now = new Date()) {
  let count = 0;
  for (const lead of s.leads) {
    if (
      lead.status === "booked" ||
      !lead.messages.some((message) => message.from === "customer") ||
      s.quotes.some((quote) => quote.leadId === lead.id) ||
      !s.customers.some((customer) => customer.id === lead.customerId)
    )
      continue;
    const rate = s.rates.find(
      (rate) =>
        rate.service.trim().toLowerCase() === lead.service.trim().toLowerCase(),
    );
    const id = crypto.randomUUID(),
      expiry = new Date(documentDay(now) + "T12:00:00Z");
    expiry.setUTCDate(expiry.getUTCDate() + 14);
    s.quotes.unshift({
      id,
      leadId: lead.id,
      customerId: lead.customerId,
      service: lead.service,
      status: "draft",
      amount: rate ? cents(rate.price) / 100 : 0,
      duration: rate?.duration || 60,
      taxRate: s.business.tax,
      items: [
        {
          description: lead.service,
          quantity: 1,
          unitPrice: rate ? cents(rate.price) / 100 : 0,
        },
      ],
      createdAt: now.toISOString(),
      validUntil: expiry.toISOString().slice(0, 10),
      documentNumber: `Q-${id.slice(0, 8).toUpperCase()}`,
      notes: "",
      ownerReview: {
        status: "pending",
        pricing: rate ? "saved-rate" : "needs-price",
      },
    });
    const customer = s.customers.find(
      (customer) => customer.id === lead.customerId,
    )!;
    s.activity.unshift({
      id: crypto.randomUUID(),
      text: `Quote draft ready for your approval · ${customer.name} · ${lead.service}`,
      time: now.toISOString(),
    });
    count++;
  }
  if (count) s.activity = s.activity.slice(0, 80);
  return count;
}

export function approveRequestQuote(
  s: Workspace,
  id: string,
  reviewedSnapshot: string,
  now = new Date(),
) {
  const q = s.quotes.find((quote) => quote.id === id);
  if (
    !q?.ownerReview ||
    q.status !== "draft" ||
    q.approvedDocument ||
    sharedQuoteRecord(s, q)
  )
    throw new Error("This quote is no longer awaiting your approval.");
  if (q.ownerReview.pricing === "needs-price")
    throw new Error("Set the quote price before approving it.");
  if (!q.validUntil || q.validUntil < documentDay(now))
    throw new Error("Update the quote expiry before approving it.");
  const snapshot = quoteReviewSnapshot(s, q, now);
  if (snapshot !== reviewedSnapshot)
    throw new Error(
      "The quote changed. Review its latest details before approving.",
    );
  if (!needsQuoteApproval(s, q, now)) return false;
  q.ownerReview = {
    ...q.ownerReview,
    status: "approved",
    approvedSnapshot: snapshot,
    approvedAt: now.toISOString(),
  };
  const lead = s.leads.find((lead) => lead.id === q.leadId);
  if (lead) lead.status = "quoted";
  s.activity.unshift({
    id: crypto.randomUUID(),
    text: `You approved quote ${q.documentNumber} · ready to share with ${s.customers.find((customer) => customer.id === q.customerId)?.name || "the customer"}`,
    time: now.toISOString(),
  });
  s.activity = s.activity.slice(0, 80);
  return true;
}
