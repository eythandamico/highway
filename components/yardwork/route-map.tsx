"use client";
import { NativeSelect } from "@/components/ui/native-select";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Navigation, LocateFixed } from "lucide-react";
import { useOffice } from "./context";
import { Button, Status, Modal, Textarea } from "./shared";
import type { Job } from "@/lib/yardwork/yardwork";
import {
  exampleMapStops,
  mapJson,
  parseMapAddress,
  PHOTON_ORIGIN,
  routeUrl,
  parseRoadRoute,
  freshFix,
  type DeviceFix,
} from "@/lib/yardwork/route-map";
import type { TrafficResponse, TrafficLeg } from "@/lib/yardwork/traffic";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
type Notice = {
  draftId: string;
  channel: "sms" | "call";
  customer: { name: string; phone: string };
  body: string;
  status: string;
  canSend: boolean;
  reason: string;
  customerName: string;
};
export default function RouteMap({ jobs }: { jobs: Job[] }) {
  const { state, demo, request } = useOffice(),
    element = useRef<HTMLDivElement>(null),
    map = useRef<LeafletMap | null>(null),
    controller = useRef<AbortController | null>(null),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [fix, setFix] = useState<DeviceFix | null>(null),
    [traffic, setTraffic] = useState<TrafficResponse | null>(null),
    [notice, setNotice] = useState<Notice | null>(null),
    [body, setBody] = useState(""),
    [crew, setCrew] = useState(jobs[0]?.crew || state.business.crew1),
    [trafficConnection, setTrafficConnection] = useState<{
      canUse: boolean;
      message: string;
    } | null>(null);
  const stops = useMemo(
    () =>
      jobs
        .filter((j) => j.crew === crew)
        .map((j, index) => ({
          id: j.id,
          number: index + 1,
          time: j.time,
          status: j.status,
          address:
            state.customers.find((c) => c.id === j.customerId)?.address || "",
          name:
            state.customers.find((c) => c.id === j.customerId)?.name ||
            j.service,
        })),
    [jobs, crew, state.customers],
  );
  useEffect(() => {
    let active = true;
    import("leaflet").then((L) => {
      if (!active || !element.current) return;
      map.current = L.map(element.current, { scrollWheelZoom: false }).setView(
        [43.66, -79.35],
        12,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);
      setReady(true);
    });
    return () => {
      active = false;
      controller.current?.abort();
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    if (!demo)
      request<{ canUse: boolean; message: string }>("/api/route-eta")
        .then(setTrafficConnection)
        .catch(() =>
          setTrafficConnection({
            canUse: false,
            message: "Live traffic connection unavailable.",
          }),
        );
  }, [demo, request]);
  const draw = useCallback(async () => {
    if (!map.current) return;
    controller.current?.abort();
    const control = new AbortController();
    controller.current = control;
    setBusy(true);
    setMessage("");
    try {
      const L = await import("leaflet");
      const colors = getComputedStyle(element.current!);
      const routeColor = colors.getPropertyValue("--map-route").trim();
      const locationColor = colors.getPropertyValue("--map-location").trim();
      const mapped = demo
        ? exampleMapStops(stops)
        : await Promise.all(
            stops.slice(0, 20).map(async (stop) => ({
              ...stop,
              point: parseMapAddress(
                await mapJson(
                  `${PHOTON_ORIGIN}?q=${encodeURIComponent(stop.address)}&limit=5`,
                  control.signal,
                ),
                stop.address,
              ),
            })),
          );
      if (control.signal.aborted) return;
      map.current.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) map.current?.removeLayer(layer);
      });
      const points = mapped
        .filter((s) => s.point)
        .map((s, index) => {
          const marker = L.circleMarker([s.point!.lat, s.point!.lng], {
            radius: 10,
            color: routeColor,
            fillColor: routeColor,
            fillOpacity: 1,
          });
          const popup = document.createElement("div");
          popup.textContent = `${index + 1}. ${s.name} · ${s.address}`;
          marker.bindPopup(popup).addTo(map.current!);
          return s.point!;
        });
      const origin = freshFix(fix) ? fix : null;
      if (origin) {
        L.circleMarker([origin.lat, origin.lng], {
          radius: 8,
          color: locationColor,
        })
          .bindTooltip("Your location")
          .addTo(map.current);
        points.unshift(origin);
      }
      if (points.length) {
        map.current.fitBounds(
          L.latLngBounds(points.map((p) => [p.lat, p.lng])),
          { padding: [30, 30], maxZoom: 14 },
        );
      }
      if (points.length >= 2 && !demo) {
        const route = parseRoadRoute(
          await mapJson(routeUrl(points), control.signal),
          origin,
        );
        L.polyline(
          route.points.map((p) => [p.lat, p.lng]),
          { color: routeColor, weight: 4 },
        ).addTo(map.current);
        setMessage(
          `${(route.distance / 1000).toFixed(1)} km · ${Math.round(route.duration / 60)} min driving, without traffic. Appointment order retained.`,
        );
      } else
        setMessage(
          demo
            ? "Example property pins. Locations and travel times are illustrative."
            : points.length
              ? "One stop located."
              : "No stops to map.",
        );
    } catch (e) {
      if (!control.signal.aborted)
        setMessage(e instanceof Error ? e.message : "Route unavailable.");
    } finally {
      if (!control.signal.aborted) setBusy(false);
    }
  }, [demo, stops, fix]);
  useEffect(() => {
    if (ready && demo) void draw();
  }, [ready, demo, draw]);
  function locate() {
    if (!navigator.geolocation) {
      setMessage("This browser does not support location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (position.coords.accuracy > 1000) {
          setMessage("Location accuracy is too low. Try again outdoors.");
          return;
        }
        setFix({
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setMessage(
          "Location is ready. Load the route or check live traffic to use it.",
        );
      },
      () =>
        setMessage(
          "Location permission was unavailable. You can still use the appointment list.",
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }
  async function checkTraffic() {
    setBusy(true);
    try {
      const result = await request<TrafficResponse>("/api/route-eta", {
        date: jobs[0]?.date,
        crew,
        ...(freshFix(fix) && fix
          ? { origin: { latitude: fix.lat, longitude: fix.lng } }
          : {}),
      });
      setTraffic(result);
      if (
        result.status === "available" &&
        state.notificationPreferences?.lateTexts === "automatic"
      ) {
        for (const leg of result.legs.filter(
          (l) => l.etaProof && l.lateSeconds > 0,
        )) {
          await request("/api/customer-notifications", {
            action: "automatic",
            jobId: leg.toJobId,
            etaProof: leg.etaProof,
          });
        }
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Live traffic unavailable.");
    } finally {
      setBusy(false);
    }
  }
  async function prepareNotice(leg: TrafficLeg, channel: "sms" | "call") {
    try {
      const draft = await request<Notice>("/api/customer-notifications", {
        action: "draft",
        jobId: leg.toJobId,
        channel,
        etaProof: leg.etaProof,
      });
      setNotice(draft);
      setBody(draft.body);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Update unavailable.");
    }
  }
  return (
    <section className="stack yw-space-below">
      <div className="yw-actions">
        <NativeSelect
          className="yw-select"
          aria-label="Route crew"
          value={crew}
          onChange={(e) => {
            setCrew(e.target.value);
            setTraffic(null);
          }}
        >
          {[state.business.crew1, state.business.crew2].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </NativeSelect>
        <Button
          variant="secondary"
          disabled={!ready || busy}
          onClick={() => void draw()}
        >
          <Navigation size={16} />
          {busy ? "Checking…" : "Load driving route"}
        </Button>
        <Button variant="ghost" onClick={locate}>
          <LocateFixed size={16} />
          Use my location
        </Button>
      </div>
      {!demo && (
        <p className="muted">
          Loading a route shares the selected addresses with Photon and
          OpenStreetMap routing. Using your location is optional.
        </p>
      )}
      <div ref={element} className="yw-map" aria-label="Route map" />
      {message && (
        <p role="status" className="muted">
          {message}
        </p>
      )}
      {!demo && (
        <>
          <p className="muted">
            {trafficConnection?.message || "Checking live traffic…"}
          </p>
          <Button
            variant="secondary"
            disabled={busy || !trafficConnection?.canUse || !jobs.length}
            onClick={() => void checkTraffic()}
          >
            Check live traffic
          </Button>
        </>
      )}
      {traffic?.status === "unavailable" && <p>{traffic.message}</p>}
      {traffic?.status === "available" &&
        traffic.legs.map((leg) => (
          <div className="yw-row" key={leg.toJobId}>
            <div className="yw-row-main">
              <h3>
                {
                  state.customers.find(
                    (c) =>
                      c.id ===
                      jobs.find((j) => j.id === leg.toJobId)?.customerId,
                  )?.name
                }
              </h3>
              <p>
                Arrival{" "}
                {new Date(leg.arrivalTime).toLocaleTimeString("en-CA", {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                · {Math.round(leg.driveSeconds / 60)} min driving
              </p>
            </div>
            <Status tone={leg.lateSeconds > 0 ? "warning" : "good"}>
              {leg.lateSeconds > 0
                ? `${Math.ceil(leg.lateSeconds / 60)} min late`
                : "On time"}
            </Status>
            {leg.etaProof && leg.lateSeconds > 0 && (
              <Button
                variant="secondary"
                onClick={() => void prepareNotice(leg, "sms")}
              >
                Review text
              </Button>
            )}
            {leg.etaProof && leg.lateSeconds > 0 && (
              <Button
                variant="secondary"
                onClick={() => void prepareNotice(leg, "call")}
              >
                Review call
              </Button>
            )}
          </div>
        ))}
      {notice && (
        <Modal
          title={`Review a late-arrival ${notice.channel === "call" ? "call" : "text"}`}
          description={`Customer: ${notice.customer.name}. Send only after checking the current route and message.`}
          open
          onClose={() => setNotice(null)}
        >
          <Textarea
            aria-label="Late arrival message"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <p>{notice.reason}</p>
          <Button
            disabled={!notice.canSend || busy || notice.status !== "draft"}
            onClick={async () => {
              setBusy(true);
              try {
                const result = await request<Notice>(
                  "/api/customer-notifications",
                  { action: "send", draftId: notice.draftId, body },
                );
                setNotice(result);
                setMessage(`Arrival update ${result.status}.`);
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Could not send.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Send reviewed {notice.channel === "call" ? "call" : "text"}
          </Button>
        </Modal>
      )}
    </section>
  );
}
