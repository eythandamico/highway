import { z } from "zod/v3";
import type { Workspace } from "./yardwork.ts";
import { makeDocument } from "./business-documents.ts";

export const recordKinds = ["customers", "quotes", "invoices", "jobs"] as const;
export type RecordKind = (typeof recordKinds)[number];
export type ServiceConnector = {
  id: string;
  name: string;
  category: string;
  description: string;
  monogram: string;
  colour: string;
  source: string;
  zapier?: string;
};
export const connectorCategories = [
  "All services",
  "Accounting",
  "Marketing",
  "Jobs & team",
  "Leads & sales",
  "Automation",
  "Payments",
  "Calendars",
] as const;
// Source links and available connection paths are verified in docs/connectors.md.
export const serviceConnectors: ServiceConnector[] = [
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    category: "Accounting",
    description:
      "Send reviewed customer, quote and invoice details to your accounting workflow.",
    monogram: "qb",
    colour: "#168638",
    source:
      "https://help.getjobber.com/en/articles/how-to-connect-jobber-and-quickbooks-online-new-quickbooks-integration/",
    zapier: "https://zapier.com/apps/quickbooks/integrations",
  },
  {
    id: "xero",
    name: "Xero",
    category: "Accounting",
    description: "Pass customer and invoice details to your Xero workflow.",
    monogram: "xero",
    colour: "#087ca2",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-xero-integration/",
    zapier: "https://zapier.com/apps/xero/integrations",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "Marketing",
    description: "Use selected customer records in your marketing workflow.",
    monogram: "Mc",
    colour: "#826019",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-mailchimp-integration/",
    zapier: "https://zapier.com/apps/mailchimp/integrations",
  },
  {
    id: "nicejob",
    name: "NiceJob",
    category: "Marketing",
    description: "Use completed job details in your review-request workflow.",
    monogram: "nj",
    colour: "#2868aa",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-nicejob-reviews-and-referrals/",
    zapier: "https://zapier.com/apps/nicejob/integrations",
  },
  {
    id: "companycam",
    name: "CompanyCam",
    category: "Jobs & team",
    description:
      "Send job and property details to your project-photo workflow.",
    monogram: "CC",
    colour: "#1969a7",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-companycam-integration/",
    zapier: "https://zapier.com/apps/companycam/integrations",
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Automation",
    description:
      "Connect your reviewed Yardwork records to other apps and workflows.",
    monogram: "Z",
    colour: "#bd4917",
    source:
      "https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zap-workflows-from-webhooks",
    zapier: "https://zapier.com/apps/webhook/integrations",
  },
  {
    id: "gusto",
    name: "Gusto",
    category: "Jobs & team",
    description: "Payroll and employee expenses.",
    monogram: "Gu",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-gusto-integration/",
  },
  {
    id: "angi",
    name: "Angi Leads",
    category: "Leads & sales",
    description: "New leads from Angi.",
    monogram: "A",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-angi-leads-integration/",
  },
  {
    id: "thumbtack",
    name: "Thumbtack",
    category: "Leads & sales",
    description: "Local customer requests and leads.",
    monogram: "T",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-thumbtack-integration/",
  },
  {
    id: "google-lsa",
    name: "Google Local Services Ads",
    category: "Leads & sales",
    description: "Local advertising and booking requests.",
    monogram: "G",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-googles-local-services-ads/",
  },
  {
    id: "google-business",
    name: "Google Business Profile",
    category: "Leads & sales",
    description: "Business discovery and booking links.",
    monogram: "G",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-google-business-profiles/",
  },
  {
    id: "loyalas",
    name: "LoyalAs",
    category: "Marketing",
    description: "Customer referral programs.",
    monogram: "L",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-loyalas-integration/",
  },
  {
    id: "broadly",
    name: "Broadly",
    category: "Marketing",
    description: "Customer reviews and communication.",
    monogram: "B",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-broadly-integration/",
  },
  {
    id: "sendjim",
    name: "SendJim",
    category: "Marketing",
    description: "Direct-mail marketing campaigns.",
    monogram: "SJ",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-sendjim-integration/",
  },
  {
    id: "quo",
    name: "Quo",
    category: "Jobs & team",
    description: "Business calls and texts. Formerly OpenPhone.",
    monogram: "Q",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-quo-integration/",
  },
  {
    id: "callrail",
    name: "CallRail",
    category: "Marketing",
    description: "Call tracking and marketing attribution.",
    monogram: "CR",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-callrail-integration/",
  },
  {
    id: "hatch",
    name: "Hatch",
    category: "Leads & sales",
    description: "Sales conversations and follow-ups.",
    monogram: "H",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-hatch-integration/",
  },
  {
    id: "docusign",
    name: "DocuSign",
    category: "Jobs & team",
    description: "Customer documents and signatures.",
    monogram: "D",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-docusign-integration/",
  },
  {
    id: "eagleview",
    name: "Eagleview",
    category: "Jobs & team",
    description: "Property measurements and estimating.",
    monogram: "E",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-eagleview-integration/",
  },
  {
    id: "responsibid",
    name: "ResponsiBid",
    category: "Leads & sales",
    description: "Bidding and quoting workflows.",
    monogram: "R",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-responsibid-integration/",
  },
  {
    id: "home-depot",
    name: "The Home Depot",
    category: "Jobs & team",
    description: "Material catalogs and pricing.",
    monogram: "HD",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-the-home-depot-integration/",
  },
  {
    id: "azuga",
    name: "Azuga Fleet",
    category: "Jobs & team",
    description: "Fleet location and vehicle tracking.",
    monogram: "Az",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-azuga-fleet-integration/",
  },
  {
    id: "force",
    name: "Force Fleet Tracking",
    category: "Jobs & team",
    description: "Vehicle locations and fleet insights.",
    monogram: "F",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-force-fleet-tracking/",
  },
  {
    id: "fleetsharp",
    name: "FleetSharp",
    category: "Jobs & team",
    description: "GPS tracking for your fleet.",
    monogram: "FS",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-fleetsharp-gps-tracking-integration/",
  },
  {
    id: "wix",
    name: "Wix",
    category: "Leads & sales",
    description: "Website booking and request forms.",
    monogram: "W",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-wix-plugin-for-online-booking-and-requests/",
  },
  {
    id: "wordpress",
    name: "WordPress",
    category: "Leads & sales",
    description: "Website booking and request forms.",
    monogram: "WP",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-wordpress-plugin-for-online-booking-and-requests/",
  },
  {
    id: "nicejob-sites",
    name: "NiceJob Sites",
    category: "Marketing",
    description: "Websites and lead capture. Also called Convert.",
    monogram: "nj",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-nicejob-convert-websites/",
  },
  {
    id: "wisetack",
    name: "Wisetack",
    category: "Payments",
    description: "Customer financing, subject to provider approval.",
    monogram: "W",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-wisetack-consumer-financing-integration/",
  },
  {
    id: "fundbox",
    name: "Fundbox",
    category: "Payments",
    description: "Business financing, subject to provider approval.",
    monogram: "F",
    colour: "#586e60",
    source:
      "https://help.getjobber.com/en/articles/jobber-and-fundbox-integration/",
  },
  {
    id: "reports",
    name: "Report Scheduler",
    category: "Automation",
    description: "Scheduled business reports. Jobber-specific app.",
    monogram: "RS",
    colour: "#586e60",
    source: "https://help.getjobber.com/en/articles/report-scheduler-app/",
  },
  {
    id: "square",
    name: "Square",
    category: "Payments",
    description: "Online payment processing.",
    monogram: "Sq",
    colour: "#526b8e",
    source: "https://help.getjobber.com/en/articles/payment-integrations/",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    description: "Online payment processing.",
    monogram: "S",
    colour: "#526b8e",
    source: "https://help.getjobber.com/en/articles/payment-integrations/",
  },
  {
    id: "paypal",
    name: "PayPal Express",
    category: "Payments",
    description: "Online payment processing.",
    monogram: "PP",
    colour: "#526b8e",
    source: "https://help.getjobber.com/en/articles/payment-integrations/",
  },
  {
    id: "authorize",
    name: "Authorize.net",
    category: "Payments",
    description: "Online payment processing.",
    monogram: "A",
    colour: "#526b8e",
    source: "https://help.getjobber.com/en/articles/payment-integrations/",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    category: "Calendars",
    description: "Calendar visibility. Jobber supports calendar feeds.",
    monogram: "G",
    colour: "#426d86",
    source: "https://help.getjobber.com/en/articles/calendar-syncing/",
  },
  {
    id: "apple-calendar",
    name: "Apple Calendar",
    category: "Calendars",
    description: "Calendar visibility. Jobber supports calendar feeds.",
    monogram: "31",
    colour: "#426d86",
    source: "https://help.getjobber.com/en/articles/calendar-syncing/",
  },
  {
    id: "outlook",
    name: "Outlook Calendar",
    category: "Calendars",
    description: "Calendar visibility. Jobber supports calendar feeds.",
    monogram: "O",
    colour: "#426d86",
    source: "https://help.getjobber.com/en/articles/calendar-syncing/",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "Automation",
    description: "Connect business information to your assistant.",
    monogram: "AI",
    colour: "#596b5b",
    source:
      "https://help.getjobber.com/en/articles/connect-jobber-to-claude-and-chatgpt/",
  },
  {
    id: "claude",
    name: "Claude",
    category: "Automation",
    description: "Connect business information to your assistant.",
    monogram: "C",
    colour: "#596b5b",
    source:
      "https://help.getjobber.com/en/articles/connect-jobber-to-claude-and-chatgpt/",
  },
];
export function connectorById(id: string) {
  return serviceConnectors.find((service) => service.id === id);
}
export const hookSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((value) => {
    try {
      const u = new URL(value);
      return (
        u.protocol === "https:" &&
        u.hostname === "hooks.zapier.com" &&
        !u.port &&
        !u.username &&
        !u.password &&
        !u.search &&
        !u.hash &&
        /^\/hooks\/catch\/\d+\/[a-zA-Z0-9_-]+\/?$/.test(u.pathname)
      );
    } catch {
      return false;
    }
  }, "Paste a Webhooks by Zapier Catch Hook URL beginning https://hooks.zapier.com/hooks/catch/.");
const connectorId = z.string().uuid(),
  serviceId = z
    .string()
    .refine(
      (id) => !!connectorById(id)?.zapier,
      "This service needs a separate provider integration.",
    );
const records = {
  kind: z.enum(recordKinds),
  ids: z
    .array(z.string().min(1).max(250))
    .length(1)
    .refine((ids) => new Set(ids).size === ids.length),
};
export const connectorAction = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("connect"),
      service: serviceId,
      kind: z.enum(recordKinds),
      hook: hookSchema,
      consent: z.literal(true),
    })
    .strict(),
  z.object({ action: z.literal("disconnect"), id: connectorId }).strict(),
  z
    .object({ action: z.literal("preview"), id: connectorId, ...records })
    .strict(),
  z
    .object({
      action: z.literal("send"),
      id: connectorId,
      ...records,
      reviewedHash: z.string().regex(/^[a-f0-9]{64}$/),
      consent: z.literal(true),
    })
    .strict(),
]);
export type ConnectorConnection = {
  id: string;
  service: string;
  createdAt: string;
  lastAcceptedAt: string | null;
};
export type ConnectorDelivery = {
  id: string;
  connectorId: string;
  kind: RecordKind;
  count: number;
  status: "sending" | "accepted" | "failed" | "unknown";
  createdAt: string;
};

export function connectorRecords(
  s: Workspace,
  kind: RecordKind,
  ids: string[],
) {
  if (ids.length !== 1)
    throw new Error("Choose one record to review and send.");
  const customer = (id: string) => {
    const c = s.customers.find((c) => c.id === id);
    if (!c)
      throw new Error(
        "A customer is no longer available. Refresh and review again.",
      );
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
    };
  };
  return ids.map((id) => {
    if (kind === "customers") return customer(id);
    if (kind === "jobs") {
      const job = s.jobs.find((j) => j.id === id);
      if (!job) throw new Error("A job is no longer available.");
      return {
        id: job.id,
        service: job.service,
        date: job.date,
        time: job.time,
        timeZone: "America/Toronto",
        duration: job.duration,
        crew: job.crew,
        status: job.status,
        amountBeforeTax: job.amount,
        currency: "CAD",
        customer: customer(job.customerId),
      };
    }
    if (kind === "quotes") {
      const quote = s.quotes.find((q) => q.id === id);
      if (!quote) throw new Error("A quote is no longer available.");
      const booking = s.bookingApprovals?.find(
          (b) =>
            b.quoteId === id &&
            ["pending", "approved", "conflict"].includes(b.decision),
        ),
        delivery = [
          ...(s.quoteDeliveries || []),
          ...(s.documentPreviews || []),
        ].find((r) => r.kind === "quote" && r.entityId === id);
      const d =
        booking?.document ||
        delivery?.document ||
        quote.approvedDocument ||
        makeDocument(s, "quote", id);
      return {
        id,
        number: d.number,
        status: booking?.decision || delivery?.decision || quote.status,
        service: quote.service,
        validUntil: d.due,
        duration: quote.duration,
        customer: customer(quote.customerId),
        items: d.items,
        subtotal: d.subtotal,
        tax: d.tax,
        total: d.total,
        currency: "CAD",
      };
    }
    const invoice = s.invoices.find((i) => i.id === id);
    if (!invoice) throw new Error("An invoice is no longer available.");
    const d = makeDocument(s, "invoice", id);
    return {
      id,
      number: d.number,
      status: invoice.status,
      paidAt: invoice.paidAt || null,
      due: invoice.due,
      service: invoice.service,
      customer: customer(invoice.customerId),
      items: d.items,
      subtotal: d.subtotal,
      tax: d.tax,
      total: d.total,
      currency: "CAD",
    };
  });
}

export function connectorTestRecord(kind: RecordKind) {
  const customer = {
    id: "yardwork-setup-only",
    name: "SETUP SAMPLE — do not import",
    email: "setup@example.invalid",
    phone: "",
    address: "Sample address — not a real property",
  };
  if (kind === "customers") return customer;
  if (kind === "jobs")
    return {
      id: "yardwork-setup-only",
      service: "Setup sample",
      date: "2099-01-01",
      time: "09:00",
      timeZone: "America/Toronto",
      duration: 60,
      crew: "Setup sample",
      status: "scheduled",
      amountBeforeTax: 1,
      currency: "CAD",
      customer,
    };
  const document = {
    id: "yardwork-setup-only",
    number: "SETUP-ONLY",
    status: kind === "quotes" ? "draft" : "unpaid",
    service: "Setup sample",
    customer,
    items: [
      {
        description: "Setup sample — do not import",
        quantity: 1,
        unitPrice: 1,
      },
    ],
    subtotal: 1,
    tax: 0,
    total: 1,
    currency: "CAD",
  };
  return kind === "quotes"
    ? { ...document, validUntil: "2099-01-01", duration: 60 }
    : { ...document, due: "2099-01-01", paidAt: null };
}
