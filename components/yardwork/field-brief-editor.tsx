"use client";
import { useEffect, useState } from "react";
import { useOffice } from "./context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Feedback } from "@/components/foundation/feedback";
import type { JobDetail } from "@/packages/mobile-client/src/contracts";
import { fieldApi } from "./field-api";
export default function FieldBriefEditor({ jobId }: { jobId: string }) {
  const { workspaceId, role, demo, refresh, busy: officeBusy } = useOffice();
  const [detail, setDetail] = useState<JobDetail | null>(null),
    [instructions, setInstructions] = useState(""),
    [lines, setLines] = useState(""),
    [editing, setEditing] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const base =
    "/workspaces/" +
    encodeURIComponent(workspaceId || "") +
    "/jobs/" +
    encodeURIComponent(jobId);
  const manager = role === "owner" || role === "admin";
  useEffect(() => {
    let active = true;
    if (!demo && manager)
      fieldApi<JobDetail>(base)
        .then((r) => {
          if (active) setDetail(r);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [base, demo, manager]);
  if (demo || !manager) return null;
  async function edit() {
    setBusy(true);
    try {
      const d = await fieldApi<JobDetail>(base);
      setDetail(d);
      setInstructions(d.job.brief.instructions);
      setLines(d.job.brief.checklist.map((t) => t.label).join("\n"));
      setEditing(true);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load instructions.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="yw-record-section">
      <h2>Field instructions</h2>
      <p>
        Only these instructions and checklist items are shared with your
        assigned team. Office visit notes stay private.
      </p>
      {error && <Feedback>{error}</Feedback>}
      {editing ? (
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || !detail) return;
            setBusy(true);
            setError("");
            try {
              const labels = lines
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              await fieldApi(base + "/brief", "PUT", {
                revision: detail.job.brief.revision,
                instructions,
                checklist: labels.map((label, index) => ({
                  id:
                    detail.job.brief.checklist[index]?.id ||
                    crypto.randomUUID(),
                  label,
                  required: true,
                })),
              });
              setDetail(await fieldApi<JobDetail>(base));
              setEditing(false);
              await refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not save.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Instructions
            <Textarea
              value={instructions}
              maxLength={4000}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            Required tasks · one per line
            <Textarea
              value={lines}
              onChange={(e) => setLines(e.target.value)}
              disabled={busy}
            />
          </label>
          <div className="yw-actions">
            <Button disabled={busy || officeBusy} type="submit">
              Save field instructions
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
          <p>
            After a conflict, your draft stays here. Copy it before cancelling
            and reopening the editor to load the latest revision.
          </p>
        </form>
      ) : (
        <>
          <p>
            {detail?.job.brief.instructions || "No field instructions added."}
          </p>
          <ul>
            {detail?.job.brief.checklist.map((t) => (
              <li key={t.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!t.completedAt}
                    disabled={
                      busy || officeBusy || detail?.job.status === "complete"
                    }
                    onChange={async (e) => {
                      if (!detail) return;
                      const completed = e.target.checked;
                      setBusy(true);
                      setError("");
                      try {
                        await fieldApi(base + "/actions", "POST", {
                          mutationId: crypto.randomUUID(),
                          revision: detail.revision,
                          briefRevision: detail.job.brief.revision,
                          command: {
                            type: "check-task",
                            taskId: t.id,
                            completed,
                          },
                        });
                        setDetail(await fieldApi<JobDetail>(base));
                        await refresh();
                      } catch (e) {
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Could not update checklist. Reopen instructions to refresh.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                  {t.label}
                </label>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            disabled={busy || officeBusy || detail?.job.status === "complete"}
            onClick={() => void edit()}
          >
            Edit field instructions
          </Button>
        </>
      )}
    </section>
  );
}
