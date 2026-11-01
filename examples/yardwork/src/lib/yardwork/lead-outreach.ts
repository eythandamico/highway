import { z } from "zod/v3";
import { getBookingSlots } from "./schedule-capacity.ts";
import { dateLabel, type Workspace, type Customer } from "./yardwork.ts";
export type OutreachPermission = {
  allowed: boolean;
  phone: string;
  updatedAt: string;
};
export type LeadOutreach = {
  id: string;
  code: string;
  customerId: string;
  recipient: string;
  date: string;
  crew: string;
  area: string;
  service: string;
  body: string;
  createdAt: string;
  status: "sending" | "accepted" | "failed" | "unknown" | "cancelled";
  providerSid?: string;
  replySid?: string;
  response?: string;
  leadId?: string;
};
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    try {
      return (
        new Date(value + "T12:00:00Z").toISOString().slice(0, 10) === value
      );
    } catch {
      return false;
    }
  });
export const outreachInput = z
  .object({
    date: day,
    crew: z.string().min(1).max(250),
    area: z.string().trim().min(1).max(120),
    service: z.string().trim().min(1).max(250),
    lapsedDays: z.number().int().min(14).max(365).default(30),
  })
  .strict();
export type OutreachInput = z.infer<typeof outreachInput>;
export const outreachPermissionSchema = z
  .object({ id: z.string().min(1).max(250), allowed: z.boolean() })
  .strict();
const normalized = (s: string) =>
  s.trim().toLocaleLowerCase().replace(/\s+/g, " ");
export const outreachPhone = (value: string) => {
  const number = value.replace(/[\s().-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(number) &&
    !/^\+1\d{3}55501\d{2}$/.test(number)
    ? number
    : "";
};
export function localDay(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function routeAreas(s: Workspace, date: string, crew: string) {
  return [
    ...new Set(
      s.jobs
        .filter((j) => j.date === date && (crew === "all" || j.crew === crew))
        .map(
          (j) =>
            s.customers.find((c) => c.id === j.customerId)?.area.trim() || "",
        )
        .filter(Boolean),
    ),
  ];
}
export function outreachCandidates(
  s: Workspace,
  input: OutreachInput,
  now = new Date(),
) {
  const current = localDay(now),
    rate = s.rates.find((r) => r.service === input.service);
  if (
    !rate ||
    !getBookingSlots(s, input.date, input.crew, now).some(
      (slot) => slot.minutes >= rate.duration + 30,
    )
  )
    return [];
  return s.customers
    .flatMap((customer) => {
      if (normalized(customer.area) !== normalized(input.area)) return [];
      const last = s.jobs
        .filter(
          (j) =>
            j.customerId === customer.id &&
            j.status === "complete" &&
            j.date <= current,
        )
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      if (!last) return [];
      const days = Math.floor(
        (Date.parse(current + "T12:00Z") - Date.parse(last.date + "T12:00Z")) /
          86400000,
      );
      if (
        days < input.lapsedDays ||
        s.jobs.some(
          (j) => j.customerId === customer.id && j.status !== "complete",
        ) ||
        s.bookingApprovals?.some(
          (b) => b.customerId === customer.id && b.decision === "pending",
        ) ||
        s.leads.some(
          (l) =>
            l.customerId === customer.id &&
            l.status !== "booked" &&
            l.messages.some((m) => m.from === "customer"),
        )
      )
        return [];
      const phone = outreachPhone(customer.phone),
        recent = s.leadOutreach?.some(
          (o) =>
            (o.customerId === customer.id ||
              (phone && o.recipient === phone)) &&
            Date.parse(o.createdAt) > now.getTime() - 14 * 86400000,
        );
      const permission = customer.outreachPermission;
      const reason = recent
        ? "Contacted in the last 14 days"
        : !phone
          ? "Add a mobile number with country code"
          : !permission?.allowed || permission.phone !== phone
            ? "Offer permission needed"
            : "";
      return [
        { customer, lastVisit: last.date, days, canSend: !reason, reason },
      ];
    })
    .sort(
      (a, b) =>
        b.days - a.days || a.customer.name.localeCompare(b.customer.name),
    );
}
export function outreachBody(
  s: Workspace,
  c: Customer,
  input: OutreachInput,
  code: string,
) {
  const near = routeAreas(s, input.date, input.crew).some(
    (a) => normalized(a) === normalized(input.area),
  );
  return `Hi ${c.name.split(" ")[0]}, it’s ${s.business.owner} from ${s.business.name}. ${near ? "We’ll be working" : "We have availability"} in ${input.area} on ${dateLabel(input.date, { weekday: "long", month: "short", day: "numeric" })}. Would you like a quote for ${input.service.toLowerCase()}? Reply YES ${code} and we’ll arrange the details. This is an invitation, not a confirmed booking. Reply STOP to opt out.`;
}
