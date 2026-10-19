import type { Workspace } from "./yardwork";

export const SCHEDULE_WORKDAY_START = 8 * 60;
export const SCHEDULE_WORKDAY_END = 18 * 60;
export type BookingSlot = {
  date: string;
  crew: string;
  time: string;
  end: string;
  minutes: number;
};
/** Suggestions include completed work and never offer elapsed time today. Booking rechecks conflicts. */
export function getBookingSlots(
  workspace: Workspace,
  date: string,
  crew = "all",
  now = new Date(),
): BookingSlot[] {
  if (!validDate(date)) return [];
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  if (date < today) return [];
  const earliest =
    date === today
      ? Math.max(
          SCHEDULE_WORKDAY_START,
          Math.ceil((Number(parts.hour) * 60 + Number(parts.minute) + 1) / 15) *
            15,
        )
      : SCHEDULE_WORKDAY_START;
  const crews = [
    ...new Set(
      [workspace.business.crew1, workspace.business.crew2].filter(Boolean),
    ),
  ].filter((name) => crew === "all" || name === crew);
  const stamp = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const slots: BookingSlot[] = [];
  for (const name of crews) {
    let cursor = earliest;
    const intervals = workspace.jobs
      .filter((job) => job.date === date && job.crew === name)
      .map((job) => workingInterval(job.time, job.duration))
      .filter((value): value is Interval => !!value)
      .sort((a, b) => a.start - b.start);
    for (const interval of [
      ...intervals,
      { start: SCHEDULE_WORKDAY_END, end: SCHEDULE_WORKDAY_END },
    ]) {
      if (interval.start - cursor >= 15)
        slots.push({
          date,
          crew: name,
          time: stamp(cursor),
          end: stamp(interval.start),
          minutes: interval.start - cursor,
        });
      cursor = Math.max(cursor, interval.end);
    }
  }
  return slots.sort(
    (a, b) => a.time.localeCompare(b.time) || a.crew.localeCompare(b.crew),
  );
}
export type DayCapacity = {
  level: 0 | 1 | 2 | 3;
  label: "Empty" | "Light" | "Busy" | "Full";
  bookedMinutes: number;
  availableMinutes: number;
  capacityMinutes: number;
  /** Whole percent, rounded down so a partly open day never displays 100%. */
  percent: number;
  jobCount: number;
  crewCount: number;
  /** Longest continuous free interval on any included crew, within 08:00–18:00. */
  largestFreeSlotMinutes: number;
};

type Interval = { start: number; end: number };
const crewName = (value: string) => value.trim();

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function workingInterval(time: string, duration: number): Interval | null {
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
    !Number.isFinite(duration) ||
    duration <= 0
  )
    return null;
  const [hours, minutes] = time.split(":").map(Number);
  const start = Math.max(SCHEDULE_WORKDAY_START, hours * 60 + minutes);
  const end = Math.min(SCHEDULE_WORKDAY_END, hours * 60 + minutes + duration);
  return end > start ? { start, end } : null;
}

function occupiedTime(intervals: Interval[]): {
  booked: number;
  largestFree: number;
} {
  const ordered = [...intervals].sort(
    (a, b) => a.start - b.start || a.end - b.end,
  );
  let cursor = SCHEDULE_WORKDAY_START,
    booked = 0,
    largestFree = 0;
  for (const { start, end } of ordered) {
    largestFree = Math.max(largestFree, start - cursor);
    // Only count the part not already covered by an earlier appointment.
    booked += Math.max(0, end - Math.max(cursor, start));
    cursor = Math.max(cursor, end);
  }
  return {
    booked,
    largestFree: Math.max(largestFree, SCHEDULE_WORKDAY_END - cursor),
  };
}

/**
 * Calendar load, including completed visits, across the app's 08:00–18:00 workday.
 * 0 = empty; 1 = below 50%; 2 = 50% to below 100%; 3 = no free minutes.
 * Overlapping appointments count once per crew; simultaneous crews count separately.
 * All crews includes unique configured crews plus legacy crews working on this date.
 * A legacy crew on another date does not imply spare capacity today. Crew names retain
 * case, matching the existing workspace's crew identity rules. No travel or breaks are inferred.
 */
export function getDayCapacity(
  workspace: Workspace,
  date: string,
  crew = "all",
): DayCapacity {
  if (!validDate(date))
    throw new RangeError("Choose a valid calendar date for schedule capacity.");
  const selected = crewName(crew);
  const configured = [workspace.business.crew1, workspace.business.crew2]
    .map(crewName)
    .filter(Boolean);
  const jobs = workspace.jobs.flatMap((job) => {
    if (job.date !== date) return [];
    const name = crewName(job.crew),
      interval = workingInterval(job.time, job.duration);
    return name && interval ? [{ crew: name, interval }] : [];
  });
  const knownCrews = new Set([...configured, ...jobs.map((job) => job.crew)]);
  const crews =
    selected === "all"
      ? [...knownCrews]
      : knownCrews.has(selected)
        ? [selected]
        : [];
  const included = new Set(crews),
    selectedJobs = jobs.filter((job) => included.has(job.crew));
  let bookedMinutes = 0,
    largestFreeSlotMinutes = 0;
  for (const name of crews) {
    const occupancy = occupiedTime(
      selectedJobs
        .filter((job) => job.crew === name)
        .map((job) => job.interval),
    );
    bookedMinutes += occupancy.booked;
    largestFreeSlotMinutes = Math.max(
      largestFreeSlotMinutes,
      occupancy.largestFree,
    );
  }
  const capacityMinutes =
    crews.length * (SCHEDULE_WORKDAY_END - SCHEDULE_WORKDAY_START);
  const availableMinutes = capacityMinutes - bookedMinutes;
  const level: DayCapacity["level"] =
    bookedMinutes === 0
      ? 0
      : availableMinutes === 0
        ? 3
        : bookedMinutes < capacityMinutes / 2
          ? 1
          : 2;
  const labels: DayCapacity["label"][] = ["Empty", "Light", "Busy", "Full"];
  return {
    level,
    label: labels[level],
    bookedMinutes,
    availableMinutes,
    capacityMinutes,
    percent: capacityMinutes
      ? Math.floor((bookedMinutes / capacityMinutes) * 100)
      : 0,
    jobCount: selectedJobs.length,
    crewCount: crews.length,
    largestFreeSlotMinutes,
  };
}
