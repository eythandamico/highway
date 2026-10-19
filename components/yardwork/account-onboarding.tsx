"use client";
import Link from "next/link";
import { useState } from "react";
import { useOffice } from "./context";
import { Button } from "./shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Feedback } from "@/components/foundation/feedback";
export default function AccountOnboarding() {
  const { state, mutate, busy } = useOffice();
  const [editing, setEditing] = useState(false),
    [error, setError] = useState("");
  const [name, setName] = useState(
      state.onboarding?.completed ? state.business.name : "",
    ),
    [owner, setOwner] = useState(state.business.owner),
    [city, setCity] = useState(state.business.city),
    [tax, setTax] = useState(String(state.business.tax));
  if (state.onboarding?.dismissed) return null;
  async function dismiss() {
    try {
      await mutate("onboarding", { dismissed: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not hide setup.");
    }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    try {
      await mutate("settings", {
        ...state.business,
        name: name.trim(),
        owner: owner.trim(),
        city: city.trim(),
        tax: Number(tax),
      });
      setEditing(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your details could not be saved. Please try again.",
      );
    }
  }
  return (
    <section className="yw-subsection" aria-labelledby="account-welcome">
      <h2 id="account-welcome">Let’s get your business ready.</h2>
      <p>
        Start with your business details and first customer. Add a team when you
        need one; you can also work solo.
      </p>
      <ol>
        <li>
          {state.onboarding?.completed
            ? "✓ Business details saved"
            : "Name your business and service area"}
        </li>
        <li>
          {state.rates.length ? (
            "✓ Services and prices added"
          ) : (
            <Link href="/workspace?view=settings">
              Add your services and prices
            </Link>
          )}
        </li>
        <li>
          {state.customers.length ? (
            "✓ First customer added"
          ) : (
            <Link href="/workspace?view=customers">
              Add your first customer
            </Link>
          )}
        </li>
        <li>
          <Link href="/workspace?view=team">Invite your team</Link> · optional
          if you work solo
        </li>
        <li>
          {state.jobs.length ? (
            "✓ First visit scheduled"
          ) : (
            <Link href="/workspace?view=customers">
              Create a request and review a quote for your first visit
            </Link>
          )}
        </li>
      </ol>
      <p className="muted">
        A customer-approved quote creates the visit. Completing it creates an
        unpaid invoice; sending messages and collecting payments require
        connected services.
      </p>
      {error && !editing && <Feedback>{error}</Feedback>}
      {editing ? (
        <form onSubmit={save} className="stack" aria-busy={busy}>
          <div className="yw-form-grid">
            <div>
              <Label htmlFor="onboard-business">Business name</Label>
              <Input
                id="onboard-business"
                autoComplete="organization"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
                disabled={busy}
              />
            </div>
            <div>
              <Label htmlFor="onboard-owner">Your name</Label>
              <Input
                id="onboard-owner"
                autoComplete="name"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                maxLength={120}
                required
                disabled={busy}
              />
            </div>
            <div>
              <Label htmlFor="onboard-city">City or service area</Label>
              <Input
                id="onboard-city"
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={120}
                required
                disabled={busy}
              />
            </div>
            <div>
              <Label htmlFor="onboard-tax">Default tax rate (%)</Label>
              <Input
                id="onboard-tax"
                type="number"
                min="0"
                max="30"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                required
                disabled={busy}
              />
            </div>
          </div>
          <p className="muted">
            You can change these in Settings. Add your own services and prices
            when you’re ready.
          </p>
          {error && <Feedback>{error}</Feedback>}
          <div className="yw-actions">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save business details"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => setEditing(false)}
            >
              Not now
            </Button>
          </div>
        </form>
      ) : (
        <div className="yw-actions">
          <Button onClick={() => setEditing(true)}>
            {state.onboarding?.completed
              ? "Edit business details"
              : "Set up my business"}
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => void dismiss()}
          >
            Hide checklist for now
          </Button>
        </div>
      )}
    </section>
  );
}
