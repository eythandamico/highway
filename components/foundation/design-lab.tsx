"use client";
import { useState } from "react";
import { ThemeScope } from "@/components/ui/theme-scope";
import { appearanceStyle, DEFAULT_ACCENT } from "@/lib/design/appearance-style";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Fields, FormDialog } from "./patterns";
import { Status } from "./status";
import { Feedback, LoadingState } from "./feedback";
import "./design-lab.css";

/** Synthetic fixtures only. The same controls and compositions used in the product. */
export function DesignLab() {
  const { setTheme } = useTheme();
  const [values, setValues] = useState<Record<string, unknown>>({
    name: "",
    notes: "",
    service: "maintenance",
  });
  const [dialog, setDialog] = useState(false),
    [fail, setFail] = useState(true),
    [saved, setSaved] = useState(false);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const tokens = appearanceStyle(accent);
  return (
    <ThemeScope tokens={tokens}>
    <div className="page design-lab" style={tokens}>
      <header className="stack">
        <h1>Design foundation</h1>
        <p className="muted">
          A live reference for the starter’s shared components. All content here is
          synthetic and no messages or records are created.
        </p>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => setTheme("light")}>
            Light theme
          </Button>
          <Button variant="secondary" onClick={() => setTheme("dark")}>
            Dark theme
          </Button>
          <Button variant="ghost" onClick={() => setTheme("system")}>
            Use system theme
          </Button>
        </div>
      </header>
      <section className="settings-section stack">
        <h2>Theme and date controls</h2>
        <label className="stack">Accent color (six-digit hex)<Input value={accent} onChange={e => setAccent(e.target.value)} maxLength={7}/></label>
        <label className="stack">Review date<Input type="date" defaultValue="2026-10-19" min="2026-01-01" max="2027-12-31"/></label>
        <p className="muted">Open the form below to see the accent follow it through its portal. Status colors keep their meaning.</p>
      </section>
      <section className="settings-section stack">
        <h2>Actions</h2>
        <p>
          One primary action per task. Labels describe the result. Busy actions
          keep their label and cannot be submitted again.
        </p>
        <div className="header-actions">
          <Button>Save changes</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">View details</Button>
          <Button variant="destructive">Delete draft</Button>
          <Button disabled>Unavailable</Button>
          <Button loading>Saving changes…</Button>
        </div>
        <Button variant="secondary">
          Review the installation and maintenance appointment for the customer’s
          exceptionally long business name
        </Button>
      </section>
      <section className="settings-section stack">
        <h2>Forms and recovery</h2>
        <p>
          Visible labels, optional markers, described hints, bounded inputs and
          errors that preserve the draft.
        </p>
        <Fields
          fields={[
            {
              name: "name",
              label: "Record name",
              hint: "Use the name shown on saved records.",
              max: 120,
            },
            {
              name: "service",
              label: "Service",
              options: [
                { value: "maintenance", label: "Maintenance visit" },
                {
                  value: "installation",
                  label: "Installation and specialist equipment setup",
                },
              ],
            },
            {
              name: "notes",
              label: "Notes",
              type: "textarea",
              required: false,
              max: 4000,
            },
          ]}
          values={values}
          set={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
          errors={{ name: "Enter a record name before saving." }}
        />
        <label className="stack">
          Unavailable service list
          <NativeSelect disabled defaultValue="none">
            <option value="none">No services available</option>
          </NativeSelect>
        </label>
        <label className="lab-check">
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => setFail(e.target.checked)}
          />
          Simulate a save failure
        </label>
        <Button
          onClick={() => {
            setSaved(false);
            setDialog(true);
          }}
        >
          Test form dialog
        </Button>
        {saved && (
          <Feedback tone="info">
            Example saved. No real data was written.
          </Feedback>
        )}
      </section>
      <section className="settings-section stack">
        <h2>States have names</h2>
        <div className="header-actions">
          <Status>Draft</Status>
          <Status tone="good">Completed</Status>
          <Status tone="warning">Awaiting approval</Status>
          <Status tone="bad">Delivery failed</Status>
          <Status tone="info">In progress</Status>
        </div>
        <Feedback action={<Button variant="secondary">Retry</Button>}>
          Couldn’t refresh. Your current information is still visible.
        </Feedback>
        <Feedback tone="info">
          Read-only access. Ask an owner to update this record.
        </Feedback>
        <LoadingState>Opening record history…</LoadingState>
      </section>
      <section className="settings-section stack">
        <h2>Content resilience</h2>
        <div className="lab-stress">
          <h3>
            NorthshoreSpecialistInstallationMaintenanceAndRepairServicesWithoutAnySpaces
          </h3>
          <p>Équipe Montréal · 東京サービス · 👩🏽‍🔧</p>
          <p dir="rtl" lang="ar">
            خدمات الصيانة والتركيب للعملاء
          </p>
          <strong>$9,999,999.99 CAD</strong>
          <p>
            Long details wrap instead of disappearing. Monetary values,
            decisions and errors must remain readable.
          </p>
        </div>
      </section>
      <section className="settings-section stack">
        <h2>Review checklist</h2>
        <p>
          Check narrow and wide viewports, 200% text zoom, light and dark
          themes, Tab / Shift+Tab, Escape, pending-save dismissal, error
          recovery and reduced motion. The automated checks complement this
          review.
        </p>
      </section>
      {dialog && (
        <FormDialog
          title="Example record form"
          description="Try a long name, a failed save, or close with Escape. While saving, closing is disabled."
          fields={[
            {
              name: "name",
              label: "Record name",
              max: 120,
              hint: "This example is never stored.",
            },
            {
              name: "notes",
              label: "Notes",
              type: "textarea",
              required: false,
            },
          ]}
          initial={{ name: "Example record", notes: "" }}
          onClose={() => setDialog(false)}
          onSave={async () => {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            if (fail) throw new Error("The example connection is unavailable.");
            setSaved(true);
          }}
        />
      )}
    </div>
    </ThemeScope>
  );
}
