"use client";
import { useCallback, useEffect, useState } from "react";
import { useOffice } from "./context";
import { Button, FormDialog, Confirm } from "./shared";
import { Input } from "@/components/ui/input";
import { Feedback } from "@/components/foundation/feedback";
import { fieldApi } from "./field-api";
type Invitation = {
  id: string;
  employeeId: string;
  email: string;
  expiresAt: number;
  revokedAt: number | null;
  acceptedAt: number | null;
};
export default function TeamAccess() {
  const { state, workspaceId, role, demo, now } = useOffice();
  const [invites, setInvites] = useState<Invitation[]>([]),
    [links, setLinks] = useState<
      { employeeId: string; userId: string | null }[]
    >([]),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [inviteId, setInviteId] = useState<string | null>(null),
    [remove, setRemove] = useState<string | null>(null),
    [url, setUrl] = useState(""),
    [notice, setNotice] = useState("");
  const manager = role === "owner" || role === "admin";
  const base = "/workspaces/" + encodeURIComponent(workspaceId || "");
  const refresh = useCallback(async () => {
    if (demo || !manager || !workspaceId) return;
    try {
      const [i, t] = await Promise.all([
        fieldApi<{ invitations: Invitation[] }>(base + "/invitations"),
        fieldApi<{ team: { employeeId: string; userId: string | null }[] }>(
          base + "/team",
        ),
      ]);
      setInvites(i.invitations);
      setLinks(t.team);
      setLoaded(true);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load team access.");
    }
  }, [base, demo, manager, workspaceId]);
  useEffect(() => {
    let active = true;
    if (!demo && manager && workspaceId)
      Promise.all([
        fieldApi<{ invitations: Invitation[] }>(base + "/invitations"),
        fieldApi<{ team: { employeeId: string; userId: string | null }[] }>(
          base + "/team",
        ),
      ])
        .then(([i, t]) => {
          if (active) {
            setInvites(i.invitations);
            setLinks(t.team);
            setLoaded(true);
            setError("");
          }
        })
        .catch((e) => {
          if (active)
            setError(
              e instanceof Error ? e.message : "Could not load team access.",
            );
        });
    return () => {
      active = false;
    };
  }, [base, demo, manager, workspaceId, state.employees]);
  if (demo || !manager) return null;
  const active = (state.employees || []).filter((e) => !e.archivedAt);
  return (
    <section className="yw-subsection" aria-labelledby="team-access-title">
      <h2 id="team-access-title">Invite your team</h2>
      <p>
        Give employees access to their assigned visits, instructions and
        checklists. Prices, invoices and office notes stay private.
      </p>
      {error && <Feedback>{error}</Feedback>}
      {notice && <p role="status">{notice}</p>}
      <Button variant="ghost" disabled={busy} onClick={() => void refresh()}>
        Refresh access
      </Button>
      {!active.length ? (
        <p>Add an employee above, then create their invitation here.</p>
      ) : (
        active.map((e) => {
          const link = links.find((l) => l.employeeId === e.id)?.userId;
          const invitation = invites.find((i) => i.employeeId === e.id);
          const pending =
            invitation &&
            !invitation.acceptedAt &&
            !invitation.revokedAt &&
            invitation.expiresAt > Date.parse(now);
          return (
            <div className="yw-row" key={e.id}>
              <div className="yw-row-main">
                <h3>{e.name}</h3>
                <p>
                  {!loaded
                    ? error
                      ? "Access could not be loaded"
                      : "Loading access…"
                    : link
                      ? "Connected · assigned work only"
                      : pending
                        ? `Awaiting acceptance · ${invitation.email}`
                        : invitation?.revokedAt
                          ? "Invitation cancelled"
                          : invitation &&
                              invitation.expiresAt <= Date.parse(now)
                            ? "Invitation expired"
                            : "No account access"}
                </p>
              </div>
              <div className="yw-actions">
                {link ? (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => setRemove(e.id)}
                  >
                    Remove access
                  </Button>
                ) : (
                  <Button
                    disabled={busy || !loaded}
                    onClick={() => {
                      setUrl("");
                      setNotice("");
                      setInviteId(e.id);
                    }}
                  >
                    {pending ? "Replace invite link" : "Create invite link"}
                  </Button>
                )}
                {pending && !link && (
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await fieldApi(
                          base +
                            "/invitations/" +
                            encodeURIComponent(invitation.id),
                          "DELETE",
                        );
                        setUrl("");
                        await refresh();
                      } catch (e) {
                        setError(
                          e instanceof Error ? e.message : "Could not cancel.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Cancel invite
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}
      {url && (
        <div className="stack">
          <label htmlFor="team-invite-link">Invitation link</label>
          <Input
            id="team-invite-link"
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
          />
          <p>
            This link lasts seven days and only works for the invited email.
            Share it yourself; no invitation email has been sent.
          </p>
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setNotice("Invitation link copied.");
              } catch {
                setNotice("Select and copy the link above.");
              }
            }}
          >
            Copy invitation
          </Button>
        </div>
      )}
      {inviteId && (
        <FormDialog
          title="Invite to assigned work"
          description="The employee will verify this email before joining. Replacing a link cancels the previous one."
          fields={[{ name: "email", label: "Employee email", type: "email" }]}
          initial={{
            email: active.find((e) => e.id === inviteId)?.email || "",
          }}
          onSave={async (v) => {
            const result = await fieldApi<{ url: string }>(
              base + "/invitations",
              "POST",
              { employeeId: inviteId, email: v.email },
            );
            setUrl(result.url);
            await refresh();
          }}
          onClose={() => setInviteId(null)}
        />
      )}
      {remove && (
        <Confirm
          title="Remove team access?"
          description="New requests will be blocked immediately. Previously downloaded work may remain visible while their phone is offline. Their employee profile and job history remain."
          onConfirm={async () => {
            await fieldApi(
              base + "/team/" + encodeURIComponent(remove),
              "DELETE",
            );
            await refresh();
          }}
          onClose={() => setRemove(null)}
        />
      )}
    </section>
  );
}
