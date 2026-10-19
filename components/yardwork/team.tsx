"use client";
import { useRememberedState } from "./page-memory";
import { AccountAvatar } from "./account-avatar";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import TeamAccess from "./team-access";
import { Plus } from "lucide-react";
import { useOffice } from "./context";
import {
  Heading,
  Button,
  Status,
  Tabs,
  Empty,
  FormDialog,
  Confirm,
  type FieldSpec,
} from "./shared";
import type { Employee } from "@/lib/yardwork/team";
const employeeFields: FieldSpec[] = [
  { name: "name", label: "Full name" },
  { name: "role", label: "Job role" },
  { name: "phone", label: "Phone", type: "tel", required: false },
  { name: "email", label: "Email", type: "email", required: false },
  { name: "defaultCrew", label: "Default crew", options: [] },
  {
    name: "availability",
    label: "Availability",
    options: [
      { value: "available", label: "Available" },
      { value: "away", label: "Away" },
    ],
  },
  { name: "skills", label: "Skills", required: false },
  { name: "notes", label: "Notes", type: "textarea", required: false },
];
export default function Team() {
  const params = useSearchParams();
  const { state, mutate } = useOffice(),
    [tab, setTab] = useRememberedState("team.tab", "active", params.get("attention") === "issue" ? "issues" : undefined),
    [edit, setEdit] = useState<Employee | "new" | null>(null),
    [archive, setArchive] = useState<Employee | null>(null),
    [issue, setIssue] = useState(false),
    [resolve, setResolve] = useState<string | null>(null);
  const employees = (state.employees || []).filter((e) =>
    tab === "archived" ? !!e.archivedAt : !e.archivedAt,
  );
  return (
    <>
      <Heading title="Team" description="The people behind the work.">
        <Button onClick={() => setEdit("new")}>
          <Plus size={17} />
          Add employee
        </Button>
      </Heading>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "active", label: "Active team" },
          { value: "issues", label: "Issues" },
          { value: "archived", label: "Archived" },
        ]}
      />
      {tab === "issues" ? (
        <>
          <div className="yw-section-title">
            <h2>Reported issues</h2>
            <Button
              disabled={!state.employees?.some((e) => !e.archivedAt)}
              variant="secondary"
              onClick={() => setIssue(true)}
            >
              Report an issue
            </Button>
          </div>
          {state.teamIssues?.length ? (
            [...state.teamIssues].sort((a,b) => Number(b.id === params.get("record")) - Number(a.id === params.get("record"))).map((i) => (
              <div className="yw-row" key={i.id}>
                <div className="yw-row-main">
                  <h3>
                    {i.category} ·{" "}
                    {state.employees?.find((e) => e.id === i.employeeId)?.name}
                  </h3>
                  <p>{i.description}</p>
                  {i.resolution && <p>Resolution: {i.resolution}</p>}
                </div>
                <div className="yw-actions">
                  <Status
                    tone={
                      i.status === "resolved"
                        ? "good"
                        : i.priority === "urgent"
                          ? "bad"
                          : "warning"
                    }
                  >
                    {i.status === "resolved" ? "Resolved" : i.priority}
                  </Status>
                  {i.status === "open" && (
                    <Button
                      variant="secondary"
                      onClick={() => setResolve(i.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <Empty title="No issues reported.">
              Equipment, access, materials and travel problems can be tracked
              here.
            </Empty>
          )}
        </>
      ) : employees.length ? (
        employees.map((e) => (
          <div className="yw-row" key={e.id}>
            <AccountAvatar identity={`yardwork:employee:${e.id}`} />
            <div className="yw-row-main">
              <h3>{e.name}</h3>
              <p>
                {e.role} ·{" "}
                {e.defaultCrew === "none"
                  ? "No default crew"
                  : state.business[e.defaultCrew]}
              </p>
              <small>{e.skills}</small>
            </div>
            <div className="yw-actions">
              <Status
                tone={e.availability === "available" ? "good" : "neutral"}
              >
                {e.availability}
              </Status>
              {!e.archivedAt && (
                <Button variant="secondary" aria-label={`Edit ${e.name}`} onClick={() => setEdit(e)}>
                  Edit
                </Button>
              )}
              <Button variant="ghost" aria-label={`${e.archivedAt ? "Restore" : "Archive"} ${e.name}`} onClick={() => setArchive(e)}>
                {e.archivedAt ? "Restore" : "Archive"}
              </Button>
            </div>
          </div>
        ))
      ) : (
        <Empty
          title={
            tab === "archived" ? "No archived employees." : "Build your crew."
          }
        >
          Employee profiles keep assignments, availability and recorded arrivals
          together. These profiles do not grant account access.
        </Empty>
      )}
      {tab === "active" && <TeamAccess/>}
      {edit && (
        <FormDialog
          title={edit === "new" ? "Add an employee" : "Edit employee"}
          description="Employee profiles track field work. Account permissions are managed separately."
          fields={employeeFields.map((f) =>
            f.name === "defaultCrew"
              ? {
                  ...f,
                  options: [
                    { value: "crew1", label: state.business.crew1 },
                    { value: "crew2", label: state.business.crew2 },
                    { value: "none", label: "No default crew" },
                  ],
                }
              : f,
          )}
          initial={
            edit === "new"
              ? {
                  name: "",
                  role: "Service technician",
                  phone: "",
                  email: "",
                  defaultCrew: "crew1",
                  availability: "available",
                  skills: "",
                  notes: "",
                }
              : { ...edit, archivedAt: undefined }
          }
          onSave={(values) => {
            const payload = { ...values };
            delete payload.archivedAt;
            return mutate("employee", payload);
          }}
          onClose={() => setEdit(null)}
        />
      )}
      {archive && (
        <Confirm
          title={`${archive.archivedAt ? "Restore" : "Archive"} ${archive.name}?`}
          description={
            archive.archivedAt
              ? "Return this person to the active team."
              : "Their job and arrival history will remain. Reassign unfinished jobs before archiving."
          }
          onConfirm={() =>
            mutate("archive-employee", {
              id: archive.id,
              archive: !archive.archivedAt,
            })
          }
          onClose={() => setArchive(null)}
        />
      )}
      {issue && (
        <FormDialog
          title="Report a team issue"
          fields={[
            {
              name: "employeeId",
              label: "Employee",
              options: (state.employees || [])
                .filter((e) => !e.archivedAt)
                .map((e) => ({ value: e.id, label: e.name })),
            },
            {
              name: "jobId",
              label: "Related visit",
              required: false,
              options: [
                { value: "", label: "No specific visit" },
                ...state.jobs
                  .filter((j) => j.status !== "complete")
                  .map((j) => ({
                    value: j.id,
                    label: `${j.date} · ${j.service}`,
                  })),
              ],
            },
            {
              name: "category",
              label: "Category",
              options: [
                "Equipment",
                "Materials",
                "Access",
                "Travel",
                "Other",
              ].map((c) => ({ value: c, label: c })),
            },
            {
              name: "priority",
              label: "Priority",
              options: [
                { value: "normal", label: "Normal" },
                { value: "urgent", label: "Urgent" },
              ],
            },
            { name: "description", label: "What happened?", type: "textarea" },
          ]}
          initial={{
            employeeId: state.employees?.find((e) => !e.archivedAt)?.id,
            jobId: "",
            category: "Equipment",
            priority: "normal",
            description: "",
          }}
          onSave={(v) => mutate("team-issue", v)}
          onClose={() => setIssue(false)}
        />
      )}
      {resolve && (
        <FormDialog
          title="Resolve issue"
          fields={[
            {
              name: "resolution",
              label: "How was this resolved?",
              type: "textarea",
            },
          ]}
          initial={{ resolution: "" }}
          onSave={(v) => mutate("resolve-team-issue", { id: resolve, ...v })}
          onClose={() => setResolve(null)}
        />
      )}
    </>
  );
}
