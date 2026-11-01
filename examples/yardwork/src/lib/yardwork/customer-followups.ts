import { z } from "zod/v3";
import { currentSeason } from "./appearance.ts";
import type { Workspace, Customer } from "./yardwork.ts";

export type CustomerFollowup = {
  customerId: string;
  key: string;
  body: string;
  sourceBody: string;
  status: "draft" | "snoozed" | "handled";
  updatedAt: string;
  until?: string;
};
export type FollowupSuggestion = {
  key: string;
  kind: "nearby" | "seasonal" | "check-in";
  title: string;
  reason: string;
  body: string;
};
const target = {
  customerId: z.string().min(1).max(250),
  key: z.string().min(1).max(120),
  sourceBody: z.string().min(1).max(1500),
};
export const customerFollowupSchemas = {
  "customer-followup-save": z
    .object({ ...target, body: z.string().trim().min(1).max(1500) })
    .strict(),
  "customer-followup-done": z
    .object({ ...target, body: z.string().trim().min(1).max(1500) })
    .strict(),
  "customer-followup-snooze": z.object(target).strict(),
};
export type CustomerFollowupAction = keyof typeof customerFollowupSchemas;
const dayOf = (now: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
const addDays = (day: string, amount: number) => {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
};
const areaKey = (value: string) =>
  value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
const label = (day: string) =>
  new Date(day + "T12:00:00Z").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** Suggestions use calendar seasons and recorded bookings, never the appearance theme or assumed GPS proximity. */
export function customerFollowups(
  s: Workspace,
  c: Customer,
  now = new Date(),
): FollowupSuggestion[] {
  const day = dayOf(now),
    tomorrow = addDays(day, 1),
    season = currentSeason(now);
  const year = Number(day.slice(0, 4)),
    month = Number(day.slice(5, 7));
  const seasonYear = season === "winter" && month < 3 ? year - 1 : year;
  const seasonStart =
    season === "winter"
      ? `${seasonYear}-12-01`
      : `${year}-${season === "spring" ? "03" : season === "summer" ? "06" : "09"}-01`;
  const history = (s.customerFollowups || []).filter(
    (item) => item.customerId === c.id,
  );
  if (
    history.some(
      (item) =>
        (item.status === "snoozed" && (item.until || "") > day) ||
        (item.status === "handled" &&
          item.updatedAt >
            new Date(now.getTime() - 14 * 86400000).toISOString()),
    )
  )
    return [];
  if (
    s.leads.some((l) => l.customerId === c.id && l.status !== "booked") ||
    s.bookingApprovals?.some(
      (b) => b.customerId === c.id && b.decision === "pending",
    )
  )
    return [];
  if (
    s.leadOutreach?.some(
      (o) =>
        o.customerId === c.id &&
        ["sending", "accepted", "unknown"].includes(o.status) &&
        o.createdAt > new Date(now.getTime() - 14 * 86400000).toISOString(),
    )
  )
    return [];
  const jobs = s.jobs.filter((j) => j.customerId === c.id);
  const unfinished = jobs.filter((j) => j.status !== "complete");
  const last = jobs
    .filter((j) => j.status === "complete" && j.date <= day)
    .map((j) => j.date)
    .sort()
    .at(-1);
  const intro = `Hi ${c.name.split(" ")[0]}, it’s ${s.business.owner} from ${s.business.name.replace(/[.!?]+$/, "")}.`;
  const suggestions: FollowupSuggestion[] = [];
  const route =
    c.area.trim() &&
    s.jobs.find(
      (j) =>
        j.customerId !== c.id &&
        j.date === tomorrow &&
        j.status !== "complete" &&
        areaKey(
          s.customers.find((person) => person.id === j.customerId)?.area || "",
        ) === areaKey(c.area),
    );
  if (route && !unfinished.length)
    suggestions.push({
      key: `nearby:${tomorrow}`,
      kind: "nearby",
      title: "In their area tomorrow",
      reason: `Another visit is booked in ${c.area} tomorrow, ${label(tomorrow)}.`,
      body: `${intro} We’ll be working in ${c.area} tomorrow (${label(tomorrow)}). Is there anything you’d like a hand with? Let me know and we can check a time and quote for you.`,
    });
  const seasonal = {
    spring: {
      title: "Time for a spring check-in",
      text: "With spring here, are there any services or projects you’d like help with?",
    },
    summer: {
      title: "A summer service check-in",
      text: "Is there anything you need help with this summer? We can review the work and put together a quote.",
    },
    autumn: {
      title: "Plan your next service",
      text: "With fall here and winter on the way, would you like to plan your next service? Let me know what you need.",
    },
    winter: {
      title: "A winter service check-in",
      text: "With winter here, are there any services you’d like to arrange? Let me know what you need and I’ll confirm how we can help.",
    },
  }[season];
  const covered = jobs.some(
    (j) =>
      s.rates.some((rate) => rate.service === j.service) &&
      (j.status !== "complete" || (j.date >= seasonStart && j.date <= day)),
  );
  if (!covered)
    suggestions.push({
      key: `season:${seasonYear}:${season}`,
      kind: "seasonal",
      title: seasonal.title,
      reason: `Seasonal reminder · ${last ? "last recorded visit " + label(last) : "no completed visit recorded yet"}.`,
      body: `${intro} ${seasonal.text}`,
    });
  if (!unfinished.length && (!last || last <= addDays(day, -45)))
    suggestions.push({
      key: `check-in:${day.slice(0, 7)}`,
      kind: "check-in",
      title: "A friendly check-in",
      reason: last
        ? `Last recorded visit was ${label(last)}.`
        : "No completed visit recorded yet. Ask what would be helpful.",
      body: `${intro} Just checking in—is there any services you need help with? Happy to put together a quote whenever you need a hand.`,
    });
  return suggestions.filter(
    (item) =>
      !history.some(
        (record) => record.key === item.key && record.status === "handled",
      ),
  );
}

export function applyCustomerFollowup(
  s: Workspace,
  action: CustomerFollowupAction,
  p: { customerId: string; key: string; sourceBody: string; body?: string },
  now: Date,
) {
  const customer = s.customers.find((c) => c.id === p.customerId);
  if (!customer) throw new Error("Customer not found.");
  const suggestion = customerFollowups(s, customer, now).find(
    (item) => item.key === p.key,
  );
  if (!suggestion || suggestion.body !== p.sourceBody)
    throw new Error(
      "This reminder changed. Reopen it to review the current suggestion.",
    );
  const existing = s.customerFollowups?.find(
    (item) => item.customerId === p.customerId && item.key === p.key,
  );
  const record: CustomerFollowup = {
    customerId: p.customerId,
    key: p.key,
    sourceBody: suggestion.body,
    body: p.body || existing?.body || suggestion.body,
    status:
      action === "customer-followup-save"
        ? "draft"
        : action === "customer-followup-done"
          ? "handled"
          : "snoozed",
    updatedAt: now.toISOString(),
    ...(action === "customer-followup-snooze"
      ? { until: addDays(dayOf(now), 7) }
      : {}),
  };
  s.customerFollowups = [
    ...(s.customerFollowups || []).filter(
      (item) => item.customerId !== p.customerId || item.key !== p.key,
    ),
    record,
  ];
  return action === "customer-followup-save"
    ? `Follow-up draft saved for ${customer.name}`
    : action === "customer-followup-done"
      ? `Follow-up marked handled for ${customer.name}`
      : `Follow-up snoozed for 7 days for ${customer.name}`;
}
