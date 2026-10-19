/** Public business discovery only: a map listing is not evidence of buying intent. */
export type ProspectCategory = "property" | "hospitality" | "community";
export type ProspectArea = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};
export type Prospect = {
  id: string;
  name: string;
  address: string;
  area: string;
  lat: number;
  lon: number;
  category: ProspectCategory;
  website: string;
  phone: string;
  sourceUrl: string;
  distanceKm: number;
  foundAt: string;
};
export type ProspectSearchRequest =
  | { action: "areas"; query: string }
  | {
      action: "nearby";
      area: ProspectArea;
      category: ProspectCategory;
      radiusKm: 2 | 5;
    };
export type ProspectSearchResponse =
  | {
      status: "ok" | "empty";
      areas: ProspectArea[];
      cached: boolean;
      message?: string;
    }
  | {
      status: "ok" | "empty";
      prospects: Prospect[];
      area: ProspectArea;
      category: ProspectCategory;
      radiusKm: 2 | 5;
      cached: boolean;
      message?: string;
    };
export type ProspectSearchErrorStatus =
  | "invalid_request"
  | "unavailable"
  | "rate_limited"
  | "sign_in_required";
export class ProspectSearchError extends Error {
  status: ProspectSearchErrorStatus;
  httpStatus: number;
  retryAfterSeconds?: number;
  constructor(
    message: string,
    status: ProspectSearchErrorStatus = "invalid_request",
    httpStatus = 400,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ProspectSearchError";
    this.status = status;
    this.httpStatus = httpStatus;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const ENDPOINT = "https://overpass.private.coffee/api/interpreter";
const CACHE_MS = 15 * 60_000;
const COOLDOWN_MS = 20_000;
const TIMEOUT_MS = 25_000;
const MAX_RESPONSE_BYTES = 1_048_576;
const MAX_CACHE_ENTRIES = 64;
const categories = new Set<ProspectCategory>([
  "property",
  "hospitality",
  "community",
]);
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 180): string =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";
const coords = (lat: unknown, lon: unknown): lat is number =>
  typeof lat === "number" &&
  Number.isFinite(lat) &&
  Math.abs(lat) <= 90 &&
  typeof lon === "number" &&
  Number.isFinite(lon) &&
  Math.abs(lon) <= 180;

export function parseProspectSearchRequest(
  value: unknown,
): ProspectSearchRequest {
  if (!record(value))
    throw new ProspectSearchError(
      "Choose an area and business type to search.",
    );
  if (value.action === "areas") {
    const query = value.query === undefined ? "Toronto, ON" : value.query;
    if (
      typeof query !== "string" ||
      query.trim().length < 2 ||
      query.length > 120 ||
      /[\u0000-\u001f\u007f]/.test(query) ||
      query.split(",")[0].trim().length < 2
    )
      throw new ProspectSearchError(
        "Enter a city, town, or neighbourhood name.",
      );
    return { action: "areas", query: query.trim() };
  }
  if (value.action === "nearby" && record(value.area)) {
    const { id, label, lat, lon } = value.area;
    const radiusKm = value.radiusKm === undefined ? 5 : value.radiusKm;
    if (
      typeof id !== "string" ||
      !/^(node|way|relation):[1-9]\d{0,15}$/.test(id) ||
      typeof label !== "string" ||
      !label.trim() ||
      label.length > 250 ||
      !coords(lat, lon) ||
      typeof value.category !== "string" ||
      !categories.has(value.category as ProspectCategory) ||
      (radiusKm !== 2 && radiusKm !== 5)
    )
      throw new ProspectSearchError(
        "Choose a listed area, business type, and a 2 or 5 km radius.",
      );
    return {
      action: "nearby",
      area: { id, label: text(label, 250), lat, lon: lon as number },
      category: value.category as ProspectCategory,
      radiusKm,
    };
  }
  throw new ProspectSearchError("Choose an area and business type to search.");
}

// Escape both regex syntax and the quoted QL string: an exact name, with case ignored.
const qlString = (value: string) =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const exactName = (value: string) =>
  `^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`;
export function prospectQuery(input: ProspectSearchRequest): string {
  if (input.action === "areas")
    return `[out:json][timeout:20][maxsize:8388608];nwr["place"~"^(city|town|village|suburb|neighbourhood)$"]["name"~${qlString(exactName(input.query.split(",")[0].trim()))},"i"];out center 10;`;
  const around = `(around:${input.radiusKm * 1000},${input.area.lat.toFixed(6)},${input.area.lon.toFixed(6)})`;
  const tag =
    input.category === "property"
      ? '["office"~"^(property_management|estate_agent)$"]'
      : input.category === "hospitality"
        ? '["tourism"~"^(hotel|guest_house)$"]'
        : '["amenity"~"^(school|kindergarten|place_of_worship|community_centre)$"]';
  return `[out:json][timeout:20][maxsize:8388608];nwr${around}${tag}["name"];out center 160;`;
}

type Element = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  tags: Record<string, unknown>;
  sourceUrl: string;
};
function element(value: unknown): Element | null {
  if (
    !record(value) ||
    !["node", "way", "relation"].includes(String(value.type)) ||
    !Number.isSafeInteger(value.id) ||
    (value.id as number) <= 0 ||
    !record(value.tags)
  )
    return null;
  const center = record(value.center) ? value.center : value;
  const { lat, lon } = center,
    name = text(value.tags.name);
  if (!name || !coords(lat, lon)) return null;
  return {
    id: `${value.type}:${value.id}`,
    name,
    lat,
    lon: lon as number,
    tags: value.tags,
    sourceUrl: `https://www.openstreetmap.org/${value.type}/${value.id}`,
  };
}
function uniqueText(values: unknown[], max = 250): string {
  const seen = new Set<string>();
  return values
    .map((value) => text(value))
    .filter((value) => {
      const key = value.toLocaleLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(", ")
    .slice(0, max);
}
function areaLabel(row: Element): string {
  const t = row.tags;
  return uniqueText([
    row.name,
    t["addr:city"] || t["is_in:city"],
    t["addr:province"] || t["addr:state"] || t["is_in:state"],
    t["addr:country"] || t["is_in:country"] || t["is_in"],
  ]);
}
function website(value: unknown): string {
  const candidate = text(value, 1001);
  if (!candidate || candidate.length > 1000) return "";
  try {
    const url = new URL(
      candidate.startsWith("www.") ? `https://${candidate}` : candidate,
    );
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      url.href.length <= 1000
      ? url.href
      : "";
  } catch {
    return "";
  }
}
function phone(value: unknown): string {
  const candidate = text(value, 80).split(";")[0].trim();
  const digits = candidate.replace(/\D/g, "").length;
  return digits >= 7 &&
    digits <= 24 &&
    /^[+()\d\s.\-/xextEXT#]+$/.test(candidate)
    ? candidate
    : "";
}
export function prospectDistanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const rad = Math.PI / 180,
    dLat = (b.lat - a.lat) * rad,
    dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return (
    6371.0088 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)))
  );
}
function matchesCategory(
  tags: Record<string, unknown>,
  category: ProspectCategory,
): boolean {
  return category === "property"
    ? ["property_management", "estate_agent"].includes(String(tags.office))
    : category === "hospitality"
      ? ["hotel", "guest_house"].includes(String(tags.tourism))
      : [
          "school",
          "kindergarten",
          "place_of_worship",
          "community_centre",
        ].includes(String(tags.amenity));
}
function results(
  elements: unknown[],
  input: ProspectSearchRequest,
  foundAt: string,
): ProspectSearchResponse {
  const rows = elements
    .map(element)
    .filter((row): row is Element => row !== null);
  if (input.action === "areas") {
    const city = input.query.split(",")[0].trim().toLocaleLowerCase(),
      seen = new Set<string>();
    const areas = rows
      .filter(
        (row) =>
          ["city", "town", "village", "suburb", "neighbourhood"].includes(
            String(row.tags.place),
          ) &&
          row.name.toLocaleLowerCase() === city &&
          !seen.has(row.id) &&
          !!seen.add(row.id),
      )
      .slice(0, 10)
      .map((row) => ({
        id: row.id,
        label: areaLabel(row),
        lat: row.lat,
        lon: row.lon,
      }));
    return {
      status: areas.length ? "ok" : "empty",
      areas,
      cached: false,
      ...(areas.length
        ? {}
        : {
            message:
              "No mapped area matched that name. Try the city name without an abbreviation.",
          }),
    };
  }
  const ids = new Set<string>(),
    businesses = new Set<string>();
  const prospects: Prospect[] = [];
  for (const row of rows) {
    const distance = prospectDistanceKm(input.area, row);
    if (
      !matchesCategory(row.tags, input.category) ||
      distance > input.radiusKm ||
      ids.has(row.id)
    )
      continue;
    const t = row.tags;
    const street = [text(t["addr:housenumber"]), text(t["addr:street"])]
      .filter(Boolean)
      .join(" ");
    const address =
      text(t["addr:full"], 300) ||
      uniqueText(
        [
          street,
          t["addr:unit"] ? `Unit ${text(t["addr:unit"])}` : "",
          t["addr:city"],
          t["addr:state"] || t["addr:province"],
          t["addr:postcode"],
        ],
        300,
      );
    // A node and a building outline can describe the same listed business.
    const preciseAddress = text(t["addr:full"], 300) || (street ? address : "");
    const businessKey = `${row.name.toLocaleLowerCase()}|${preciseAddress.toLocaleLowerCase() || `${row.lat.toFixed(4)},${row.lon.toFixed(4)}`}`;
    if (businesses.has(businessKey)) continue;
    ids.add(row.id);
    businesses.add(businessKey);
    prospects.push({
      id: row.id,
      name: row.name,
      address,
      area: input.area.label,
      lat: row.lat,
      lon: row.lon,
      category: input.category,
      website: website(t.website || t["contact:website"]),
      phone: phone(t.phone || t["contact:phone"]),
      sourceUrl: row.sourceUrl,
      distanceKm: Math.round(distance * 100) / 100,
      foundAt,
    });
  }
  prospects.sort(
    (a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name),
  );
  return {
    status: prospects.length ? "ok" : "empty",
    prospects: prospects.slice(0, 40),
    area: input.area,
    category: input.category,
    radiusKm: input.radiusKm,
    cached: false,
    ...(prospects.length
      ? {}
      : {
          message:
            "No named public listings were found for this category in the selected radius. Map coverage varies; try another category or area.",
        }),
  };
}

async function readProvider(response: Response): Promise<unknown[]> {
  if (response.status === 429)
    throw new ProspectSearchError(
      "The public listing service is busy. Try again in a minute.",
      "rate_limited",
      429,
      60,
    );
  if (!response.ok)
    throw new ProspectSearchError(
      "The public listing service is temporarily unavailable. Try again later.",
      "unavailable",
      503,
    );
  if (Number(response.headers.get("content-length")) > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw new ProspectSearchError(
      "The listing response was too large. Try a smaller area.",
      "unavailable",
      503,
    );
  }
  const reader = response.body?.getReader();
  if (!reader)
    throw new ProspectSearchError(
      "The public listing service returned an incomplete response.",
      "unavailable",
      503,
    );
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new ProspectSearchError(
        "The listing response was too large. Try a smaller area.",
        "unavailable",
        503,
      );
    }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ProspectSearchError(
      "The public listing service returned an unreadable response.",
      "unavailable",
      503,
    );
  }
  if (!record(json) || !Array.isArray(json.elements) || json.remark)
    throw new ProspectSearchError(
      "The public listing service could not finish this search. Try again later.",
      "unavailable",
      503,
    );
  return json.elements;
}

/** Limits are per server instance, not a distributed quota. Public results contain no workspace data. */
export function createProspectSearch(
  options: {
    fetch?: typeof fetch;
    now?: () => number;
    timeoutMs?: number;
  } = {},
) {
  const fetcher = options.fetch || fetch,
    now = options.now || Date.now;
  const cache = new Map<
    string,
    { expiresAt: number; value: ProspectSearchResponse }
  >();
  const cooldowns = new Map<string, number>();
  const inflight = new Map<string, Promise<ProspectSearchResponse>>();
  return async (
    userId: string,
    unknownInput: unknown,
  ): Promise<ProspectSearchResponse> => {
    if (!userId)
      throw new ProspectSearchError(
        "Sign in to find nearby prospects.",
        "sign_in_required",
        401,
      );
    const input = parseProspectSearchRequest(unknownInput),
      time = now();
    const query = prospectQuery(input),
      key = query;
    for (const [key, entry] of cache)
      if (entry.expiresAt <= time) cache.delete(key);
    for (const [key, expiresAt] of cooldowns)
      if (expiresAt <= time) cooldowns.delete(key);
    const cached = cache.get(key);
    // Use this request's selected label; a cache hit must not borrow another user's display label.
    const withArea = (
      value: ProspectSearchResponse,
      cached: boolean,
    ): ProspectSearchResponse =>
      input.action === "nearby" && "prospects" in value
        ? {
            ...value,
            cached,
            area: input.area,
            prospects: value.prospects.map((prospect) => ({
              ...prospect,
              area: input.area.label,
            })),
          }
        : { ...value, cached };
    if (cached) return withArea(cached.value, true);
    const running = inflight.get(key);
    if (running) return withArea(await running, true);
    const cooldownKey = `${userId}:${input.action}`,
      expiresAt = cooldowns.get(cooldownKey) || 0;
    if (expiresAt > time)
      throw new ProspectSearchError(
        "Please wait briefly before starting another search.",
        "rate_limited",
        429,
        Math.ceil((expiresAt - time) / 1000),
      );
    if (inflight.size >= 2)
      throw new ProspectSearchError(
        "Another listing search is running. Try again shortly.",
        "rate_limited",
        429,
        10,
      );
    if (cooldowns.size >= 1000)
      throw new ProspectSearchError(
        "Listing search is busy. Try again shortly.",
        "rate_limited",
        429,
        20,
      );
    cooldowns.set(cooldownKey, time + COOLDOWN_MS);
    const pending = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        options.timeoutMs ?? TIMEOUT_MS,
      );
      try {
        const response = await fetcher(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "User-Agent":
              "YardworkPublicProspectSearch/1.0 (+https://github.com/easy-launch-apps/yardwork)",
          },
          body: new URLSearchParams({ data: query }).toString(),
          signal: controller.signal,
          redirect: "error",
        });
        const value = results(
          await readProvider(response),
          input,
          new Date(now()).toISOString(),
        );
        if (cache.size >= MAX_CACHE_ENTRIES)
          cache.delete(cache.keys().next().value!);
        cache.set(key, { expiresAt: now() + CACHE_MS, value });
        return value;
      } catch (error) {
        if (error instanceof ProspectSearchError) throw error;
        throw new ProspectSearchError(
          controller.signal.aborted
            ? "The public listing search timed out. Try again later."
            : "The public listing service could not be reached. Try again later.",
          "unavailable",
          503,
        );
      } finally {
        clearTimeout(timeout);
      }
    })();
    inflight.set(key, pending);
    try {
      return withArea(await pending, false);
    } finally {
      inflight.delete(key);
    }
  };
}
