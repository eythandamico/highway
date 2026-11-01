"use client";
import { lazy, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useOffice } from "./context";
import { Heading, Button, FormDialog, Modal, Fields, Tabs } from "./shared";
import { normalizeAppearance } from "../../lib/yardwork/appearance";
import { normalizeNotificationPreferences } from "../../lib/yardwork/notification-preferences";
const Connectors = lazy(() => import("./connectors"));
export default function SettingsScreen() {
  const searchParams=useSearchParams();
  const { state, mutate, demo, role } = useOffice(),
    { theme, setTheme } = useTheme(),
    [edit, setEdit] = useState<string | null>(null),
    [tab, setTab] = useState(searchParams.get("connection") ? "connections" : "business");
  const appearance = normalizeAppearance(state.appearance),
    notifications = normalizeNotificationPreferences(
      state.notificationPreferences,
    );
  return (
    <>
      <Heading
        title="Settings"
        description="Make this office feel like your business."
      />
      {!demo&&role==="owner"&&state.onboarding?.dismissed&&<Button variant="secondary" onClick={()=>void mutate("onboarding",{dismissed:false}).catch(()=>{})}>Show setup checklist</Button>}
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "business", label: "Business" },
          { value: "appearance", label: "Appearance" },
          { value: "connections", label: "Services" },
          { value: "files", label: "Files" },
        ]}
      />
      {tab === "connections" ? (
        <Suspense fallback={<p>Opening connections…</p>}>
          <Connectors />
        </Suspense>
      ) : tab === "files" ? (
        <p className="muted">
          Private files are available after signing in. Ask supports temporary
          sample photo attachments.
        </p>
      ) : tab === "appearance" ? (
        <>
          <section className="settings-section">
            <h2>Light & dark</h2>
            <p className="muted">
              Choose a comfortable surface wherever you work.
            </p>
            <div className="theme-options">
              {["system", "light", "dark"].map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "secondary"}
                  aria-pressed={theme === t}
                  onClick={() => setTheme(t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </section>
          <section className="settings-section">
            <h2>Brand & seasonal colour</h2>
            <p className="muted">
              Use your brand, follow the seasons, or choose a custom colour.
              Text contrast stays consistent.
            </p>
            <Button variant="secondary" onClick={() => setEdit("appearance")}>
              Edit colours
            </Button>
          </section>
        </>
      ) : (
        <>
          <section className="settings-section">
            <div className="yw-section-title">
              <h2>{state.business.name}</h2>
              <Button variant="secondary" onClick={() => setEdit("business")}>
                Edit business
              </Button>
            </div>
            <p className="muted">
              {state.business.owner} · {state.business.city} ·{" "}
              {state.business.tax}% tax
            </p>
            <p className="muted">
              {state.business.crew1} and {state.business.crew2}
            </p>
            <p className="muted">Calendar: America/Toronto · Currency: CAD</p>
          </section>
          <section className="settings-section">
            <div className="yw-section-title">
              <h2>Service pricing</h2>
              <Button variant="secondary" onClick={() => setEdit("rates")}>
                Edit rates
              </Button>
            </div>
            <p className="muted">
              Used to prepare quote drafts. Every draft can be adjusted before
              sharing.
            </p>
            {state.rates.map((r) => (
              <div className="yw-row" key={r.service}>
                <div className="yw-row-main">
                  <h3>{r.service}</h3>
                  <p>{r.duration} minutes</p>
                </div>
                <span>
                  {new Intl.NumberFormat("en-CA", {
                    style: "currency",
                    currency: "CAD",
                  }).format(r.price)}
                </span>
              </div>
            ))}
          </section>
          <section className="settings-section">
            <div className="yw-section-title">
              <h2>Document letterhead</h2>
              <Button variant="secondary" onClick={() => setEdit("letterhead")}>
                Edit letterhead
              </Button>
            </div>
            <p className="muted">
              Contact details and footer used on customer quotes and invoices.
            </p>
            <p>{state.letterhead?.address || state.business.city}</p>
            <p>{state.letterhead?.email}</p>
          </section>
          <section className="settings-section">
            <h2>Late-arrival texts</h2>
            <p className="muted">
              Current preference:{" "}
              {notifications.lateTexts === "automatic"
                ? "Automatic, when a verified live route confirms a delay"
                : notifications.lateTexts === "off"
                  ? "Off"
                  : "Review before sending"}
              . A configured SMS service and current route are required.
            </p>
            <Button
              variant="secondary"
              onClick={() => setEdit("notifications")}
            >
              Change preference
            </Button>
          </section>
        </>
      )}
      {edit === "business" && (
        <FormDialog
          title="Business details"
          fields={[
            { name: "name", label: "Business name" },
            { name: "owner", label: "Your name" },
            { name: "city", label: "City and province" },
            {
              name: "tax",
              label: "Tax rate (%)",
              type: "number",
              min: 0,
              max: 30,
              step: 0.01,
            },
            { name: "crew1", label: "First crew name" },
            { name: "crew2", label: "Second crew name" },
          ]}
          initial={state.business}
          onSave={(v) => mutate("settings", v)}
          onClose={() => setEdit(null)}
        />
      )}
      {edit === "letterhead" && (
        <FormDialog
          title="Document letterhead"
          fields={[
            { name: "address", label: "Business address", required: false },
            {
              name: "email",
              label: "Contact email",
              type: "email",
              required: false,
            },
            { name: "phone", label: "Phone", type: "tel", required: false },
            { name: "website", label: "Website", required: false },
            {
              name: "footer",
              label: "Document footer",
              type: "textarea",
              required: false,
            },
          ]}
          initial={
            state.letterhead || {
              address: "",
              email: "",
              phone: "",
              website: "",
              footer: "",
            }
          }
          onSave={(v) => mutate("letterhead", v)}
          onClose={() => setEdit(null)}
        />
      )}
      {edit === "appearance" && (
        <FormDialog
          title="Your colours"
          fields={[
            {
              name: "mode",
              label: "Colour mode",
              options: [
                { value: "brand", label: "Brand" },
                { value: "season", label: "Seasonal" },
                { value: "colour", label: "Custom colour" },
              ],
            },
            {
              name: "season",
              label: "Season",
              options: ["auto", "spring", "summer", "autumn", "winter"].map(
                (s) => ({
                  value: s,
                  label: s === "auto" ? "Current season" : s,
                }),
              ),
            },
            { name: "brandPrimary", label: "Brand primary", type: "color" },
            { name: "brandAccent", label: "Brand accent", type: "color" },
            { name: "colour", label: "Custom colour", type: "color" },
          ]}
          initial={appearance}
          onSave={(v) => mutate("appearance", v)}
          onClose={() => setEdit(null)}
        />
      )}
      {edit === "notifications" && (
        <FormDialog
          title="Late-arrival text preference"
          description="Automatic mode authorizes late-arrival texts only when the connected route service verifies a delay. It does not send follow-up offers or invoice reminders."
          fields={[
            {
              name: "lateTexts",
              label: "Late-arrival updates",
              options: [
                { value: "approval", label: "Review before sending" },
                {
                  value: "automatic",
                  label: "Send automatically for verified delays",
                },
                { value: "off", label: "Off" },
              ],
            },
          ]}
          initial={notifications}
          onSave={(v) => mutate("notification-preferences", v)}
          onClose={() => setEdit(null)}
        />
      )}
      {edit === "rates" && <Rates onClose={() => setEdit(null)} />}
    </>
  );
}
function Rates({ onClose }: { onClose: () => void }) {
  const { state, mutate, busy } = useOffice(),
    [rates, setRates] = useState(state.rates),
    [error, setError] = useState("");
  return (
    <Modal
      title="Service pricing"
      description="Set the usual before-tax price and duration. Quotes remain editable drafts."
      open
      onClose={onClose}
    >
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await mutate("rates", rates);
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save.");
          }
        }}
      >
        {rates.map((rate, index) => (
          <div key={index} className="yw-note stack">
            <Fields
              fields={[
                { name: "service", label: "Service" },
                {
                  name: "price",
                  label: "Price (CAD)",
                  type: "number",
                  min: 0,
                  max: 100000,
                  step: 0.01,
                },
                {
                  name: "duration",
                  label: "Duration (minutes)",
                  type: "number",
                  min: 15,
                  max: 480,
                  step: 15,
                },
              ]}
              values={rate}
              set={(name, value) =>
                setRates((items) =>
                  items.map((r, i) =>
                    i === index
                      ? {
                          ...r,
                          [name]: name === "service" ? value : Number(value),
                        }
                      : r,
                  ),
                )
              }
            />
            <Button
              type="button"
              variant="ghost"
              disabled={rates.length === 1}
              onClick={() =>
                setRates((items) => items.filter((_, i) => i !== index))
              }
            >
              Remove service
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          disabled={rates.length >= 20}
          onClick={() =>
            setRates((items) => [
              ...items,
              { service: "", price: 0, duration: 60 },
            ])
          }
        >
          Add service
        </Button>
        {error && <p role="alert">{error}</p>}
        <Button disabled={busy}>Save pricing</Button>
      </form>
    </Modal>
  );
}
