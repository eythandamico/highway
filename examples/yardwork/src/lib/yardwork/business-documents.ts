import { assertQuoteApproved } from "./request-quotes.ts";
import { z } from "zod/v3";
import type { Workspace, Quote, Invoice } from "./yardwork.ts";
import { normalizeAppearance } from "./appearance.ts";
import { torontoScheduleTime } from "./traffic.ts";

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};
export type Letterhead = {
  address: string;
  phone: string;
  email: string;
  website: string;
  footer: string;
};
export type BusinessDocument = {
  kind: "quote" | "invoice";
  entityId: string;
  number: string;
  issued: string;
  due: string;
  business: Letterhead & { name: string; colour: string };
  customer: { name: string; address: string; email: string };
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  sample: boolean;
};
export type DocumentRecord = {
  id: string;
  kind: "quote" | "invoice";
  entityId: string;
  document: BusinessDocument;
  emailStatus: "preview" | "sending" | "accepted" | "failed" | "unknown";
  decision: "pending" | "approved" | "declined" | "withdrawn";
  createdAt: string;
  expiresAt: string;
  respondedAt: string | null;
  responderName: string | null;
  responseNote: string | null;
};
export const cents = (n: number) => Math.round((n + Number.EPSILON) * 100);
export const cad = (n: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
export const documentDay = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    try {
      return new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v;
    } catch {
      return false;
    }
  }, "Choose a valid date.");
export const lineItemSchema = z
  .object({
    description: z.string().trim().min(1).max(250),
    quantity: z.coerce.number().min(0.01).max(10000).multipleOf(0.01),
    unitPrice: z.coerce.number().min(0).max(100000).multipleOf(0.01),
  })
  .strict();
export const letterheadSchema = z
  .object({
    address: z.string().trim().max(500),
    phone: z.string().trim().max(80),
    email: z.union([z.string().trim().email().max(250), z.literal("")]),
    website: z.string().trim().max(250),
    footer: z.string().trim().max(500),
  })
  .strict();
export const documentSchemas = {
  "customer-quote": z
    .object({
      id: z.string().max(250).optional(),
      customerId: z.string().min(1).max(250),
      service: z.string().trim().min(1).max(250),
      items: z.array(lineItemSchema).min(1).max(20),
      duration: z.coerce.number().int().min(15).max(480),
      validUntil: date,
      notes: z.string().trim().max(2000),
    })
    .strict()
    .refine(
      (p) =>
        p.items.reduce(
          (sum, item) => sum + cents(item.quantity * item.unitPrice),
          0,
        ) <= 10000000,
      "Quote total must be $100,000 or less before tax.",
    ),
  letterhead: letterheadSchema,
  "preview-document": z
    .object({
      kind: z.enum(["quote", "invoice"]),
      entityId: z.string().min(1).max(250),
    })
    .strict(),
  "preview-decision": z
    .object({
      id: z.string().min(1).max(250),
      decision: z.enum(["approved", "declined"]),
      name: z.string().trim().min(1).max(120),
      note: z.string().trim().max(1000),
    })
    .strict(),
  "preview-invoice": z.object({ quoteId: z.string().min(1).max(250) }).strict(),
};
export function lineSubtotal(items: LineItem[]) {
  return (
    items.reduce(
      (total, item) => total + cents(item.quantity * item.unitPrice),
      0,
    ) / 100
  );
}
export function quoteJobNotes(document: BusinessDocument, visitNotes: string) {
  return [
    visitNotes,
    `Quoted work:\n${document.items.map((item) => `• ${item.description}${item.quantity !== 1 ? ` × ${item.quantity}` : ""}`).join("\n")}`,
    document.notes,
  ]
    .filter(Boolean)
    .join("\n\n");
}
export function quoteTotals(q: Quote, fallbackTax: number) {
  const subtotal = q.items ? lineSubtotal(q.items) : q.amount,
    tax = cents((subtotal * (q.taxRate ?? fallbackTax)) / 100) / 100;
  return { subtotal, tax, total: (cents(subtotal) + cents(tax)) / 100 };
}
export function makeDocument(
  s: Workspace,
  kind: "quote" | "invoice",
  entityId: string,
  now = new Date(),
): BusinessDocument {
  const entity =
    kind === "quote"
      ? s.quotes.find((q) => q.id === entityId)
      : s.invoices.find((i) => i.id === entityId);
  if (!entity) throw new Error("This document is no longer available.");
  if (kind === "invoice" && (entity as Invoice).document) {
    const frozen = (entity as Invoice).document!,
      customer = s.customers.find((c) => c.id === entity.customerId);
    if (!customer) throw new Error("Customer not found.");
    return {
      ...structuredClone(frozen),
      customer: {
        name: customer.name,
        address: customer.address,
        email: customer.email,
      },
    };
  }
  const customer = s.customers.find((c) => c.id === entity.customerId);
  if (!customer) throw new Error("Customer not found.");
  const quote = entity as Quote,
    invoice = entity as Invoice,
    issued = entity.createdAt
      ? documentDay(new Date(entity.createdAt))
      : documentDay(now);
  const fallbackDue = documentDay(new Date(now.getTime() + 14 * 86400000));
  const items =
    kind === "quote" && quote.items
      ? quote.items
      : [
          {
            description: entity.service,
            quantity: 1,
            unitPrice: entity.amount,
          },
        ];
  const totals =
    kind === "quote"
      ? quoteTotals(quote, s.business.tax)
      : {
          subtotal: invoice.amount,
          tax: invoice.tax,
          total: (cents(invoice.amount) + cents(invoice.tax)) / 100,
        };
  return {
    kind,
    entityId,
    number:
      entity.documentNumber ||
      `${kind === "quote" ? "Q" : "INV"}-${entity.id.slice(0, 8).toUpperCase()}`,
    issued,
    due: kind === "quote" ? quote.validUntil || fallbackDue : invoice.due,
    business: {
      name: s.business.name,
      colour: normalizeAppearance(s.appearance).brandPrimary,
      address: s.letterhead?.address || s.business.city,
      phone: s.letterhead?.phone || "",
      email: s.letterhead?.email || "",
      website: s.letterhead?.website || "",
      footer:
        s.letterhead?.footer ||
        "Thank you for choosing our services.",
    },
    customer: {
      name: customer.name,
      address: customer.address,
      email: customer.email,
    },
    items,
    ...totals,
    notes: kind === "quote" ? quote.notes || "" : "",
    sample: s.sample,
  };
}
export function documentExpiry(document: BusinessDocument) {
  // Valid through the end of the displayed Toronto date, not UTC midnight.
  return new Date(
    torontoScheduleTime(document.due, "23:59") + 60000,
  ).toISOString();
}
export async function documentHash(document: BusinessDocument) {
  return hashToken(JSON.stringify(document));
}
export async function hashToken(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export function createToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function documentHtml(d: BusinessDocument, reviewUrl?: string) {
  const e = escapeHtml,
    title = d.kind === "quote" ? "Quote" : "Invoice";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="referrer" content="no-referrer"><title>${title} ${e(d.number)}</title><style>body{margin:0;background:#f3f5f2;font:16px/1.6 Arial,sans-serif;color:#243b2c}main{max-width:720px;margin:24px auto;padding:36px;background:white;border-top:8px solid ${d.business.colour}}h1{font-size:28px;margin:0}h2{font-size:22px;margin:0}p{white-space:pre-line}table{width:100%;border-collapse:collapse}th,td{text-align:left;border-bottom:1px solid #ddd;padding:12px 4px}td:last-child,th:last-child{text-align:right}.muted{color:#56605a;font-size:14px}.total{text-align:right;font-size:20px}.review{display:inline-block;padding:13px 20px;background:${d.business.colour};color:white;text-decoration:none;border-radius:8px}@media print{body{background:white}main{margin:0;padding:20px}.review{display:none}}@media(max-width:520px){main{margin:0;padding:20px}td,th{padding:10px 2px;font-size:14px}}</style></head><body><main><header><h1>${e(d.business.name)}</h1><p class="muted">${e([d.business.address, d.business.phone, d.business.email, d.business.website].filter(Boolean).join("\n"))}</p></header><hr><h2>${title} ${e(d.number)}</h2><p>Issued ${e(d.issued)} · ${d.kind === "quote" ? "Valid until" : "Due"} ${e(d.due)}</p><p><strong>${e(d.customer.name)}</strong>\n${e(d.customer.address)}\n${e(d.customer.email)}</p><table><thead><tr><th>Service / materials</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${d.items.map((i) => `<tr><td>${e(i.description)}</td><td>${i.quantity}</td><td>${cad(i.unitPrice)}</td><td>${cad(cents(i.quantity * i.unitPrice) / 100)}</td></tr>`).join("")}</tbody></table><p class="total">Subtotal ${cad(d.subtotal)}<br>Tax ${cad(d.tax)}<br><strong>Total ${cad(d.total)} CAD</strong></p>${d.notes ? `<p>${e(d.notes)}</p>` : ""}${reviewUrl ? `<p><a class="review" href="${e(reviewUrl)}">${d.kind === "quote" ? "Review quote & respond" : "View invoice"}</a></p>${d.kind === "quote" ? '<p class="muted">Open the link to approve or decline. Replying to this email does not update the quote status.</p>' : ""}` : ""}<footer><p>${e(d.business.footer)}</p>${d.kind === "quote" ? '<p class="muted">This is a quotation. No payment is due from this document.</p>' : ""}${d.sample ? '<p class="muted">Sample document · not for payment</p>' : ""}</footer></main></body></html>`;
}
export function invoiceFromQuote(
  s: Workspace,
  quoteId: string,
  d: BusinessDocument,
  now = new Date(),
): Workspace {
  const next = structuredClone(s),
    q = next.quotes.find((q) => q.id === quoteId);
  if (!q || d.kind !== "quote" || d.entityId !== q.id)
    throw new Error("Quote not found.");
  const job = next.jobs.find((j) => j.sourceQuoteId === quoteId);
  const existing = next.invoices.find(
    (i) => i.sourceQuoteId === quoteId || (job && i.jobId === job.id),
  );
  if (existing) return next;
  const id = crypto.randomUUID(),
    due = documentDay(new Date(now.getTime() + 14 * 86400000)),
    number = `INV-${id.slice(0, 8).toUpperCase()}`;
  const document: BusinessDocument = {
    ...structuredClone(d),
    kind: "invoice",
    entityId: id,
    number,
    issued: documentDay(now),
    due,
  };
  next.invoices.push({
    id,
    sourceQuoteId: q.id,
    jobId: job?.id || "",
    customerId: q.customerId,
    service: q.service,
    amount: d.subtotal,
    tax: d.tax,
    due,
    status: "unpaid",
    document,
    documentNumber: number,
    createdAt: now.toISOString(),
  });
  next.activity.unshift({
    id: crypto.randomUUID(),
    text: `Invoice created from approved quote ${d.number}`,
    time: now.toISOString(),
  });
  return next;
}
export function applyDocumentAction(
  s: Workspace,
  action: keyof typeof documentSchemas,
  payload: unknown,
  now = new Date(),
  preview = false,
): Workspace {
  if (action === "letterhead") {
    s.letterhead = letterheadSchema.parse(payload);
    return s;
  }
  if (action === "customer-quote") {
    const p = documentSchemas[action].parse(payload),
      current = p.id ? s.quotes.find((q) => q.id === p.id) : undefined;
    if (!s.customers.some((c) => c.id === p.customerId))
      throw new Error("Choose a customer first.");
    if (p.validUntil < documentDay(now))
      throw new Error("Choose a validity date today or later.");
    if (p.id && !current) throw new Error("Quote not found.");
    if (
      s.bookingApprovals?.some(
        (b) =>
          b.quoteId === p.id &&
          ["pending", "approved", "conflict"].includes(b.decision),
      )
    )
      throw new Error(
        "This quote has a text approval request. Create a new quote for changes.",
      );
    if (
      current?.status === "accepted" ||
      s.documentPreviews?.some((r) => r.kind === "quote" && r.entityId === p.id)
    )
      throw new Error(
        "Create a new quote to revise a shared or booked document.",
      );
    if (current?.ownerReview && current.customerId !== p.customerId)
      throw new Error(
        "This quote belongs to the customer request. Create a separate quote for another customer.",
      );
    const id = current?.id || crypto.randomUUID(),
      quote: Quote = {
        ...p,
        id,
        leadId: current?.leadId || "",
        status: "draft",
        amount: lineSubtotal(p.items),
        taxRate: s.business.tax,
        documentNumber:
          current?.documentNumber || `Q-${id.slice(0, 8).toUpperCase()}`,
        createdAt: current?.createdAt || now.toISOString(),
      };
    if (current?.ownerReview)
      quote.ownerReview = { status: "pending", pricing: "reviewed" };
    if (current) Object.assign(current, quote);
    else s.quotes.unshift(quote);
    return s;
  }
  if (!s.sample && !preview)
    throw new Error(
      "Customer preview actions are unavailable in a live workspace.",
    );
  s.documentPreviews ??= [];
  if (action === "preview-document") {
    const p = documentSchemas[action].parse(payload),
      existing = s.documentPreviews.find(
        (r) => r.kind === p.kind && r.entityId === p.entityId,
      );
    if (existing) return s;
    if (
      p.kind === "quote" &&
      s.bookingApprovals?.some(
        (b) =>
          b.quoteId === p.entityId &&
          ["pending", "approved", "conflict"].includes(b.decision),
      )
    )
      throw new Error("This quote uses text approval. Review it in Activity.");
    if (p.kind === "quote") {
      const quote = s.quotes.find((q) => q.id === p.entityId);
      if (quote) assertQuoteApproved(s, quote, now);
    }
    const document = makeDocument(s, p.kind, p.entityId, now);
    s.documentPreviews.unshift({
      id: crypto.randomUUID(),
      kind: p.kind,
      entityId: p.entityId,
      document,
      emailStatus: "preview",
      decision: "pending",
      createdAt: now.toISOString(),
      expiresAt: documentExpiry(document),
      respondedAt: null,
      responderName: null,
      responseNote: null,
    });
    return s;
  }
  if (action === "preview-decision") {
    const p = documentSchemas[action].parse(payload),
      record = s.documentPreviews.find((r) => r.id === p.id);
    if (!record || record.kind !== "quote") throw new Error("Quote not found.");
    if (
      s.bookingApprovals?.some(
        (b) =>
          b.quoteId === record.entityId &&
          ["pending", "approved", "conflict"].includes(b.decision),
      )
    )
      throw new Error("This quote uses text approval. Review it in Activity.");
    if (record.decision !== "pending")
      throw new Error("A response has already been recorded.");
    if (Date.parse(record.expiresAt) <= now.getTime())
      throw new Error("This quote has expired.");
    record.decision = p.decision;
    record.responderName = p.name;
    record.responseNote = p.note;
    record.respondedAt = now.toISOString();
    return s;
  }
  const p = documentSchemas["preview-invoice"].parse(payload),
    record = s.documentPreviews.find(
      (r) =>
        r.entityId === p.quoteId &&
        r.kind === "quote" &&
        r.decision === "approved",
    );
  const booking = s.bookingApprovals?.find(
    (b) => b.quoteId === p.quoteId && b.decision === "approved",
  );
  if (!record && !booking)
    throw new Error(
      "The customer must approve this quote before you create its invoice.",
    );
  return invoiceFromQuote(
    s,
    p.quoteId,
    booking?.document || record!.document,
    now,
  );
}
