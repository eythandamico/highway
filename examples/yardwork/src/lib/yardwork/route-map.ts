export type MapPoint = { lat: number; lng: number };
export type DeviceFix = MapPoint & { accuracy: number; timestamp: number };
export type MapStop = {
  id: string;
  number: number;
  name: string;
  address: string;
  time: string;
  status: string;
  point?: MapPoint;
};
export type RoadRoute = {
  points: MapPoint[];
  distance: number;
  duration: number;
  origin: MapPoint | null;
  checkedAt: number;
};
export const MAP_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const ROUTING_ORIGIN =
  "https://routing.openstreetmap.de/routed-car/route/v1/driving/";
export const PHOTON_ORIGIN = "https://photon.komoot.io/api/";
export const isPoint = (p: unknown): p is MapPoint =>
  !!p &&
  typeof p === "object" &&
  "lat" in p &&
  "lng" in p &&
  typeof p.lat === "number" &&
  typeof p.lng === "number" &&
  Number.isFinite(p.lat) &&
  Number.isFinite(p.lng) &&
  Math.abs(p.lat) <= 85 &&
  Math.abs(p.lng) <= 180;
export function distanceMeters(a: MapPoint, b: MapPoint) {
  const r = Math.PI / 180,
    dlat = (b.lat - a.lat) * r,
    dlng = (b.lng - a.lng) * r,
    h =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dlng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
export function freshFix(fix: DeviceFix | null, now = Date.now()) {
  return (
    !!fix &&
    isPoint(fix) &&
    fix.accuracy >= 0 &&
    fix.accuracy <= 1000 &&
    now - fix.timestamp >= -5000 &&
    now - fix.timestamp < 60000
  );
}
export function routeUrl(points: MapPoint[]) {
  if (
    points.length < 2 ||
    points.length > 21 ||
    points.some((p) => !isPoint(p))
  )
    throw new Error("Choose between 2 and 21 route points.");
  return (
    ROUTING_ORIGIN +
    points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(";") +
    "?overview=full&geometries=geojson&steps=false&radiuses=" +
    points.map(() => 200).join(";")
  );
}
export function parseRoadRoute(
  value: unknown,
  origin: MapPoint | null,
  now = Date.now(),
): RoadRoute {
  const data = value as {
    code?: string;
    routes?: {
      geometry?: { type?: string; coordinates?: unknown[] };
      distance?: number;
      duration?: number;
    }[];
  };
  const r = data?.routes?.[0];
  if (
    data?.code !== "Ok" ||
    !r ||
    r.geometry?.type !== "LineString" ||
    !Array.isArray(r.geometry.coordinates) ||
    r.geometry.coordinates.length < 2 ||
    r.geometry.coordinates.length > 50000 ||
    typeof r.distance !== "number" ||
    !Number.isFinite(r.distance) ||
    r.distance < 0 ||
    typeof r.duration !== "number" ||
    !Number.isFinite(r.duration) ||
    r.duration < 0
  )
    throw new Error(
      "A driving route could not be found. Check the stop addresses or try again.",
    );
  const points = r.geometry.coordinates.map((coordinate) => {
    if (!Array.isArray(coordinate) || coordinate.length < 2)
      throw new Error("The map service returned an incomplete route.");
    const p = { lng: coordinate[0], lat: coordinate[1] };
    if (!isPoint(p))
      throw new Error("The map service returned an incomplete route.");
    return p;
  });
  return {
    points,
    distance: r.distance,
    duration: r.duration,
    origin,
    checkedAt: now,
  };
}
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(
      /\b(st|rd|ave|blvd|dr|ln|ct|cres|hwy)\b/g,
      (w) =>
        ({
          st: "street",
          rd: "road",
          ave: "avenue",
          blvd: "boulevard",
          dr: "drive",
          ln: "lane",
          ct: "court",
          cres: "crescent",
          hwy: "highway",
        })[w]!,
    )
    .replace(/[^a-z0-9]/g, "");
const regions: Record<string, string> = {
  on: "ontario",
  bc: "britishcolumbia",
  ab: "alberta",
  qc: "quebec",
  mb: "manitoba",
  sk: "saskatchewan",
  ns: "novascotia",
  nb: "newbrunswick",
  nl: "newfoundlandandlabrador",
  pe: "princeedwardisland",
  yt: "yukon",
  nt: "northwestterritories",
  nu: "nunavut",
};
export function parseMapAddress(value: unknown, address: string): MapPoint {
  const data = value as {
    features?: {
      geometry?: { coordinates?: unknown[] };
      properties?: Record<string, unknown>;
    }[];
  };
  const parts = address.split(",").map((s) => s.trim()),
    match = parts[0].match(/^(\d+[a-z]?(?:-\d+)?)\s+(.+)$/i);
  if (!match || !parts[1] || !parts[2])
    throw new Error(
      "Add the street number, street, city and province or country to this customer’s address.",
    );
  const matches: MapPoint[] = [];
  for (const feature of data?.features || []) {
    const p = feature.properties,
      c = feature.geometry?.coordinates;
    if (!p || !Array.isArray(c)) continue;
    if (
      normalize(String(p.housenumber || "")) !== normalize(match[1]) ||
      normalize(String(p.street || "")) !== normalize(match[2])
    )
      continue;
    if (
      ![p.city, p.town, p.village, p.district].some(
        (city) =>
          typeof city === "string" && normalize(city) === normalize(parts[1]),
      )
    )
      continue;
    if (
      parts.slice(2).some((part) => {
        const region = normalize(part),
          target = regions[region] || region;
        return (
          ![p.state, p.country, p.countrycode].some(
            (v) => typeof v === "string" && normalize(v) === target,
          ) ||
          (!!regions[region] && p.countrycode !== "CA")
        );
      })
    )
      continue;
    const point = { lng: c[0], lat: c[1] };
    if (
      isPoint(point) &&
      !matches.some((existing) => distanceMeters(point, existing) < 50)
    )
      matches.push(point);
  }
  if (matches.length !== 1)
    throw new Error(
      "The street address could not be matched confidently. Check the customer’s street number and city.",
    );
  return matches[0];
}
let routingTurn: Promise<void> = Promise.resolve(),
  lastRoutingCall = 0;
export async function mapJson(
  url: string,
  signal: AbortSignal,
  fetcher = fetch,
) {
  if (url.startsWith(ROUTING_ORIGIN)) {
    const turn = routingTurn.then(async () => {
      const wait = Math.max(0, lastRoutingCall + 1100 - Date.now());
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      signal.throwIfAborted();
      lastRoutingCall = Date.now();
    });
    routingTurn = turn.catch(() => {});
    await turn;
  }
  signal.throwIfAborted();
  const response = await fetcher(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(18000)]),
  });
  if (!response.ok)
    throw new Error("The map service is busy. Try again in a moment.");
  const text = await response.text();
  if (text.length > 4_000_000)
    throw new Error("The route is too large to display.");
  return JSON.parse(text) as unknown;
}
// Approximate, fictional sample pins, never a device location or verified customer address.
const samplePins: Record<string, MapPoint> = {
  "27 Woodbine Avenue, Toronto": { lat: 43.6687, lng: -79.3054 },
  "42 Oak Street, Toronto": { lat: 43.6616, lng: -79.3655 },
  "65 Queen Street East, Toronto": { lat: 43.6539, lng: -79.3745 },
  "118 Kingston Road, Toronto": { lat: 43.6699, lng: -79.3093 },
  "89 Danforth Avenue, Toronto": { lat: 43.6769, lng: -79.3575 },
  "14 Logan Avenue, Toronto": { lat: 43.6544, lng: -79.3395 },
};
export function exampleMapStops(stops: MapStop[]) {
  return stops.map((stop) => ({ ...stop, point: samplePins[stop.address] }));
}
