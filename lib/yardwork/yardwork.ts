import {
  customerFollowupSchemas,
  applyCustomerFollowup,
  type CustomerFollowup,
  type CustomerFollowupAction,
} from "./customer-followups.ts";
import {
  outreachPermissionSchema,
  outreachPhone,
  type OutreachPermission,
  type LeadOutreach,
} from "./lead-outreach.ts";
import {
  bookingActionSchemas,
  prepareBooking,
  recordBookingReply,
  type BookingApproval,
} from "./booking-approvals.ts";
import {
  requestQuoteSchemas,
  prepareRequestQuotes,
  approveRequestQuote,
  assertQuoteApproved,
  type OwnerQuoteReview,
} from "./request-quotes.ts";
import { z } from "zod/v3";
import { askSchema, type ChatPhoto } from "./chat-photos.ts";
import {
  automationSchemas,
  applyAutomationAction,
  type AutomationPreferences,
  type AutomationTask,
  type AutomationAction,
} from "./office-automations.ts";
import { appearanceSchema, type AppearanceSettings } from "./appearance.ts";
import {
  notificationPreferencesSchema,
  type NotificationPreferences,
} from "./notification-preferences.ts";
import {
  teamSchemas,
  applyTeamAction,
  assertEmployeeSlot,
  type Employee,
  type EmployeeCheckIn,
  type TeamIssue,
  type TeamAction,
} from "./team.ts";
import { torontoScheduleTime } from "./traffic.ts";
import {
  documentSchemas,
  applyDocumentAction,
  invoiceFromQuote,
  quoteTotals,
  quoteJobNotes,
  makeDocument,
  type Letterhead,
  type LineItem,
  type BusinessDocument,
  type DocumentRecord,
} from "./business-documents.ts";
import type { Prospect } from "./prospect-search";
export type Customer = {
  outreachPermission?: OutreachPermission;
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  area: string;
  notes: string;
  recurring: string;
};
export type Job = {
  sourceQuoteId?: string;
  employeeIds?: string[];
  id: string;
  customerId: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  crew: string;
  amount: number;
  status: "scheduled" | "in-progress" | "complete";
  notes: string;
};
export type Lead = {
  id: string;
  customerId: string;
  service: string;
  message: string;
  status: "new" | "quoted" | "booked";
  messages: { text: string; from: "customer" | "office" }[];
};
export type Quote = {
  ownerReview?: OwnerQuoteReview;
  approvedDocument?: BusinessDocument;
  items?: LineItem[];
  taxRate?: number;
  notes?: string;
  validUntil?: string;
  createdAt?: string;
  documentNumber?: string;
  id: string;
  leadId: string;
  customerId: string;
  service: string;
  amount: number;
  duration: number;
  status: "draft" | "accepted";
};
export type Invoice = {
  paidAt?: string;
  sourceQuoteId?: string;
  document?: BusinessDocument;
  createdAt?: string;
  documentNumber?: string;
  id: string;
  jobId: string;
  customerId: string;
  service: string;
  amount: number;
  tax: number;
  due: string;
  status: "unpaid" | "paid";
};
export type Message = {
  image?: ChatPhoto;
  id: string;
  role: "user" | "assistant";
  text: string;
  intent?: string;
};
export type Workspace = {
  customerFollowups?: CustomerFollowup[];
  leadOutreach?: LeadOutreach[];
  bookingApprovals?: BookingApproval[];
  quoteDeliveries?: DocumentRecord[];
  automationPreferences?: AutomationPreferences;
  automationTasks?: AutomationTask[];
  letterhead?: Letterhead;
  documentPreviews?: DocumentRecord[];
  employees?: Employee[];
  checkIns?: EmployeeCheckIn[];
  teamIssues?: TeamIssue[];
  appearance?: AppearanceSettings;
  notificationPreferences?: NotificationPreferences;
  prospects?: Prospect[];
  business: {
    name: string;
    city: string;
    owner: string;
    tax: number;
    crew1: string;
    crew2: string;
  };
  rates: { service: string; price: number; duration: number }[];
  customers: Customer[];
  jobs: Job[];
  leads: Lead[];
  quotes: Quote[];
  invoices: Invoice[];
  activity: { id: string; text: string; time: string }[];
  chat: Message[];
  sample: boolean;
  onboarding?: {completed:boolean; dismissed?:boolean};
};
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function plusDay(day: string, n: number) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const money = (n: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
export function dateLabel(
  d: string,
  opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  },
) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-CA", { ...opts, timeZone: "UTC" });
}
export function timeLabel(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}
const id = () => crypto.randomUUID();
export function seed(empty = false): Workspace {
  const day = today();
  const s: Workspace = {
    business: {
      name: "Everyday Services Co.",
      city: "Toronto, ON",
      owner: "Alex",
      tax: 13,
      crew1: "Service team",
      crew2: "Projects team",
    },
    rates: [
      { service: "Routine cleaning", price: 85, duration: 45 },
      { service: "Deep cleaning", price: 325, duration: 120 },
      { service: "Maintenance visit", price: 180, duration: 90 },
      { service: "Installation", price: 475, duration: 180 },
    ],
    employees: [],
    checkIns: [],
    teamIssues: [],
    customers: [],
    jobs: [],
    leads: [],
    quotes: [],
    invoices: [],
    activity: [],
    chat: [],
    sample: !empty,
  };
  if (empty) return s;
  const people = [
    [
      "c1",
      "Susan Miller",
      "42 Oak Street",
      "The Beaches",
      "Dog in the backyard. East gate. No visits before 10 am.",
      "Every 2 weeks",
    ],
    [
      "c2",
      "James & Priya Patel",
      "118 Kingston Road",
      "The Beaches",
      "Supplies are beside the garage. Please call before arrival.",
      "Weekly",
    ],
    [
      "c3",
      "Daniel Chen",
      "65 Queen Street East",
      "Leslieville",
      "Use the side entrance. Confirm equipment placement on arrival.",
      "As needed",
    ],
    [
      "c4",
      "Emma Wilson",
      "27 Woodbine Avenue",
      "The Beaches",
      "Call at the gate. Check the service notes before starting.",
      "Every 2 weeks",
    ],
    [
      "c5",
      "Michael Thompson",
      "89 Danforth Avenue",
      "Riverdale",
      "Looking for a deep cleaning service.",
      "As needed",
    ],
    [
      "c6",
      "Olivia Brooks",
      "14 Logan Avenue",
      "Leslieville",
      "New customer. Wants a maintenance visit.",
      "As needed",
    ],
  ];
  s.customers = people.map((p, i) => ({
    id: p[0],
    name: p[1],
    address: p[2] + ", Toronto",
    area: p[3],
    notes: p[4],
    recurring: p[5],
    email: p[1].split(" ")[0].toLowerCase() + "@example.com",
    phone: "416-555-010" + (i + 1),
  }));
  const visits: [
    string,
    string,
    string,
    string,
    string,
    number,
    string,
    number,
    Job["status"],
  ][] = [
    [
      "j1",
      "c2",
      "Routine cleaning",
      day,
      "08:30",
      45,
      "Service team",
      85,
      "complete",
    ],
    [
      "j2",
      "c4",
      "Maintenance visit",
      day,
      "09:45",
      90,
      "Service team",
      180,
      "in-progress",
    ],
    [
      "j3",
      "c1",
      "Routine cleaning",
      day,
      "11:30",
      45,
      "Service team",
      85,
      "scheduled",
    ],
    [
      "j4",
      "c3",
      "Installation",
      day,
      "10:00",
      180,
      "Projects team",
      475,
      "scheduled",
    ],
    [
      "j5",
      "c2",
      "Deep cleaning",
      plusDay(day, 1),
      "09:00",
      120,
      "Service team",
      325,
      "scheduled",
    ],
    [
      "j6",
      "c4",
      "Routine cleaning",
      plusDay(day, 1),
      "12:00",
      45,
      "Service team",
      85,
      "scheduled",
    ],
  ];
  s.jobs = visits.map((v) => ({
    id: v[0],
    customerId: v[1],
    service: v[2],
    date: v[3],
    time: v[4],
    duration: v[5],
    crew: v[6],
    amount: v[7],
    status: v[8],
    notes: s.customers.find((c) => c.id === v[1])!.notes,
  }));
  s.employees = [
    {
      id: "e1",
      name: "Alex Green",
      role: "Crew lead",
      phone: "416-555-0121",
      email: "alex@example.com",
      defaultCrew: "crew1",
      skills: "Cleaning, maintenance",
      notes: "Lead for the Beaches route.",
      availability: "available",
    },
    {
      id: "e2",
      name: "Sam Rivera",
      role: "Service technician",
      phone: "416-555-0122",
      email: "sam@example.com",
      defaultCrew: "crew1",
      skills: "Maintenance, repairs",
      notes: "",
      availability: "available",
    },
    {
      id: "e3",
      name: "Maya Chen",
      role: "Project lead",
      phone: "416-555-0123",
      email: "maya@example.com",
      defaultCrew: "crew2",
      skills: "Installation, project planning",
      notes: "",
      availability: "available",
    },
    {
      id: "e4",
      name: "Jordan Lee",
      role: "Installation technician",
      phone: "416-555-0124",
      email: "jordan@example.com",
      defaultCrew: "crew2",
      skills: "Assembly, installation",
      notes: "",
      availability: "available",
    },
  ];
  s.jobs.forEach((j) => {
    j.employeeIds = j.crew === s.business.crew1 ? ["e1", "e2"] : ["e3", "e4"];
  });
  s.checkIns = [
    ["j1", "e1", "08:27"],
    ["j1", "e2", "08:29"],
    ["j2", "e1", "09:44"],
    ["j2", "e2", "09:52"],
  ].map(([jobId, employeeId, time], i) => ({
    id: "check" + i,
    jobId,
    employeeId,
    recordedAt: new Date(torontoScheduleTime(day, time)).toISOString(),
    scheduledAt: new Date(
      torontoScheduleTime(day, s.jobs.find((j) => j.id === jobId)!.time),
    ).toISOString(),
    employeeName: s.employees!.find((e) => e.id === employeeId)!.name,
    crewName: s.business.crew1,
    source: "office-manual",
  }));
  s.teamIssues = [
    {
      id: "issue1",
      employeeId: "e4",
      jobId: "j4",
      category: "Materials",
      description: "Check the installation supplies before the Chen visit.",
      priority: "normal",
      status: "open",
      createdAt: new Date(torontoScheduleTime(day, "08:15")).toISOString(),
    },
  ];
  const requests: [string, string, string, string, Lead["status"]][] = [
    [
      "l1",
      "c5",
      "Deep cleaning",
      "Hi! Could you do a deep clean next week? Our space is about 1,500 sq ft.",
      "new",
    ],
    [
      "l2",
      "c6",
      "Maintenance visit",
      "We need a routine maintenance visit. Can you give me a price?",
      "new",
    ],
    [
      "l3",
      "c1",
      "Deep cleaning",
      "Can we book our usual deep clean? Any time after 10 works.",
      "quoted",
    ],
  ];
  s.leads = requests.map((v) => ({
    id: v[0],
    customerId: v[1],
    service: v[2],
    message: v[3],
    status: v[4],
    messages: [{ from: "customer", text: v[3] }],
  }));
  s.quotes = [
    {
      id: "q1",
      leadId: "l3",
      customerId: "c1",
      service: "Deep cleaning",
      amount: 325,
      duration: 120,
      status: "draft",
    },
  ];
  s.invoices = [
    {
      id: "i1",
      jobId: "past1",
      customerId: "c1",
      service: "Routine cleaning",
      amount: 85,
      tax: 11.05,
      due: plusDay(day, -4),
      status: "unpaid",
    },
    {
      id: "i2",
      jobId: "past2",
      customerId: "c3",
      service: "Installation",
      amount: 475,
      tax: 61.75,
      due: plusDay(day, 3),
      status: "unpaid",
    },
    {
      id: "i3",
      jobId: "j1",
      customerId: "c2",
      service: "Routine cleaning",
      amount: 85,
      tax: 11.05,
      due: plusDay(day, 7),
      status: "paid",
    },
  ];
  s.activity = [
    "Patel service visit completed · invoice paid",
    "New deep cleaning request from Michael",
    "Susan’s deep cleaning quote is ready for review",
  ].map((text, i) => ({ id: "a" + i, text, time: new Date().toISOString() }));
  prepareRequestQuotes(s);
  return s;
}
const short = z.string().trim().min(1).max(250),
  note = z.string().trim().max(4000),
  amount = z.coerce.number().min(0).max(100000),
  duration = z.coerce.number().int().min(15).max(480);
const date = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (s) =>
        !isNaN(Date.parse(s + "T12:00:00Z")) &&
        new Date(s + "T12:00:00Z").toISOString().slice(0, 10) === s,
      "Invalid date",
    ),
  time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const prospectId = z.string().regex(/^(node|way|relation):[1-9]\d{0,15}$/);
const publicWebsite = z
  .string()
  .max(1000)
  .refine((value) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return (
        ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
      );
    } catch {
      return false;
    }
  }, "Invalid public website");
const prospectSchema = z
  .object({
    id: prospectId,
    name: short,
    address: z.string().trim().max(500),
    area: short,
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    category: z.enum(["property", "hospitality", "community"]),
    website: publicWebsite,
    phone: z.string().max(100),
    sourceUrl: z.string().url().max(250),
    distanceKm: z.number().min(0).max(5.1),
    foundAt: z.string().datetime(),
  })
  .strict()
  .refine(
    (p) =>
      p.sourceUrl === "https://www.openstreetmap.org/" + p.id.replace(":", "/"),
    "Source must match the public listing",
  );
export const schemas = {
  ...customerFollowupSchemas,
  "outreach-permission": outreachPermissionSchema,
  ask: askSchema,
  ...bookingActionSchemas,
  ...requestQuoteSchemas,
  ...automationSchemas,
  ...documentSchemas,
  ...teamSchemas,
  "notification-preferences": notificationPreferencesSchema,
  "save-prospect": prospectSchema,
  "remove-prospect": z.object({ id: prospectId }),
  appearance: appearanceSchema,
  customer: z.object({
    id: z.string().optional(),
    name: short,
    email: z.union([z.string().email(), z.literal("")]),
    phone: z.string().max(80),
    address: short,
    area: short,
    notes: note,
    recurring: short,
  }),
  request: z.object({
    customerId: short,
    service: short,
    message: note.min(1),
  }),
  quote: z.object({ leadId: short, amount, duration }),
  book: z.object({ quoteId: short, date, time, crew: short }),
  job: z.object({
    customerId: short,
    service: short,
    date,
    time,
    duration,
    crew: short,
    amount,
    notes: note,
  }),
  start: z.object({ id: short }),
  complete: z.object({ id: short }),
  paid: z.object({ id: short }),
  reply: z.object({ id: short, text: note.min(1) }),
  reschedule: z.object({ date }),
  onboarding: z.object({ dismissed: z.boolean() }).strict(),
  settings: z
    .object({
      name: short,
      owner: short,
      city: short,
      tax: z.coerce.number().min(0).max(30),
      crew1: short,
      crew2: short,
    })
    .refine((v) => v.crew1 !== v.crew2, "Give each crew a different name"),
  rates: z
    .array(z.object({ service: short, price: amount, duration }))
    .min(1)
    .max(20),
  reset: z.object({ empty: z.boolean() }),
  chat: z.object({
    role: z.enum(["user", "assistant"]),
    text: note.min(1),
    intent: z.string().max(80).optional(),
  }),
  reminders: z.object({}),
  campaign: z.object({ service: short.optional() }),
};
export type ActionName = keyof typeof schemas;
export function validateAction(action: string, payload: unknown) {
  if (!Object.hasOwn(schemas, action)) throw new Error("Unknown action");
  return schemas[action as ActionName].parse(payload);
}
const mins = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
function slotValid(
  s: Workspace,
  j: Pick<Job, "date" | "time" | "duration" | "crew" | "employeeIds">,
  ignore?: string,
) {
  const start = mins(j.time);
  if (start < 480 || start + j.duration > 1080)
    throw new Error("Choose a slot between 8 am and 6 pm.");
  if (
    s.jobs.some(
      (x) =>
        x.id !== ignore &&
        x.date === j.date &&
        x.crew === j.crew &&
        x.status !== "complete" &&
        start < mins(x.time) + x.duration &&
        start + j.duration > mins(x.time),
    )
  )
    throw new Error(
      "This crew already has a job in that slot. Choose another time.",
    );
  assertEmployeeSlot(s, j, ignore);
}
function customerCheck(s: Workspace, c: string) {
  if (!s.customers.some((x) => x.id === c))
    throw new Error("Customer not found.");
}
function crewCheck(s: Workspace, c: string) {
  if (![s.business.crew1, s.business.crew2].includes(c))
    throw new Error("Choose an existing crew.");
}
export function reschedulePlan(s: Workspace, date: string) {
  const copy = structuredClone(s),
    affected = copy.jobs.filter(
      (j) =>
        j.date === date &&
        j.status === "scheduled" &&
        !(copy.checkIns || []).some((c) => c.jobId === j.id),
    ),
    plan: { id: string; date: string; time: string }[] = [];
  for (const job of affected) {
    let found = false;
    for (let day = 1; day <= 14 && !found; day++) {
      const target = plusDay(date, day);
      for (let t = 600; t + job.duration <= 1080; t += 15) {
        const time =
          String(Math.floor(t / 60)).padStart(2, "0") +
          ":" +
          String(t % 60).padStart(2, "0");
        try {
          slotValid(copy, { ...job, date: target, time }, job.id);
          job.date = target;
          job.time = time;
          plan.push({ id: job.id, date: target, time });
          found = true;
          break;
        } catch {}
      }
    }
    if (!found)
      throw new Error(
        "No room in the next 14 days. Please reschedule manually.",
      );
  }
  return plan;
}
export function applyAction(
  state: Workspace,
  action: ActionName,
  payload: unknown,
  now = new Date(),
  preview = false,
  automationRecords: DocumentRecord[] = [],
): Workspace {
  // The validated action map is the boundary for this preserved reducer; branch schemas are regression-tested.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: any = validateAction(action, payload);
  const s = structuredClone(state);
  let activity = "";
  if (action === "reset") {
    const fresh = seed(p.empty);
    if (s.appearance) fresh.appearance = s.appearance;
    return fresh;
  }
  if (Object.hasOwn(bookingActionSchemas, action)) {
    if (action === "preview-booking-request") {
      if (!s.sample && !preview)
        throw new Error("Real quote texts use the connected business number.");
      return prepareBooking(s, p, "https://example.invalid", now, true).state;
    }
    if (action === "preview-booking-reply") {
      if (!s.sample && !preview)
        throw new Error("Only verified customer texts can approve a booking.");
      return recordBookingReply(s, p.id, p.text, crypto.randomUUID(), now);
    }
    const booking = s.bookingApprovals?.find((b) => b.id === p.id);
    if (!booking) throw new Error("Booking request not found.");
    if (action === "booking-read") booking.unread = false;
    if (action === "booking-cancel" && booking.decision === "pending") {
      booking.decision = "cancelled";
      booking.unread = false;
      activity = "Pending quote request cancelled; no job booked";
    }
    if (!activity) return s;
  }
  if (action === "prepare-request-quotes") {
    prepareRequestQuotes(s, now);
    return s;
  }
  if (action === "approve-request-quote") {
    approveRequestQuote(s, p.id, p.reviewedSnapshot, now);
    return s;
  }
  if (Object.hasOwn(automationSchemas, action))
    return applyAutomationAction(
      s,
      action as AutomationAction,
      p,
      s.sample || preview ? s.documentPreviews || [] : automationRecords,
      now,
      s.sample || preview,
    );
  if (Object.hasOwn(documentSchemas, action)) {
    const next = applyDocumentAction(
      s,
      action as keyof typeof documentSchemas,
      p,
      now,
      preview,
    );
    next.activity.unshift({
      id: id(),
      text:
        action === "letterhead"
          ? "Letterhead updated"
          : action === "customer-quote"
            ? "Customer quote saved"
            : action === "preview-decision"
              ? "Example quote response recorded"
              : "Document preview updated",
      time: now.toISOString(),
    });
    next.activity = next.activity.slice(0, 80);
    return next;
  }
  if (Object.hasOwn(teamSchemas, action))
    activity = applyTeamAction(s, action as TeamAction, p, now);
  if (action === "save-prospect") {
    if (
      s.customers.some(
        (c) => c.name.trim().toLowerCase() === p.name.trim().toLowerCase(),
      )
    )
      throw new Error("This business is already a customer.");
    s.prospects ??= [];
    if (s.prospects.some((x) => x.id === p.id)) return s;
    if (s.prospects.length >= 100)
      throw new Error(
        "Your shortlist is full. Remove a prospect before saving another.",
      );
    s.prospects.unshift(p);
    activity = `Prospect saved: ${p.name}`;
  }
  if (action === "remove-prospect") {
    s.prospects = (s.prospects || []).filter((x) => x.id !== p.id);
    activity = "Prospect removed from shortlist";
  }
  if (Object.hasOwn(customerFollowupSchemas, action))
    activity = applyCustomerFollowup(
      s,
      action as CustomerFollowupAction,
      p,
      now,
    );
  if (action === "appearance") {
    s.appearance = p;
    activity = "Appearance updated";
  }
  if (action === "notification-preferences") {
    s.notificationPreferences = p;
    activity =
      p.lateTexts === "automatic"
        ? "Automatic late-arrival texts enabled"
        : p.lateTexts === "off"
          ? "Proactive late-arrival texts turned off"
          : "Late-arrival texts require approval";
  }
  if (action === "customer") {
    if (p.id) {
      const i = s.customers.findIndex((c) => c.id === p.id);
      if (i < 0) throw new Error("Customer not found");
      s.customers[i] = {
        ...p,
        ...(outreachPhone(s.customers[i].phone) === outreachPhone(p.phone) &&
        s.customers[i].outreachPermission
          ? { outreachPermission: s.customers[i].outreachPermission }
          : {}),
      };
    } else s.customers.push({ ...p, id: id() });
    activity = `Customer details saved for ${p.name}`;
  }
  if (action === "request") {
    customerCheck(s, p.customerId);
    s.leads.unshift({
      ...p,
      id: id(),
      status: "new",
      messages: [{ from: "customer", text: p.message }],
    });
    prepareRequestQuotes(s, now);
    activity = "Customer request recorded · quote drafted for your approval";
  }
  if (action === "quote") {
    const l = s.leads.find((l) => l.id === p.leadId);
    if (!l || l.status === "booked") throw new Error("Request is unavailable");
    const q = s.quotes.find((q) => q.leadId === l.id);
    if (q) {
      if (
        (q.items && !q.ownerReview) ||
        s.documentPreviews?.some((r) => r.entityId === q.id)
      )
        throw new Error("Edit this quote from Money or create a new quote.");
      q.amount = p.amount;
      q.duration = p.duration;
      if (q.ownerReview) {
        if (q.items && q.items.length !== 1)
          throw new Error("Edit this itemized quote from Money.");
        q.items = [
          { description: q.service, quantity: 1, unitPrice: p.amount },
        ];
        q.taxRate = s.business.tax;
        q.ownerReview = { status: "pending", pricing: "reviewed" };
      }
    } else
      s.quotes.push({
        id: id(),
        leadId: l.id,
        customerId: l.customerId,
        service: l.service,
        amount: p.amount,
        duration: p.duration,
        status: "draft",
      });
    l.status = "quoted";
    activity = "Quote created for review";
  }
  if (action === "book") {
    const q = s.quotes.find((q) => q.id === p.quoteId);
    if (!q || q.status === "accepted")
      throw new Error("This quote has already been booked or is unavailable.");
    assertQuoteApproved(s, q, now);
    const preview = s.documentPreviews?.find(
      (r) => r.entityId === q.id && r.kind === "quote",
    );
    if (
      q.ownerReview &&
      !q.approvedDocument &&
      preview?.decision !== "approved"
    )
      throw new Error(
        "Wait for the customer to accept this quote before booking.",
      );
    if (preview && preview.decision !== "approved")
      throw new Error(
        "Wait for the customer to approve this quote before booking.",
      );
    if (preview) q.approvedDocument = preview.document;
    crewCheck(s, p.crew);
    slotValid(s, { ...p, duration: q.duration });
    s.jobs.push({
      sourceQuoteId: q.id,
      employeeIds: [],
      id: id(),
      customerId: q.customerId,
      service: q.service,
      date: p.date,
      time: p.time,
      duration: q.duration,
      crew: p.crew,
      amount: q.amount,
      status: "scheduled",
      notes: quoteJobNotes(
        q.approvedDocument || makeDocument(s, "quote", q.id, now),
        s.customers.find((c) => c.id === q.customerId)?.notes || "",
      ),
    });
    const bookedJob = s.jobs[s.jobs.length - 1];
    const existingInvoice = s.invoices.find((i) => i.sourceQuoteId === q.id);
    if (existingInvoice) existingInvoice.jobId = bookedJob.id;
    q.status = "accepted";
    const l = s.leads.find((l) => l.id === q.leadId);
    if (l) l.status = "booked";
    activity = `${q.service} booked for ${dateLabel(p.date)}`;
  }
  if (action === "job") {
    customerCheck(s, p.customerId);
    crewCheck(s, p.crew);
    slotValid(s, p);
    s.jobs.push({ ...p, employeeIds: [], id: id(), status: "scheduled" });
    activity = `${p.service} added to the schedule`;
  }
  if (action === "start" || action === "complete") {
    const j = s.jobs.find((j) => j.id === p.id);
    if (!j) throw new Error("Job not found");
    if (action === "start" && j.status === "complete")
      throw new Error("This job is already complete");
    j.status = action === "start" ? "in-progress" : "complete";
    const approved = j.sourceQuoteId
      ? s.quotes.find((q) => q.id === j.sourceQuoteId)?.approvedDocument
      : undefined;
    if (action === "complete" && approved) {
      const invoiced = invoiceFromQuote(s, j.sourceQuoteId!, approved, now);
      s.invoices = invoiced.invoices;
    }
    if (
      action === "complete" &&
      !s.invoices.some(
        (i) =>
          i.jobId === j.id ||
          (j.sourceQuoteId && i.sourceQuoteId === j.sourceQuoteId),
      )
    )
      s.invoices.push({
        sourceQuoteId: j.sourceQuoteId,
        id: id(),
        jobId: j.id,
        customerId: j.customerId,
        service: j.service,
        amount: j.amount,
        tax:
          j.sourceQuoteId && s.quotes.some((q) => q.id === j.sourceQuoteId)
            ? quoteTotals(
                s.quotes.find((q) => q.id === j.sourceQuoteId)!,
                s.business.tax,
              ).tax
            : Math.round(j.amount * s.business.tax) / 100,
        due: plusDay(today(), 7),
        status: "unpaid",
      });
    activity =
      action === "complete"
        ? `${j.service} complete · invoice created`
        : `${j.service} started`;
  }
  if (action === "paid") {
    const i = s.invoices.find((i) => i.id === p.id);
    if (!i) throw new Error("Invoice not found");
    if (i.status === "paid") return s;
    i.status = "paid";
    i.paidAt = now.toISOString();
    for (const task of s.automationTasks || []) {
      if (
        task.rule === "invoiceFollowUps" &&
        task.entityId === i.id &&
        task.status === "pending"
      ) {
        task.status = "cancelled";
        task.updatedAt = now.toISOString();
      }
    }
    activity = "Invoice marked paid and archived";
  }
  if (action === "reply") {
    const l = s.leads.find((l) => l.id === p.id);
    if (!l) throw new Error("Request not found");
    l.messages.push({ from: "office", text: p.text });
    activity = "Reply saved to the conversation (not sent)";
  }
  if (action === "reschedule") {
    const plan = reschedulePlan(s, p.date);
    for (const x of plan) {
      const j = s.jobs.find((j) => j.id === x.id)!;
      j.date = x.date;
      j.time = x.time;
    }
    activity = `${plan.length} jobs rescheduled · customer messages need sending`;
  }
  if (action === "outreach-permission") {
    const c = s.customers.find((c) => c.id === p.id);
    if (!c) throw new Error("Customer not found.");
    const phone = outreachPhone(c.phone);
    if (p.allowed && !phone)
      throw new Error(
        "Add a real mobile number with country code before enabling offers.",
      );
    c.outreachPermission = {
      allowed: p.allowed,
      phone,
      updatedAt: now.toISOString(),
    };
    activity = p.allowed
      ? "Customer offer permission recorded"
      : "Customer offers turned off";
  }
  if (action === "settings") {
    const prev = s.business;
    s.jobs.forEach((j) => {
      if (j.crew === prev.crew1) j.crew = p.crew1;
      else if (j.crew === prev.crew2) j.crew = p.crew2;
    });
    s.business = p;
    if(s.onboarding)s.onboarding.completed=true;
    activity = "Business settings updated";
  }
  if (action === "onboarding") {
    s.onboarding = {...(s.onboarding || {completed:true}), dismissed:p.dismissed};
    activity = p.dismissed ? "Setup checklist hidden" : "Setup checklist reopened";
  }
  if (action === "rates") {
    s.rates = p;
    activity = "Service pricing updated";
  }
  if (action === "chat") {
    s.chat.push({ id: id(), ...p });
    s.chat = s.chat.slice(-100);
  }
  if (action === "ask") {
    const existing = s.chat.find((m) => m.id === p.id);
    if (existing) {
      if (
        existing.text !== p.text ||
        JSON.stringify(existing.image) !== JSON.stringify(p.image)
      )
        throw new Error("This message has changed. Please send it again.");
      return s;
    }
    const answer = p.image
      ? {
          text: "Photo attached to your conversation. Image analysis isn’t connected yet. Describe what you need help with in a message.",
        }
      : assistantReply(s, p.text);
    s.chat.push(
      {
        id: p.id,
        role: "user",
        text: p.text,
        ...(p.image ? { image: p.image } : {}),
      },
      { id: p.id + ":reply", role: "assistant", ...answer },
    );
    s.chat = s.chat.slice(-100);
  }
  if (action === "reminders") {
    let count = 0;
    for (const i of s.invoices.filter((i) => i.status === "unpaid")) {
      const c = s.customers.find((c) => c.id === i.customerId)!;
      s.leads.unshift({
        id: id(),
        customerId: c.id,
        service: i.service,
        message: "Payment follow-up",
        status: "booked",
        messages: [
          {
            from: "office",
            text: `Hi ${c.name.split(" ")[0]}, a friendly reminder that your ${i.service.toLowerCase()} invoice for ${money(i.amount + i.tax)} is due ${dateLabel(i.due)}. Thank you!`,
          },
        ],
      });
      count++;
    }
    activity = `${count} payment reminders drafted · not sent`;
  }
  if (action === "campaign") {
    const service = p.service || s.rates[0]?.service;
    if (!service || !s.rates.some((rate) => rate.service === service))
      throw new Error("Choose a service from your service pricing first.");
    let count = 0;
    for (const c of s.customers) {
      if (
        s.jobs.some((j) => j.customerId === c.id && j.service === service) ||
        s.leads.some((l) => l.customerId === c.id && l.service === service)
      )
        continue;
      s.leads.unshift({
        id: id(),
        customerId: c.id,
        service,
        message: `${service} offer`,
        status: "new",
        messages: [
          {
            from: "office",
            text: `Hi ${c.name.split(" ")[0]}, we’re booking ${service.toLowerCase()} in ${c.area}. Would you like a quote?`,
          },
        ],
      });
      count++;
    }
    activity = `${count} ${service.toLowerCase()} offers drafted · not sent`;
  }
  if (activity) {
    s.activity.unshift({
      id: id(),
      text: activity,
      time: new Date().toISOString(),
    });
    s.activity = s.activity.slice(0, 80);
  }
  return s;
}
export function assistantReply(
  s: Workspace,
  text: string,
): { text: string; intent?: string } {
  const t = text.toLowerCase(),
    unpaid = s.invoices.filter((i) => i.status === "unpaid"),
    total = unpaid.reduce((a, i) => a + i.amount + i.tax, 0),
    day = t.includes("tomorrow") ? plusDay(today(), 1) : today(),
    jobs = s.jobs.filter((j) => j.date === day && j.status !== "complete");
  if (
    /\b(order|find|buy|need)\b.{0,30}\b(parts?|materials?|supplies)\b/.test(t)
  )
    return {
      text: "What part do you need? Add the equipment make and model, part name or number, and quantity. Would you prefer pickup or delivery? You can attach a photo for reference. Supplier stock checks and ordering aren’t connected yet.",
    };
  if (/rain|weather|move|reschedule/.test(t)) {
    const plan = reschedulePlan(s, day);
    return {
      text: plan.length
        ? `I can move ${plan.length} unstarted jobs from ${dateLabel(day)} into available crew slots. I’ve checked for overlapping appointments. Review the plan below; customers still need to be notified.`
        : "There are no unfinished jobs on that day to move.",
      intent: plan.length ? "rain:" + day : undefined,
    };
  }
  if (/remind|chase|follow.up/.test(t))
    return {
      text: `There are ${unpaid.length} unpaid invoices totalling ${money(total)}. I can prepare a friendly reminder for each customer in the inbox. Review and copy them before sending.`,
      intent: unpaid.length ? "reminders" : undefined,
    };
  if (/unpaid|hasn.t paid|not paid|who.*paid|owe[sd]?|outstanding/.test(t))
    return {
      text: unpaid.length
        ? `${unpaid.length} invoices are unpaid, totalling ${money(total)}:\n\n${unpaid.map((i) => `${s.customers.find((c) => c.id === i.customerId)?.name}: ${money(i.amount + i.tax)} · ${i.due < today() ? "overdue" : "due " + dateLabel(i.due)}`).join("\n")}\n\nAsk me to draft reminders when you’re ready.`
        : "All invoices are paid. Nothing outstanding.",
    };
  if (/fill|sell|offer|fall cleanup|more work/.test(t))
    return {
      text: "Choose one of your services and I can draft offers for customers who don’t already have a request or booking for it. Each message uses the customer’s name and neighbourhood. Review the drafts in your inbox before sending.",
      intent: "campaign",
    };
  if (/quote|request|inbox/.test(t)) {
    const leads = s.leads.filter((l) => l.status === "new");
    return {
      text: `You have ${leads.length} new requests. ${leads.map((l) => `${s.customers.find((c) => c.id === l.customerId)?.name} is asking about ${l.service.toLowerCase()}`).join("; ")}. Quotes are prepared from your service pricing. Open Activity to review and approve the drafts.`,
      intent: "inbox",
    };
  }
  if (/route|schedule|today|tomorrow|crew/.test(t))
    return {
      text: `${dateLabel(day)} has ${jobs.length} unfinished visits:\n\n${jobs.map((j) => `${timeLabel(j.time)} · ${s.customers.find((c) => c.id === j.customerId)?.name} · ${j.service} · ${j.crew}`).join("\n") || "No visits scheduled."}\n\nThe schedule shows crew assignments and property instructions. Route order is by appointment time; travel times aren’t calculated.`,
      intent: "schedule",
    };
  if (/made|earn|revenue|week|doing|summary/.test(t)) {
    const upcoming = s.jobs.filter(
        (j) => j.date >= today() && j.date < plusDay(today(), 7),
      ),
      paid = s.invoices
        .filter((i) => i.status === "paid")
        .reduce((a, i) => a + i.amount, 0);
    return {
      text: `Here’s your office snapshot:\n\n• ${upcoming.length} visits over the next 7 days, worth ${money(upcoming.reduce((a, j) => a + j.amount, 0))} before tax.\n• ${money(paid)} collected before tax across recorded paid invoices.\n• ${money(total)} outstanding including tax.\n• ${s.leads.filter((l) => l.status === "new").length} new customer requests.\n\nReview the requests and book your ready quotes to keep work moving.`,
    };
  }
  return {
    text: "I can help with your schedule, unpaid invoices, customer requests and service offers. Try “Who hasn’t paid?”, “Reschedule tomorrow’s appointments”, or “Draft service offers”. This trial assistant uses guided commands; open-ended AI needs a live AI connection.",
  };
}
