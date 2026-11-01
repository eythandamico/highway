"use client";
import IntegrationHub from "./integration-hub";
import { NativeSelect } from "../../../../../packages/highway-react/src/components/ui/native-select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useOffice } from "./context";
import {
  Button,
  SearchField,
  Status,
  FormDialog,
  Modal,
  Confirm,
} from "./shared";
import {
  serviceConnectors,
  connectorCategories,
  recordKinds,
  type ConnectorConnection,
  type ConnectorDelivery,
  type RecordKind,
} from "../../lib/yardwork/service-connectors";
export default function Connectors() {
  const { state, request, demo } = useOffice(),
    [canManage,setCanManage]=useState(false),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All services"),
    [connections, setConnections] = useState<ConnectorConnection[]>([]),
    [history, setHistory] = useState<ConnectorDelivery[]>([]),
    [connect, setConnect] = useState<string | null>(null),
    [disconnect, setDisconnect] = useState<string | null>(null),
    [exportId, setExportId] = useState<string | null>(null),
    [kind, setKind] = useState<RecordKind>("customers"),
    [ids, setIds] = useState<string[]>([]),
    [preview, setPreview] = useState<{ payload: unknown; hash: string } | null>(
      null,
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function load() {
    if (demo) return;
    try {
      const data = await request<{
        connections: ConnectorConnection[];
        history: ConnectorDelivery[];
        canManageConnections:boolean;
      }>("/api/service-connectors");
      setConnections(data.connections);
      setHistory(data.history);
      setCanManage(data.canManageConnections);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load connections.");
    }
  }
  useEffect(() => {
    if (demo) return;
    const control = new AbortController();
    request<{
      connections: ConnectorConnection[];
      history: ConnectorDelivery[];
        canManageConnections:boolean;
    }>("/api/service-connectors")
      .then((data) => {
        if (!control.signal.aborted) {
          setConnections(data.connections);
          setHistory(data.history);
      setCanManage(data.canManageConnections);
        }
      })
      .catch((e) => {
        if (!control.signal.aborted) setError(e.message);
      });
    return () => control.abort();
  }, [demo, request]);
  async function run(fn: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete.");
    } finally {
      setBusy(false);
    }
  }
  const selected = connections.find((c) => c.id === exportId),
    records = state[kind];
  return (
    <>
      <IntegrationHub />
      <div className="yw-note">
        <h2>Business tools</h2>
        <p>
          Yardwork manages these connections. Available tools let you export only the records you review.
        </p>
        {demo && <p>Connections are disabled in the sample workspace.</p>}
      </div>
      {!canManage&&!connections.length&&<p className="muted">No additional business tools are available for your workspace yet.</p>}
      {(canManage||connections.length>0)&&<div className="yw-toolbar yw-subsection">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Find a service"
        />
        <NativeSelect
          className="yw-select"
          aria-label="Service category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {connectorCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </NativeSelect>
      </div>
      }
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {serviceConnectors
        .filter(
          (s) =>
            (canManage || connections.some(c=>c.service===s.id)) &&
            !["stripe", "google-calendar", "outlook"].includes(s.id) &&
            (category === "All services" || s.category === category) &&
            `${s.name} ${s.description}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .map((s) => {
          const connection = connections.find((c) => c.service === s.id);
          return (
            <div className="yw-row" key={s.id}>
              <div className="yw-row-main">
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <small>{s.category}</small>
              </div>
              <div className="yw-actions">
                {connection ? (
                  <>
                    <Status tone="good">Bridge configured</Status>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setExportId(connection.id);
                        setIds([]);
                        setPreview(null);
                      }}
                    >
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setDisconnect(connection.id)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : s.zapier && canManage ? (
                  <Button
                    variant="secondary"
                    disabled={demo}
                    onClick={() => setConnect(s.id)}
                  >
                    Connect via Zapier
                  </Button>
                ) : (
                  <Status>Separate setup needed</Status>
                )}
              </div>
            </div>
          );
        })}
      {history.length > 0 && (
        <section className="yw-subsection">
          <h2>Export history</h2>
          {history.map((h) => (
            <div className="yw-row" key={h.id}>
              <div className="yw-row-main">
                <p>
                  {h.count} {h.kind} · {new Date(h.createdAt).toLocaleString()}
                </p>
              </div>
              <Status>
                {h.status === "accepted" ? "Accepted by bridge" : h.status}
              </Status>
            </div>
          ))}
        </section>
      )}
      {connect && (
        <FormDialog
          title={`Connect ${serviceConnectors.find((c) => c.id === connect)?.name}`}
          description="This sends a synthetic connection-test event to your Zapier hook. Filter test events out of live actions. No customer records are included in this test."
          fields={[
            { name: "hook", label: "Zapier Catch Hook URL", type: "url" },
            {
              name: "kind",
              label: "Example record type",
              options: recordKinds.map((k) => ({ value: k, label: k })),
            },
          ]}
          initial={{ hook: "", kind: "customers" }}
          submit="Test & connect"
          onSave={async (v) => {
            await request("/api/service-connectors", {
              action: "connect",
              service: connect,
              ...v,
              consent: true,
            });
            await load();
          }}
          onClose={() => setConnect(null)}
        />
      )}
      {disconnect && (
        <Confirm
          title="Disconnect this bridge?"
          description="The destination will be removed. Previously exported records stay in the receiving service."
          onConfirm={async () => {
            await request("/api/service-connectors", {
              action: "disconnect",
              id: disconnect,
            });
            await load();
          }}
          onClose={() => setDisconnect(null)}
        />
      )}
      {selected && (
        <Modal
          title="Review a record export"
          description="Choose exactly which records to send. Acceptance by the bridge does not guarantee completion in the destination app."
          open
          onClose={() => setExportId(null)}
        >
          <NativeSelect
            className="yw-select"
            aria-label="Record type"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as RecordKind);
              setIds([]);
              setPreview(null);
            }}
          >
            {recordKinds.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </NativeSelect>
          <div className="yw-checklist">
            {records.map((r) => (
              <label key={r.id}>
                <input
                  type="checkbox"
                  checked={ids.includes(r.id)}
                  onChange={(e) => {
                    setIds((all) =>
                      e.target.checked
                        ? [r.id]
                        : all.filter((id) => id !== r.id),
                    );
                    setPreview(null);
                  }}
                />
                {"name" in r
                  ? r.name
                  : `${r.service} · ${state.customers.find((c) => c.id === r.customerId)?.name}`}
              </label>
            ))}
          </div>
          {preview ? (
            <>
              <p>
                {ids.length} {kind} ready to send to{" "}
                {serviceConnectors.find((s) => s.id === selected.service)?.name}
                .
              </p>
              <Button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const result = await request<{
                      delivery: ConnectorDelivery;
                    }>("/api/service-connectors", {
                      action: "send",
                      id: selected.id,
                      kind,
                      ids,
                      reviewedHash: preview.hash,
                      consent: true,
                    });
                    toast.success(`Export ${result.delivery.status}`);
                    setExportId(null);
                    await load();
                  })
                }
              >
                Send reviewed records
              </Button>
            </>
          ) : (
            <Button
              disabled={!ids.length || busy}
              onClick={() =>
                void run(async () =>
                  setPreview(
                    await request("/api/service-connectors", {
                      action: "preview",
                      id: selected.id,
                      kind,
                      ids,
                    }),
                  ),
                )
              }
            >
              Review selected records
            </Button>
          )}
          {error && <p role="alert">{error}</p>}
        </Modal>
      )}
    </>
  );
}
