import type { Customer, Job, Workspace } from "./yardwork";

/** Google Routes data only; no credential or server-runtime imports in this module. */
export type TrafficRequest = {
  date: string;
  crew: string;
  origin?: { latitude: number; longitude: number };
};
export type TrafficLeg = {
  fromJobId?: string;
  toJobId: string;
  departureTime: string;
  arrivalTime: string;
  driveSeconds: number;
  staticDriveSeconds: number;
  delaySeconds: number;
  distanceMeters: number;
  serviceStartTime: string;
  waitSeconds: number;
  lateSeconds: number;
  etaProof?: string;
};
export type TrafficUnavailable = {
  status: "unavailable";
  reason: string;
  message: string;
  retryAfterSeconds?: number;
};
export type TrafficAvailable = {
  status: "available";
  provider: "Google Routes";
  checkedAt: string;
  expiresAt: string;
  date: string;
  crew: string;
  legs: TrafficLeg[];
  totalDriveSeconds: number;
  totalDelaySeconds: number;
  finishTime: string;
  timingAssumption?: string;
};
export type TrafficResponse = TrafficAvailable | TrafficUnavailable;
export type RouteEtaResponse = TrafficResponse;
export type EtaProof = {
  version: 1;
  userId: string;
  jobId: string;
  etaMinutes: number;
  arrivalAt: string;
  evidenceAt: string;
  expiresAt: string;
  jobFingerprint: string;
  lateSeconds: number;
};
export type PreparedTrafficRoute = {
  request: TrafficRequest;
  stops: { job: Job; customer: Customer; scheduledAt: number }[];
};
const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const PROOF_PURPOSE = "yardwork-route-eta-proof-v1\n";
const MAX_STOPS = 20;
const PROOF_LIFETIME_MS = 5 * 60_000;
export const trafficUnavailable = (
  reason: string,
  message: string,
): TrafficUnavailable => ({ status: "unavailable", reason, message });

export function parseTrafficRequest(value: unknown): TrafficRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some((k) => !["date", "crew", "origin"].includes(k)))
    return null;
  if (
    typeof v.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(v.date) ||
    typeof v.crew !== "string" ||
    !v.crew.trim() ||
    v.crew.length > 250
  )
    return null;
  const parsedDate = new Date(v.date + "T12:00:00Z");
  if (
    !Number.isFinite(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== v.date
  )
    return null;
  let origin: TrafficRequest["origin"];
  if (v.origin !== undefined) {
    if (!v.origin || typeof v.origin !== "object" || Array.isArray(v.origin))
      return null;
    const o = v.origin as Record<string, unknown>;
    if (
      Object.keys(o).some((k) => !["latitude", "longitude"].includes(k)) ||
      typeof o.latitude !== "number" ||
      typeof o.longitude !== "number" ||
      !Number.isFinite(o.latitude) ||
      !Number.isFinite(o.longitude) ||
      Math.abs(o.latitude) > 90 ||
      Math.abs(o.longitude) > 180
    )
      return null;
    origin = { latitude: o.latitude, longitude: o.longitude };
  }
  return { date: v.date, crew: v.crew, ...(origin ? { origin } : {}) };
}

/** Convert the app's Toronto wall-clock schedule to UTC, including DST. */
export function torontoScheduleTime(date: string, time: string): number {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    throw new Error("Invalid schedule time");
  const [year, month, day] = date.split("-").map(Number),
    [hour, minute] = time.split(":").map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  let candidate = desired;
  for (let attempt = 0; attempt < 4; attempt++) {
    const p = Object.fromEntries(
      formatter
        .formatToParts(new Date(candidate))
        .map((part) => [part.type, part.value]),
    );
    const rendered = Date.UTC(
      Number(p.year),
      Number(p.month) - 1,
      Number(p.day),
      Number(p.hour),
      Number(p.minute),
    );
    if (rendered === desired) return candidate;
    candidate += desired - rendered;
  }
  throw new Error("This schedule time does not exist in Toronto");
}

export function prepareTrafficRoute(
  workspace: Workspace,
  value: unknown,
  now = new Date(),
): PreparedTrafficRoute | TrafficUnavailable {
  const request = parseTrafficRequest(value);
  if (!request)
    return trafficUnavailable(
      "invalid_request",
      "Choose a valid day, crew and starting location.",
    );
  if (!request.origin)
    return trafficUnavailable(
      "origin_required",
      "Share your current location to calculate arrival times.",
    );
  if (
    ![workspace.business.crew1, workspace.business.crew2].includes(request.crew)
  )
    return trafficUnavailable(
      "invalid_crew",
      "Choose one crew to check traffic.",
    );
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  if (request.date < today)
    return trafficUnavailable(
      "past_date",
      "Traffic arrival times are available for current or future jobs.",
    );
  const jobs = workspace.jobs
    .filter(
      (j) =>
        j.date === request.date &&
        j.crew === request.crew &&
        j.status !== "complete",
    )
    .sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
  if (!jobs.length)
    return trafficUnavailable(
      "no_jobs",
      "This crew has no unfinished jobs on this day.",
    );
  if (jobs.every((job) => job.status === "in-progress"))
    return trafficUnavailable(
      "no_driving_legs",
      "There are no further jobs to drive to after the current stop.",
    );
  if (jobs.length > MAX_STOPS)
    return trafficUnavailable(
      "too_many_jobs",
      `Traffic checks support up to ${MAX_STOPS} unfinished jobs at a time.`,
    );
  if (
    jobs.filter((j) => j.status === "in-progress").length > 1 ||
    jobs.some((j, i) => i > 0 && j.status === "in-progress")
  )
    return trafficUnavailable(
      "schedule_conflict",
      "Update the crew schedule so the current job is its first unfinished stop.",
    );
  try {
    const stops = jobs.map((job) => {
      const customer = workspace.customers.find((c) => c.id === job.customerId);
      if (
        !customer?.address.trim() ||
        !Number.isFinite(job.duration) ||
        job.duration < 1 ||
        job.duration > 480
      )
        throw new Error("Invalid job");
      return {
        job,
        customer,
        scheduledAt: torontoScheduleTime(job.date, job.time),
      };
    });
    return { request, stops };
  } catch {
    return trafficUnavailable(
      "invalid_schedule",
      "Check the job addresses, dates and service durations before calculating traffic.",
    );
  }
}

function encodeBase64Url(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Invalid token");
  const normal = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(
    atob(normal + "=".repeat((4 - (normal.length % 4)) % 4)),
    (c) => c.charCodeAt(0),
  );
}
async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
export async function trafficJobFingerprint(
  workspace: Workspace,
  job: Job,
): Promise<string> {
  const customer = workspace.customers.find((c) => c.id === job.customerId);
  const routeSnapshot = workspace.jobs
    .filter(
      (j) =>
        j.date === job.date && j.crew === job.crew && j.status !== "complete",
    )
    .sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id))
    .map((j) => [
      j.id,
      j.customerId,
      j.time,
      j.duration,
      j.status,
      workspace.customers.find((c) => c.id === j.customerId)?.address,
    ]);
  const snapshot = [
    job.id,
    job.customerId,
    job.date,
    job.time,
    job.duration,
    job.crew,
    job.status,
    job.service,
    workspace.business.name,
    customer?.name,
    customer?.address,
    customer?.phone,
    customer?.email,
    routeSnapshot,
  ];
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(snapshot)),
  );
  return encodeBase64Url(new Uint8Array(digest));
}
export async function signEtaProof(
  proof: EtaProof,
  secret: string,
): Promise<string> {
  if (!secret) throw new Error("Missing proof secret");
  const payload = encodeBase64Url(
    new TextEncoder().encode(JSON.stringify(proof)),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    new TextEncoder().encode(PROOF_PURPOSE + payload),
  );
  return payload + "." + encodeBase64Url(new Uint8Array(signature));
}
export async function verifyEtaProof(
  token: string,
  context: { userId: string; jobId: string; secret: string; now?: Date },
): Promise<EtaProof | null> {
  try {
    if (!context.secret || typeof token !== "string" || token.length > 4096)
      return null;
    const parts = token.split(".");
    if (
      parts.length !== 2 ||
      !(await crypto.subtle.verify(
        "HMAC",
        await hmacKey(context.secret),
        decodeBase64Url(parts[1]),
        new TextEncoder().encode(PROOF_PURPOSE + parts[0]),
      ))
    )
      return null;
    const p = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(parts[0])),
    ) as EtaProof;
    const now = (context.now ?? new Date()).getTime(),
      evidence = Date.parse(p.evidenceAt),
      expiry = Date.parse(p.expiresAt),
      arrival = Date.parse(p.arrivalAt);
    if (
      p.version !== 1 ||
      p.userId !== context.userId ||
      p.jobId !== context.jobId ||
      typeof p.jobFingerprint !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(p.jobFingerprint) ||
      !Number.isFinite(evidence) ||
      !Number.isFinite(expiry) ||
      !Number.isFinite(arrival) ||
      evidence > now ||
      expiry <= now ||
      expiry <= evidence ||
      expiry - evidence > PROOF_LIFETIME_MS ||
      !Number.isInteger(p.etaMinutes) ||
      p.etaMinutes < 0 ||
      p.etaMinutes !== Math.max(0, Math.ceil((arrival - evidence) / 60_000)) ||
      !Number.isFinite(p.lateSeconds) ||
      p.lateSeconds <= 0
    )
      return null;
    return p;
  } catch {
    return null;
  }
}

function seconds(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,9})?s$/.test(value))
    return null;
  const parsed = Number(value.slice(0, -1));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Called only after the route handler authenticates, checks ownership and reserves quota. */
export async function computeTrafficEta(
  workspace: Workspace,
  prepared: PreparedTrafficRoute,
  options: {
    apiKey: string;
    userId: string;
    fetchImpl?: typeof fetch;
    now?: Date;
  },
): Promise<TrafficResponse> {
  if (!options.apiKey.trim())
    return trafficUnavailable(
      "not_configured",
      "Live traffic is not connected yet.",
    );
  const now = options.now ?? new Date(),
    evidenceAt = now.toISOString(),
    expiresAt = new Date(now.getTime() + PROOF_LIFETIME_MS).toISOString();
  const fetchImpl = options.fetchImpl ?? fetch;
  let cursor = now.getTime(),
    previous: { job: Job; customer: Customer } | undefined;
  const legs: TrafficLeg[] = [];
  let timingAssumption: string | undefined;
  try {
    for (const stop of prepared.stops) {
      let driveSeconds = 0,
        staticDriveSeconds = 0,
        distanceMeters = 0;
      const departureTime = new Date(cursor).toISOString();
      const inProgress = stop.job.status === "in-progress";
      if (!inProgress) {
        const body = {
          origin: previous
            ? { address: previous.customer.address }
            : { location: { latLng: prepared.request.origin } },
          destination: { address: stop.customer.address },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          // For immediate departure, omit the timestamp so network latency cannot put it in the past.
          ...(cursor > now.getTime() ? { departureTime } : {}),
          computeAlternativeRoutes: false,
          units: "METRIC",
          regionCode: "ca",
        };
        const response = await fetchImpl(ROUTES_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": options.apiKey,
            "X-Goog-FieldMask":
              "routes.duration,routes.staticDuration,routes.distanceMeters,fallbackInfo",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(12_000),
        });
        if (!response.ok)
          return trafficUnavailable(
            "provider_error",
            "Traffic could not be checked. Try again shortly.",
          );
        const data = (await response.json()) as {
          routes?: {
            duration?: unknown;
            staticDuration?: unknown;
            distanceMeters?: unknown;
          }[];
          fallbackInfo?: unknown;
        };
        // Fallback routing may ignore traffic. Never sign or label that result as live traffic.
        if (data.fallbackInfo)
          return trafficUnavailable(
            "traffic_fallback",
            "Live traffic was unavailable for this route. Try again shortly.",
          );
        const route = data.routes?.[0],
          drive = seconds(route?.duration),
          staticDrive = seconds(route?.staticDuration);
        if (
          !route ||
          drive === null ||
          staticDrive === null ||
          typeof route.distanceMeters !== "number" ||
          !Number.isFinite(route.distanceMeters) ||
          route.distanceMeters < 0
        )
          return trafficUnavailable(
            "no_route",
            "A driving route could not be found for one of the job addresses.",
          );
        driveSeconds = drive;
        staticDriveSeconds = staticDrive;
        distanceMeters = route.distanceMeters;
      } else {
        timingAssumption =
          "The current job is treated as your current stop, with its full planned service duration remaining because remaining work time is not tracked.";
      }
      const arrival = cursor + driveSeconds * 1000;
      const serviceStart = inProgress
        ? arrival
        : Math.max(arrival, stop.scheduledAt);
      const lateSeconds = inProgress
        ? 0
        : Math.max(0, (arrival - stop.scheduledAt) / 1000);
      const leg: TrafficLeg = {
        ...(previous ? { fromJobId: previous.job.id } : {}),
        toJobId: stop.job.id,
        departureTime,
        arrivalTime: new Date(arrival).toISOString(),
        driveSeconds,
        staticDriveSeconds,
        delaySeconds: Math.max(0, driveSeconds - staticDriveSeconds),
        distanceMeters,
        serviceStartTime: new Date(serviceStart).toISOString(),
        waitSeconds: (serviceStart - arrival) / 1000,
        lateSeconds,
      };
      if (lateSeconds > 0 && !inProgress) {
        leg.etaProof = await signEtaProof(
          {
            version: 1,
            userId: options.userId,
            jobId: stop.job.id,
            etaMinutes: Math.max(
              0,
              Math.ceil((arrival - now.getTime()) / 60_000),
            ),
            arrivalAt: leg.arrivalTime,
            evidenceAt,
            expiresAt,
            jobFingerprint: await trafficJobFingerprint(workspace, stop.job),
            lateSeconds,
          },
          options.apiKey,
        );
      }
      legs.push(leg);
      cursor = serviceStart + stop.job.duration * 60_000;
      previous = stop;
    }
    return {
      status: "available",
      provider: "Google Routes",
      checkedAt: evidenceAt,
      expiresAt,
      date: prepared.request.date,
      crew: prepared.request.crew,
      legs,
      totalDriveSeconds: legs.reduce((sum, leg) => sum + leg.driveSeconds, 0),
      totalDelaySeconds: legs.reduce((sum, leg) => sum + leg.delaySeconds, 0),
      finishTime: new Date(cursor).toISOString(),
      ...(timingAssumption ? { timingAssumption } : {}),
    };
  } catch {
    // Provider errors can contain addresses or credentials; never surface or log them.
    return trafficUnavailable(
      "provider_error",
      "Traffic could not be checked. Try again shortly.",
    );
  }
}
