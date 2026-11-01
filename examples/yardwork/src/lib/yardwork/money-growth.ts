import type { Job } from "./yardwork.ts";
import { cents, documentDay } from "./business-documents.ts";

const addDays = (day: string, count: number) => {
  const date = new Date(day + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
};

export function mondayOf(day: string) {
  const weekday = new Date(day + "T12:00:00Z").getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}

export type BookingWeek = {
  start: string;
  end: string;
  recorded: boolean;
  value: number;
  jobs: number;
  completed: number;
  remainingValue: number;
};

// Group work by its service date. Invoices and unbooked quotes never enter these totals.
export function weeklyBookings(
  jobs: Job[],
  day = documentDay(),
): BookingWeek[] {
  const current = mondayOf(day);
  const earliest = jobs.reduce<string | null>(
    (first, job) => (!first || job.date < first ? job.date : first),
    null,
  );
  return Array.from({ length: 6 }, (_, index) => {
    const start = addDays(current, (index - 5) * 7),
      end = addDays(start, 6);
    const visits = jobs.filter((job) => job.date >= start && job.date <= end);
    return {
      start,
      end,
      recorded: !!earliest && earliest <= end,
      value: visits.reduce((sum, job) => sum + cents(job.amount), 0) / 100,
      jobs: visits.length,
      completed: visits.filter((job) => job.status === "complete").length,
      remainingValue:
        visits
          .filter((job) => job.status !== "complete")
          .reduce((sum, job) => sum + cents(job.amount), 0) / 100,
    };
  });
}

export function weeklyChange(current: BookingWeek, previous: BookingWeek) {
  if (!previous.recorded)
    return { kind: "no-history" as const, delta: null, percent: null };
  const delta = (cents(current.value) - cents(previous.value)) / 100;
  return {
    kind:
      delta > 0
        ? ("up" as const)
        : delta < 0
          ? ("down" as const)
          : ("same" as const),
    delta,
    percent: previous.value > 0 ? (delta / previous.value) * 100 : null,
  };
}
