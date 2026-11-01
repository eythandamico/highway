"use client";
import { NativeSelect } from "../../../../../packages/highway-react/src/components/ui/native-select";
import { useState } from "react";
import { useOffice } from "./context";
import { Modal, Button, Status, Tabs, Fields, Confirm } from "./shared";
import {
  outreachCandidates,
  outreachBody,
  type OutreachInput,
} from "../../lib/yardwork/lead-outreach";
import type { SocialResult } from "../../lib/yardwork/social-leads";
import type {
  ProspectArea,
  Prospect,
  ProspectCategory,
} from "../../lib/yardwork/prospect-search";
export default function FindWork({
  date,
  crew,
  onClose,
}: {
  date: string;
  crew: string;
  onClose: () => void;
}) {
  const { state, request, demo, mutate, refresh } = useOffice(),
    [tab, setTab] = useState("customers"),
    [input, setInput] = useState<OutreachInput>({
      date,
      crew,
      area: state.customers[0]?.area || state.business.city,
      service: state.rates[0]?.service || "",
      lapsedDays: 30,
    }),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [confirm, setConfirm] = useState(false),
    [social, setSocial] = useState<SocialResult | null>(null),
    [areas, setAreas] = useState<ProspectArea[]>([]),
    [area, setArea] = useState<ProspectArea | null>(null),
    [category, setCategory] = useState<ProspectCategory>("property"),
    [radius, setRadius] = useState<2 | 5>(2),
    [prospects, setProspects] = useState<Prospect[]>([]);
  const candidates = outreachCandidates(state, input);
  async function run(fn: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not complete search.");
    } finally {
      setBusy(false);
    }
  }
  if (confirm)
    return (
      <Confirm
        title="Send reviewed customer invitations?"
        description={`Send an offer for ${input.service} on ${input.date} in ${input.area} to up to 3 eligible customers shown in the list. The server rechecks permission, cooldowns and availability before each message. This does not book work.`}
        label="Send invitations"
        onConfirm={async () => {
          const r = await request<{ attempted: number; reason: string }>(
            "/api/day-leads",
            input,
          );
          setMessage(`${r.attempted} attempted. ${r.reason}`);
          await refresh();
        }}
        onClose={() => setConfirm(false)}
      />
    );
  return (
    <Modal
      title="Find work for an open day"
      description="Match available time with appropriate customers and public opportunities."
      open
      onClose={onClose}
    >
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "customers", label: "Customers" },
          { value: "social", label: "Public posts" },
          { value: "prospects", label: "Nearby businesses" },
          { value: "saved", label: "Shortlist" },
        ]}
      />
      {tab !== "saved" && (
        <Fields
          fields={[
            { name: "area", label: "Neighbourhood / city" },
            {
              name: "service",
              label: "Service",
              options: state.rates.map((r) => ({
                value: r.service,
                label: r.service,
              })),
            },
            ...(tab === "customers"
              ? [
                  { name: "date", label: "Visit date", type: "date" },
                  {
                    name: "crew",
                    label: "Crew",
                    options: [
                      { value: "all", label: "All crews" },
                      ...[state.business.crew1, state.business.crew2].map(
                        (c) => ({ value: c, label: c }),
                      ),
                    ],
                  },
                ]
              : []),
          ]}
          values={input}
          set={(name, value) => setInput((s) => ({ ...s, [name]: value }))}
        />
      )}{" "}
      {tab === "customers" ? (
        <>
          <p className="muted">
            Matches need a past completed visit, no conflicting work or request,
            sufficient open time, current offer permission and a 14-day contact
            cooldown.
          </p>
          {candidates.map((c) => (
            <details className="yw-details" key={c.customer.id}>
              <summary>
                {c.customer.name} · {c.canSend ? "Eligible" : c.reason}
              </summary>
              <p className="yw-wrap">
                {outreachBody(state, c.customer, input, "[CODE]")}
              </p>
              <small className="muted">Last visit {c.lastVisit}</small>
            </details>
          ))}
          {!candidates.length && (
            <p>
              No customers match this day and service yet. Try another
              neighbourhood or date.
            </p>
          )}
          <Button
            disabled={busy || demo || !candidates.some((c) => c.canSend)}
            onClick={() => setConfirm(true)}
          >
            Review invitations
          </Button>
          {demo && (
            <p className="muted">
              Sample records never receive real invitations.
            </p>
          )}
          {state.leadOutreach?.map((o) => (
            <div className="yw-row" key={o.id}>
              <div className="yw-row-main">
                <h3>
                  {state.customers.find((c) => c.id === o.customerId)?.name}
                </h3>
                <p>
                  {o.date} · {o.service}
                </p>
              </div>
              <Status>{o.status}</Status>
            </div>
          ))}
        </>
      ) : tab === "social" ? (
        <>
          <p className="muted">
            Searches indexed public pages only. Private groups are not accessed;
            a match is not a confirmed customer request.
          </p>
          <Button
            disabled={busy || demo}
            onClick={() =>
              void run(async () =>
                setSocial(
                  await request("/api/social-leads", {
                    area: input.area,
                    service: input.service,
                  }),
                ),
              )
            }
          >
            Search public posts
          </Button>
          {social && <p>{social.message}</p>}
          {social?.matches.map((m) => (
            <div className="yw-row" key={m.url}>
              <div>
                <a href={m.url} target="_blank" rel="noopener noreferrer">
                  {m.title}
                </a>
                <p>{m.snippet}</p>
              </div>
            </div>
          ))}
          <Button asChild variant="secondary">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/search?q=${encodeURIComponent(`${input.area} ${input.service} site:reddit.com`)}`}
            >
              Open a public web search
            </a>
          </Button>
        </>
      ) : tab === "prospects" ? (
        <>
          <p className="muted">
            Public map listings suggest businesses to research. Listings do not
            prove buying intent or permission to contact.
          </p>
          <Button
            disabled={busy || demo}
            onClick={() =>
              void run(async () => {
                const result = await request<{
                  areas: ProspectArea[];
                  message?: string;
                }>("/api/prospect-search", {
                  action: "areas",
                  query: input.area,
                });
                setAreas(result.areas);
                setMessage(result.message || "Select an area.");
              })
            }
          >
            Find area
          </Button>
          {areas.map((a) => (
            <Button
              key={a.id}
              variant={area?.id === a.id ? "default" : "secondary"}
              onClick={() => setArea(a)}
            >
              {a.label}
            </Button>
          ))}
          <div className="yw-actions">
            <NativeSelect
              className="yw-select"
              aria-label="Business category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProspectCategory)}
            >
              {["property", "hospitality", "community"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </NativeSelect>
            <NativeSelect
              className="yw-select"
              aria-label="Search radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value) as 2 | 5)}
            >
              <option value={2}>Within 2 km</option>
              <option value={5}>Within 5 km</option>
            </NativeSelect>
          </div>
          <Button
            disabled={!area || busy || demo}
            onClick={() =>
              void run(async () => {
                const result = await request<{
                  prospects: Prospect[];
                  message?: string;
                }>("/api/prospect-search", {
                  action: "nearby",
                  area,
                  category,
                  radiusKm: radius,
                });
                setProspects(result.prospects);
                setMessage(
                  result.message ||
                    `${result.prospects.length} public listings found.`,
                );
              })
            }
          >
            Search nearby
          </Button>
          {prospects.map((p) => (
            <div className="yw-row" key={p.id}>
              <div className="yw-row-main">
                <h3>{p.name}</h3>
                <p>
                  {p.address} · {p.distanceKm.toFixed(1)} km
                </p>
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
                  View listing
                </a>
              </div>
              <Button
                variant="secondary"
                disabled={state.prospects?.some((s) => s.id === p.id)}
                onClick={() => void mutate("save-prospect", p).catch(() => {})}
              >
                Save
              </Button>
            </div>
          ))}
        </>
      ) : (
        <>
          {state.prospects?.length ? (
            state.prospects.map((p) => (
              <div className="yw-row" key={p.id}>
                <div className="yw-row-main">
                  <h3>{p.name}</h3>
                  <p>{p.address}</p>
                  <a
                    href={p.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Public listing
                  </a>
                </div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    void mutate("remove-prospect", { id: p.id }).catch(() => {})
                  }
                >
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <p className="muted">Save public prospects to research later.</p>
          )}
        </>
      )}
      {message && <p role="status">{message}</p>}
    </Modal>
  );
}
