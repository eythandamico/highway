"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { attentionQueue } from "@/lib/yardwork/attention";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { officeClock } from "@/lib/yardwork/office-clock";
import { MetricTrend } from "./metric-trend";
import { AttentionCards } from "./attention-cards";
import { useOffice } from "./context";
import { Heading, Button, Status, Empty } from "./shared";
import { dateLabel, money, plusDay } from "@/lib/yardwork/yardwork";
import { JobRows, JobDetail } from "./schedule";
import type { Section } from "./office";
export default function Today({ go }: { go: (s: Section) => void }) {
  const router = useRouter(), params = useSearchParams();
  const { state, demo, now } = useOffice(),
    [job, setJob] = useState<string | null>(null);
  const { day, greeting } = officeClock(now);
  const jobs = state.jobs
      .filter((j) => j.date === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  const unpaid = state.invoices.filter((i) => i.status === "unpaid"),
    upcoming = state.jobs.filter(
      (j) => j.date >= day && j.date < plusDay(day, 7),
    );
  const completedCount = jobs.filter(j => j.status === "complete").length;
  const previousJobs = state.jobs.filter(j => j.date >= plusDay(day, -7) && j.date < day);
  return (
    <>
      <Heading
        title={`Good ${greeting}, ${state.business.owner.split(" ")[0]}.`}
        description={dateLabel(day, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      >
        <Button onClick={() => go("schedule")}>
          View schedule <ArrowRight size={16} />
        </Button>
      </Heading>
      <div className="yw-metrics">
        <div className="yw-metric">
          <strong>{jobs.length}</strong>
          <p className="yw-metric-caption">
            <span>Visits today</span>
            {completedCount > 0 && <span className="yw-metric-completed" role="img" aria-label={`${completedCount} ${completedCount === 1 ? "visit" : "visits"} complete`} title={`${completedCount} ${completedCount === 1 ? "visit" : "visits"} complete`}>
              <span className="yw-metric-completed-icon" aria-hidden="true"><Check size={12} strokeWidth={2.5} /></span>
              <span aria-hidden="true">{completedCount} Complete</span>
            </span>}
            <MetricTrend current={jobs.length} previous={state.jobs.filter(j => j.date === plusDay(day, -7)).length} period="vs. same day last week" />
          </p>
        </div>
        <div className="yw-metric">
          <strong>{money(upcoming.reduce((n, j) => n + j.amount, 0))}</strong>
          <p className="yw-metric-caption">
            <span>Booked next 7 days</span>
            <MetricTrend current={upcoming.reduce((n, j) => n + j.amount, 0)} previous={previousJobs.reduce((n, j) => n + j.amount, 0)} period="vs. previous 7 days" />
          </p>
        </div>
        <div className="yw-metric">
          <strong>
            {money(unpaid.reduce((n, i) => n + i.amount + i.tax, 0))}
          </strong>
          <p>To collect · incl. tax</p>
        </div>
      </div>
      <AttentionCards items={attentionQueue(state, day)} onOpen={item => {
        const next = new URLSearchParams(params.toString());
        next.set("view", item.view); next.set("attention", item.kind); next.set("record", item.entityId);
        router.replace(`${demo ? "/demo" : "/workspace"}?${next}`, { scroll: false });
      }} />
        <section>
          <div className="yw-section-title">
            <h2>Today’s work</h2>
            <Status>
              {jobs.filter((j) => j.status !== "complete").length} remaining
            </Status>
          </div>
          {jobs.length ? (
            <JobRows jobs={jobs} onOpen={setJob} />
          ) : (
            <Empty
              title="A little room in the day."
              action={
                <Button variant="secondary" onClick={() => go("schedule")}>
                  Find work
                </Button>
              }
            >
              Check your open slots and nearby customers, or review a quote to
              arrange the next visit.
            </Empty>
          )}
        </section>
      <section className="yw-subsection">
        <div className="yw-section-title">
          <h2>Latest activity</h2>
          <Button variant="ghost" onClick={() => go("activity")}>
            View all activity
          </Button>
        </div>
        {state.activity.slice(0, 3).map((a) => (
          <div className="yw-row" key={a.id}>
            <Check size={16} />
            <div className="yw-row-main">
              <p>{a.text}</p>
            </div>
            <small>
              {new Date(a.time).toLocaleDateString("en-CA", {
                timeZone: "America/Toronto",
                month: "short",
                day: "numeric",
              })}
            </small>
          </div>
        ))}
      </section>
      {job && <JobDetail id={job} onClose={() => setJob(null)} />}
    </>
  );
}
