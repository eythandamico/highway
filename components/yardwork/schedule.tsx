"use client";
import FieldBriefEditor from "./field-brief-editor";
import { CustomerProfile } from "./customer-profile";
import { useSearchParams } from "next/navigation";
import { RecordLink } from "./record-link";
import { useRememberedState } from "./page-memory";
import { NativeSelect } from "@/components/ui/native-select";
import { lazy, Suspense, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Map,
  CalendarClock,
  ArrowUpRight,
} from "lucide-react";
import { useOffice } from "./context";
import { Heading, Button, Input, Status, Modal, Empty } from "./shared";
import {
  today,
  plusDay,
  dateLabel,
  timeLabel,
  money,
  reschedulePlan,
  type Job,
} from "@/lib/yardwork/yardwork";
import {
  getDayCapacity,
  getBookingSlots,
} from "@/lib/yardwork/schedule-capacity";
import { availabilityWindows } from "@/lib/yardwork/availability-windows";
import { attendance } from "@/lib/yardwork/team";
const RouteMap = lazy(() => import("./route-map"));
const FindWork = lazy(() => import("./find-work"));
export function JobRows({
  jobs,
  onOpen,
}: {
  jobs: Job[];
  onOpen: (id: string) => void;
}) {
  const { state } = useOffice();
  return (
    <div>
      {jobs.map((j) => (
        <div className="yw-row" key={j.id}>
          <div className="yw-time">
            {timeLabel(j.time)}
            <small>{j.duration} min</small>
          </div>
          <div className="yw-row-main">
            <button className="yw-row-link" onClick={() => onOpen(j.id)}>
              <h3>
                {state.customers.find((c) => c.id === j.customerId)?.name ||
                  "Customer"}
              </h3>
              <p>
                {j.service} · {j.crew}
              </p>
            </button>
          </div>
          <Status
            tone={
              j.status === "complete"
                ? "good"
                : j.status === "in-progress"
                  ? "warning"
                  : "neutral"
            }
          >
            {j.status.replace("-", " ")}
          </Status>
        </div>
      ))}
    </div>
  );
}
export function JobDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { state, mutate, busy } = useOffice(),
    job = state.jobs.find((j) => j.id === id),
    [assign, setAssign] = useState(false),
    [selected, setSelected] = useState(job?.employeeIds || []),
    [error, setError] = useState("");
  if (!job) return null;
  async function save(
    action: "start" | "complete" | "assign-job-employees" | "employee-check-in",
    payload: unknown,
  ) {
    try {
      setError("");
      await mutate(action, payload);
      setAssign(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }
  return (
    <Modal
      title={job.service}
      sidebar={<CustomerProfile customerId={job.customerId} />}
      description={`${dateLabel(job.date)} at ${timeLabel(job.time)}`}
      open
      pending={busy}
      onClose={onClose}
    >
      <div className="yw-actions">
        <Status tone={job.status === "complete" ? "good" : "neutral"}>
          {job.status}
        </Status>
        {job.status === "scheduled" && (
          <Button disabled={busy} onClick={() => void save("start", { id })}>
            Start visit
          </Button>
        )}
        {job.status === "in-progress" && (
          <Button disabled={busy} onClick={() => void save("complete", { id })}>
            Complete visit
          </Button>
        )}

        {job.sourceQuoteId && <RecordLink kind="quote" id={job.sourceQuoteId}>Source quote</RecordLink>}
        {state.invoices.filter(i => i.customerId === job.customerId && (i.jobId === job.id || (job.sourceQuoteId && i.sourceQuoteId === job.sourceQuoteId))).map(i => <RecordLink key={i.id} kind="invoice" id={i.id}>Invoice · {i.status}</RecordLink>)}
      </div>
      <dl className="yw-detail-list yw-record-facts">
        <div>
          <dt>Crew</dt>
          <dd>{job.crew}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{job.duration} minutes</dd>
        </div>
        <div>
          <dt>Booked value</dt>
          <dd>{money(job.amount)} before tax</dd>
        </div>
      </dl>
      <section className="yw-record-section">
        <h2>Visit notes</h2>
        <p>
          {job.notes || "No visit notes recorded."}
        </p>
      </section>
      <section className="yw-record-section">
      <div className="yw-section-title">
        <h2>Assigned team</h2>
        {job.status !== "complete" && (
          <Button variant="ghost" onClick={() => setAssign(!assign)}>
            Edit assignment
          </Button>
        )}
      </div>
      {assign ? (
        <>
          <div className="yw-checklist">
            {state.employees
              ?.filter((e) => !e.archivedAt)
              .map((e) => (
                <label key={e.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(e.id)}
                    onChange={(event) =>
                      setSelected((ids) =>
                        event.target.checked
                          ? [...ids, e.id]
                          : ids.filter((x) => x !== e.id),
                      )
                    }
                  />
                  {e.name} · {e.availability}
                </label>
              ))}
          </div>
          <Button
            disabled={busy}
            onClick={() =>
              void save("assign-job-employees", {
                jobId: id,
                employeeIds: selected,
              })
            }
          >
            Save assignment
          </Button>
        </>
      ) : (
        <>
          {(job.employeeIds || []).map((employeeId) => {
            const employee = state.employees?.find((e) => e.id === employeeId);
            const arrival = attendance(state, job, employeeId);
            return (
              <div className="yw-row" key={employeeId}>
                <div className="yw-row-main">
                  <h3>{employee?.name}</h3>
                  <p>{arrival.label}</p>
                </div>
                {!arrival.record &&
                  job.status !== "complete" &&
                  job.date === today() && (
                    <Button
                      disabled={busy}
                      variant="secondary"
                      onClick={() =>
                        void save("employee-check-in", {
                          jobId: id,
                          employeeId,
                        })
                      }
                    >
                      Record arrival
                    </Button>
                  )}
              </div>
            );
          })}
          {!job.employeeIds?.length && (
            <p className="muted">No individual employees assigned.</p>
          )}
        </>
      )}
      </section>
      <FieldBriefEditor jobId={id}/>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
    </Modal>
  );
}
export default function Schedule() {
  const params = useSearchParams();
  const { state, mutate } = useOffice(),
    [date, setDate] = useRememberedState("schedule.date", today()),
    [week, setWeek] = useRememberedState("schedule.week", today()),
    [crew, setCrew] = useRememberedState("schedule.crew", "all"),
    [job, setJob] = useState<string | null>(() => params.get("attention") === "job" ? params.get("record") : null),
    [map, setMap] = useState(false),
    [find, setFind] = useState<boolean | string>(false),
    [rescheduling, setRescheduling] = useState(false);
  const days = Array.from({ length: 7 }, (_, i) => plusDay(week, i)),
    jobs = state.jobs
      .filter((j) => j.date === date && (crew === "all" || j.crew === crew))
      .sort((a, b) => a.time.localeCompare(b.time)),
    capacity = getDayCapacity(state, date, crew),
    slots = getBookingSlots(state, date, crew);
  const timeline = [
    ...jobs.map((job) => ({ kind: "job" as const, time: job.time, job })),
    ...availabilityWindows(slots).map((slot) => ({ kind: "opening" as const, time: slot.time, slot })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  let plan: ReturnType<typeof reschedulePlan> = [];
  let planError = "";
  if (rescheduling) {
    try {
      plan = reschedulePlan(state, date);
    } catch (e) {
      planError = e instanceof Error ? e.message : "No open slots.";
    }
  }
  return (
    <>
      <Heading
        title="Schedule"
        description="A clear view of the week, with room to grow."
      >
        <Button onClick={() => setFind(true)}>
          Find work <ArrowUpRight size={16} />
        </Button>
      </Heading>
      <div className="yw-toolbar yw-schedule-toolbar">
          <Input
            aria-label="Selected date"
            type="date"
            value={date}
            onChange={(e) => {
              if (e.target.value) {
                setDate(e.target.value);
                setWeek(e.target.value);
              }
            }}
          />

        <div className="yw-actions yw-week-navigation">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous week"
            onClick={() => setWeek(plusDay(week, -7))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setWeek(today());
              setDate(today());
            }}
          >
            Today
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Next week"
            onClick={() => setWeek(plusDay(week, 7))}
          >
            <ChevronRight />
          </Button>
        </div>
        <NativeSelect
          aria-label="Filter crew"
          className="yw-select"
          value={crew}
          onChange={(e) => setCrew(e.target.value)}
        >
          <option value="all">All crews</option>
          {[state.business.crew1, state.business.crew2].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </NativeSelect>
      </div>
      <div className="yw-week">
        {days.map((d) => {
          const load = getDayCapacity(state, d, crew);
          return (
            <button
              data-surface="raised" className="yw-day"
              aria-label={`${dateLabel(d, { weekday: "long", month: "long", day: "numeric" })}, ${load.jobCount} ${load.jobCount === 1 ? "visit" : "visits"}`}
              key={d}
              aria-pressed={date === d}
              onClick={() => setDate(d)}
            >
              <span className="yw-day-selection" aria-hidden="true"><Check size={12} strokeWidth={3} /></span>
              <small>{dateLabel(d, { weekday: "short" })}</small>
              <strong>{Number(d.slice(-2))}</strong>
              <small>{load.jobCount} {load.jobCount === 1 ? "visit" : "visits"}</small>
            </button>
          );
        })}
      </div>
      <div className="yw-section-title">
        <div>
          <h2>
            {dateLabel(date, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <p className="muted">
            {capacity.label} · {capacity.bookedMinutes} minutes booked
          </p>
        </div>
        <div className="yw-actions">
          <Button variant="secondary" onClick={() => setMap(!map)}>
            <Map size={16} />
            {map ? "Hide route" : "Route"}
          </Button>
          <Button variant="ghost" onClick={() => setRescheduling(true)}>
            <CalendarClock size={16} />
            Reschedule day
          </Button>
        </div>
      </div>
      {map && (
        <Suspense fallback={<p className="muted">Loading map…</p>}>
          <RouteMap jobs={jobs} />
        </Suspense>
      )}
      {timeline.length ? (
        <div className="yw-day-timeline" aria-label="Visits and available time">
          {timeline.map((entry) => entry.kind === "job" ? (
            <JobRows key={entry.job.id} jobs={[entry.job]} onOpen={setJob} />
          ) : (
            <div className="yw-open-slot" key={entry.slot.time}>
              <div className="yw-time">
                {timeLabel(entry.slot.time)}
                <small>–{timeLabel(entry.slot.end)}</small>
              </div>
              <div className="yw-row-main">
                <h3>Available time</h3>
                <p>Find a job that fits</p>
              </div>
              <Button
                variant="ghost"
                aria-label={`Find work for available time at ${timeLabel(entry.slot.time)}`}
                onClick={() => setFind("all")}
              >
                Find work <ArrowUpRight size={16} aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="Nothing booked for this day.">
          No remaining booking windows for this selection.
        </Empty>
      )}
      {job && <JobDetail id={job} onClose={() => setJob(null)} />}{" "}
      {find && (
        <Suspense fallback={null}>
          <FindWork date={date} crew={typeof find === "string" ? find : crew} onClose={() => setFind(false)} />
        </Suspense>
      )}
      {rescheduling && (
        <Modal
          title="Review the reschedule plan"
          description="Only scheduled visits without recorded arrivals will move. This changes every eligible crew on the selected day."
          open
          onClose={() => setRescheduling(false)}
        >
          {planError ? (
            <p role="alert">{planError}</p>
          ) : (
            <>
              {plan.map((p) => (
                <div className="yw-row" key={p.id}>
                  <div>
                    <h3>
                      {
                        state.customers.find(
                          (c) =>
                            c.id ===
                            state.jobs.find((j) => j.id === p.id)?.customerId,
                        )?.name
                      }
                    </h3>
                    <p>
                      {dateLabel(p.date)} · {timeLabel(p.time)}
                    </p>
                  </div>
                </div>
              ))}
              {!plan.length && <p>No eligible visits to move.</p>}
              <Button
                disabled={!plan.length}
                onClick={async () => {
                  try {
                    await mutate("reschedule", { date });
                    setRescheduling(false);
                  } catch {}
                }}
              >
                Move {plan.length} visits
              </Button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
