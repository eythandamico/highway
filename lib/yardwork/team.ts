import { z } from "zod/v3";
import type { Job, Workspace } from "./yardwork.ts";
import { torontoScheduleTime } from "./traffic.ts";

export type Employee = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  defaultCrew: "crew1" | "crew2" | "none";
  skills: string;
  notes: string;
  availability: "available" | "away";
  archivedAt?: string;
};
export type EmployeeCheckIn = {
  id: string;
  employeeId: string;
  jobId: string;
  recordedAt: string;
  scheduledAt: string;
  employeeName: string;
  crewName: string;
  source: "office-manual" | "field-mobile";
};
export type TeamIssue = {
  id: string;
  employeeId: string;
  jobId: string;
  category: "Equipment" | "Materials" | "Access" | "Travel" | "Other";
  description: string;
  priority: "normal" | "urgent";
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
};

const ref = z.string().trim().min(1).max(250);
export const teamSchemas = {
  employee: z
    .object({
      id: ref.optional(),
      name: z.string().trim().min(1).max(120),
      role: z.string().trim().min(1).max(120),
      phone: z.string().trim().max(80),
      email: z.union([z.string().trim().email().max(250), z.literal("")]),
      defaultCrew: z.enum(["crew1", "crew2", "none"]),
      skills: z.string().trim().max(500),
      notes: z.string().trim().max(2000),
      availability: z.enum(["available", "away"]),
    })
    .strict(),
  "archive-employee": z.object({ id: ref, archive: z.boolean() }).strict(),
  "assign-job-employees": z
    .object({ jobId: ref, employeeIds: z.array(ref).max(100) })
    .strict()
    .refine(
      (p) => new Set(p.employeeIds).size === p.employeeIds.length,
      "Choose each employee only once.",
    ),
  "employee-check-in": z.object({ jobId: ref, employeeId: ref }).strict(),
  "team-issue": z
    .object({
      employeeId: ref,
      jobId: z.string().max(250),
      category: z.enum(["Equipment", "Materials", "Access", "Travel", "Other"]),
      description: z.string().trim().min(1).max(2000),
      priority: z.enum(["normal", "urgent"]),
    })
    .strict(),
  "resolve-team-issue": z
    .object({ id: ref, resolution: z.string().trim().min(1).max(2000) })
    .strict(),
};
export type TeamAction = keyof typeof teamSchemas;
export function scheduleDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function arrivalMinutesLate(record: EmployeeCheckIn) {
  // Attendance is measured to the displayed minute, not invisible seconds.
  return Math.max(
    0,
    Math.floor(Date.parse(record.recordedAt) / 60000) -
      Math.floor(Date.parse(record.scheduledAt) / 60000),
  );
}
export function attendance(
  s: Workspace,
  job: Job,
  employeeId: string,
  now = new Date(),
) {
  const record = (s.checkIns || []).find(
    (c) => c.jobId === job.id && c.employeeId === employeeId,
  );
  if (record) {
    const minutes = arrivalMinutesLate(record);
    return {
      label: minutes ? `${minutes} min late` : "On time",
      tone: minutes ? "late" : "good",
      record,
    };
  }
  if (job.status === "complete")
    return { label: "Not recorded", tone: "neutral", record: undefined };
  if (torontoScheduleTime(job.date, job.time) > now.getTime())
    return { label: "Upcoming", tone: "neutral", record: undefined };
  return { label: "Check-in missing", tone: "warning", record: undefined };
}
const minutes = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};
export function assertEmployeeSlot(
  s: Workspace,
  job: Pick<Job, "date" | "time" | "duration" | "employeeIds">,
  ignore?: string,
) {
  const assigned = job.employeeIds || [],
    start = minutes(job.time);
  for (const employeeId of assigned) {
    const clash = s.jobs.find(
      (other) =>
        other.id !== ignore &&
        other.date === job.date &&
        other.employeeIds?.includes(employeeId) &&
        start < minutes(other.time) + other.duration &&
        start + job.duration > minutes(other.time),
    );
    if (clash)
      throw new Error(
        `${s.employees?.find((e) => e.id === employeeId)?.name || "This employee"} already has a job at that time. Choose someone else or a different slot.`,
      );
  }
}

/** Called only after the action schema has been validated. Mutates the cloned workspace. */
export function applyTeamAction(
  s: Workspace,
  action: TeamAction,
  payload: unknown,
  now = new Date(),
): string {
  s.employees ??= [];
  s.checkIns ??= [];
  s.teamIssues ??= [];
  if (action === "employee") {
    const p = teamSchemas.employee.parse(payload),
      existing = p.id ? s.employees.find((e) => e.id === p.id) : undefined;
    if (p.id && !existing) throw new Error("Employee not found.");
    if (existing?.archivedAt)
      throw new Error("Restore this employee before editing their profile.");
    if (!existing && s.employees.length >= 100)
      throw new Error("This workspace supports up to 100 employee profiles.");
    if (existing) Object.assign(existing, p);
    else s.employees.push({ ...p, id: crypto.randomUUID() });
    return `Team profile saved for ${p.name}`;
  }
  if (action === "archive-employee") {
    const p = teamSchemas[action].parse(payload),
      employee = s.employees.find((e) => e.id === p.id);
    if (!employee) throw new Error("Employee not found.");
    if (
      p.archive &&
      s.jobs.some(
        (j) => j.status !== "complete" && j.employeeIds?.includes(employee.id),
      )
    )
      throw new Error(
        "Reassign or complete this employee’s unfinished jobs before archiving them.",
      );
    if (p.archive) employee.archivedAt = now.toISOString();
    else delete employee.archivedAt;
    return `${employee.name} ${p.archive ? "archived; their history is retained" : "restored to the team"}`;
  }
  if (action === "assign-job-employees") {
    const p = teamSchemas[action].parse(payload),
      job = s.jobs.find((j) => j.id === p.jobId);
    if (!job) throw new Error("Job not found.");
    if (job.status === "complete")
      throw new Error("Completed job assignments are kept for your records.");
    if (
      s.checkIns.some(
        (c) => c.jobId === job.id && !p.employeeIds.includes(c.employeeId),
      )
    )
      throw new Error(
        "Keep employees with recorded arrivals assigned to this job.",
      );
    for (const employeeId of p.employeeIds) {
      const employee = s.employees.find((e) => e.id === employeeId);
      if (!employee || employee.archivedAt)
        throw new Error("Choose active employees from your team.");
      if (
        employee.availability === "away" &&
        !job.employeeIds?.includes(employeeId)
      )
        throw new Error(
          `${employee.name} is marked away. Update their availability before assigning a job.`,
        );
    }
    assertEmployeeSlot(s, { ...job, employeeIds: p.employeeIds }, job.id);
    job.employeeIds = p.employeeIds;
    return `Team assignments updated for ${job.service}`;
  }
  if (action === "employee-check-in") {
    const p = teamSchemas[action].parse(payload),
      job = s.jobs.find((j) => j.id === p.jobId),
      employee = s.employees.find((e) => e.id === p.employeeId);
    if (!job || !employee || !job.employeeIds?.includes(employee.id))
      throw new Error("Assign this employee to the job first.");
    if (
      s.checkIns.some((c) => c.jobId === job.id && c.employeeId === employee.id)
    )
      return "";
    if (employee.archivedAt || job.status === "complete")
      throw new Error(
        "Arrival recording is available for active employees on unfinished jobs.",
      );
    if (job.date !== scheduleDay(now))
      throw new Error("You can record an arrival only for today’s jobs.");
    s.checkIns.push({
      id: crypto.randomUUID(),
      employeeId: employee.id,
      jobId: job.id,
      recordedAt: now.toISOString(),
      scheduledAt: new Date(
        torontoScheduleTime(job.date, job.time),
      ).toISOString(),
      employeeName: employee.name,
      crewName: job.crew,
      source: "office-manual",
    });
    return `Arrival recorded for ${employee.name} · ${job.service}`;
  }
  if (action === "team-issue") {
    const p = teamSchemas[action].parse(payload),
      employee = s.employees.find((e) => e.id === p.employeeId);
    if (!employee || employee.archivedAt)
      throw new Error("Choose an active employee.");
    if (
      p.jobId &&
      !s.jobs.some(
        (j) => j.id === p.jobId && j.employeeIds?.includes(employee.id),
      )
    )
      throw new Error("Choose a job assigned to this employee.");
    s.teamIssues.unshift({
      ...p,
      id: crypto.randomUUID(),
      status: "open",
      createdAt: now.toISOString(),
    });
    return `${p.category} issue recorded for ${employee.name}`;
  }
  const p = teamSchemas["resolve-team-issue"].parse(payload),
    issue = s.teamIssues.find((i) => i.id === p.id);
  if (!issue) throw new Error("Issue not found.");
  if (issue.status === "resolved") return "";
  issue.status = "resolved";
  issue.resolvedAt = now.toISOString();
  issue.resolution = p.resolution;
  return "Team issue resolved";
}
