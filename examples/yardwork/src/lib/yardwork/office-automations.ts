import { z } from "zod/v3";
import type { Workspace } from "./yardwork.ts";
import { cad, documentDay, type DocumentRecord } from "./business-documents.ts";

export const automationKeys = ["invoiceFollowUps", "quoteFollowUps"] as const;
export type AutomationKey = (typeof automationKeys)[number];
export type AutomationPreferences = Record<AutomationKey, boolean>;
export type AutomationTask = {
  id: string;
  rule: AutomationKey;
  entityId: string;
  customerId: string;
  customerName: string;
  recipient: string;
  subject: string;
  body: string;
  sourceLabel: string;
  status: "pending" | "handled" | "dismissed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};
export const automationNames: Record<AutomationKey, string> = {
  invoiceFollowUps: "Invoice follow-ups",
  quoteFollowUps: "Quote follow-ups",
};
const preferencesSchema = z
  .object({ invoiceFollowUps: z.boolean(), quoteFollowUps: z.boolean() })
  .strict();
export function automationPreferences(value: unknown): AutomationPreferences {
  const parsed = preferencesSchema.safeParse(value);
  return parsed.success
    ? parsed.data
    : { invoiceFollowUps: false, quoteFollowUps: false };
}
export const automationSchemas = {
  "automation-setting": z
    .object({ rule: z.enum(automationKeys), enabled: z.boolean() })
    .strict(),
  "automation-run": z.object({}).strict(),
  "automation-resolve": z
    .object({
      id: z.string().min(1).max(600),
      status: z.enum(["handled", "dismissed"]),
    })
    .strict(),
};
export type AutomationAction = keyof typeof automationSchemas;
type Candidate = Omit<AutomationTask, "status" | "createdAt" | "updatedAt">;

function candidates(
  s: Workspace,
  records: DocumentRecord[],
  now: Date,
  preview: boolean,
): Candidate[] {
  const day = documentDay(now),
    result: Candidate[] = [];
  for (const invoice of s.invoices) {
    const customer = s.customers.find((c) => c.id === invoice.customerId);
    if (
      !customer ||
      invoice.status !== "unpaid" ||
      invoice.due >= day ||
      invoice.amount + invoice.tax <= 0
    )
      continue;
    const number =
      invoice.documentNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`;
    result.push({
      id: `invoice:${invoice.id}:${invoice.due}`,
      rule: "invoiceFollowUps",
      entityId: invoice.id,
      customerId: customer.id,
      customerName: customer.name,
      recipient: customer.email,
      subject: `A reminder about ${number}`,
      sourceLabel: `${number} · ${cad(invoice.amount + invoice.tax)} · due ${invoice.due}`,
      body: `Hi ${customer.name.split(" ")[0]},\n\nA friendly reminder that invoice ${number} for ${invoice.service.toLowerCase()} has an outstanding balance of ${cad(invoice.amount + invoice.tax)} CAD and was due ${invoice.due}. If you’ve already paid, please let us know so we can update our records.\n\nThank you,\n${s.business.owner}\n${s.business.name}`,
    });
  }
  for (const record of records) {
    if (
      record.kind !== "quote" ||
      record.decision !== "pending" ||
      !(
        record.emailStatus === "accepted" ||
        (preview && record.emailStatus === "preview")
      ) ||
      !(Date.parse(record.expiresAt) > now.getTime()) ||
      !(Date.parse(record.createdAt) <= now.getTime() - 72 * 3600000)
    )
      continue;
    const quote = s.quotes.find((q) => q.id === record.entityId),
      customer = s.customers.find((c) => c.id === quote?.customerId);
    if (
      !quote ||
      quote.status !== "draft" ||
      quote.approvedDocument ||
      !customer ||
      s.invoices.some((i) => i.sourceQuoteId === quote.id) ||
      record.document.customer.email.trim().toLowerCase() !==
        customer.email.trim().toLowerCase()
    )
      continue;
    const document = record.document;
    result.push({
      id: `quote:${record.id}`,
      rule: "quoteFollowUps",
      entityId: quote.id,
      customerId: customer.id,
      customerName: customer.name,
      recipient: customer.email,
      subject: `Checking in on quote ${document.number}`,
      sourceLabel: `${document.number} · ${cad(document.total)} · awaiting a response`,
      body: `Hi ${customer.name.split(" ")[0]},\n\nJust checking in on quote ${document.number} for ${quote.service.toLowerCase()}, totaling ${cad(document.total)} CAD. Do you have any questions about the work? You can approve or decline using the link in your original quote email.\n\nThank you,\n${s.business.owner}\n${s.business.name}`,
    });
  }
  return result;
}

/** Generates review drafts only. It never contacts a customer or changes an invoice/quote. */
export function reconcileAutomations(
  s: Workspace,
  records: DocumentRecord[],
  now = new Date(),
  preview = false,
) {
  const settings = automationPreferences(s.automationPreferences),
    eligible = candidates(s, records, now, preview);
  const tasks = s.automationTasks || [],
    byId = new Map(eligible.map((item) => [item.id, item]));
  let created = 0;
  for (const task of tasks) {
    if (task.status !== "pending") continue;
    const current = byId.get(task.id);
    if (!current) {
      task.status = "cancelled";
      task.updatedAt = now.toISOString();
    } else if (
      Object.entries(current).some(
        ([key, value]) => task[key as keyof AutomationTask] !== value,
      )
    )
      Object.assign(task, current, { updatedAt: now.toISOString() });
  }
  for (const candidate of eligible) {
    if (
      !settings[candidate.rule] ||
      tasks.some((task) => task.id === candidate.id)
    )
      continue;
    tasks.unshift({
      ...candidate,
      status: "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    created++;
  }
  if (tasks.length || s.automationTasks) s.automationTasks = tasks;
  if (created)
    s.activity.unshift({
      id: crypto.randomUUID(),
      text: `Automations prepared ${created} follow-up ${created === 1 ? "draft" : "drafts"} for review · not sent`,
      time: now.toISOString(),
    });
  s.activity = s.activity.slice(0, 80);
  return s;
}

export function applyAutomationAction(
  s: Workspace,
  action: AutomationAction,
  payload: unknown,
  records: DocumentRecord[],
  now = new Date(),
  preview = false,
) {
  if (action === "automation-setting") {
    const p = automationSchemas[action].parse(payload),
      settings = automationPreferences(s.automationPreferences);
    if (settings[p.rule] !== p.enabled) {
      s.automationPreferences = { ...settings, [p.rule]: p.enabled };
      s.activity.unshift({
        id: crypto.randomUUID(),
        text: `${automationNames[p.rule]} ${p.enabled ? "turned on · prepares review drafts" : "paused"}`,
        time: now.toISOString(),
      });
    }
  }
  reconcileAutomations(s, records, now, preview);
  if (action === "automation-resolve") {
    const p = automationSchemas[action].parse(payload),
      task = s.automationTasks?.find((t) => t.id === p.id);
    if (!task || task.status !== "pending")
      throw new Error("This draft is no longer pending. Check Activity again.");
    task.status = p.status;
    task.updatedAt = now.toISOString();
    s.activity.unshift({
      id: crypto.randomUUID(),
      text: `${automationNames[task.rule]} for ${task.customerName} ${p.status === "handled" ? "marked handled manually" : "dismissed"} · no message sent by Yardwork`,
      time: now.toISOString(),
    });
  }
  s.activity = s.activity.slice(0, 80);
  return s;
}
