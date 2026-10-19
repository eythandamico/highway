/** Public, platform-independent contract. Never import server/domain state here. */
export type MobileRole = "owner" | "admin" | "member";
export type MobileWorkspace = {
  id: string;
  name: string;
  role: MobileRole;
  employeeId: string | null;
};
export type MobileSession = {
  token: string;
  expiresAt: number;
  user: { id: string; name: string; email: string };
};
export type ChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  completedAt: string | null;
  completedBy: string | null;
};
export type JobBrief = {
  instructions: string;
  checklist: ChecklistItem[];
  revision: number;
};
export type MobileJob = {
  id: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: "scheduled" | "in-progress" | "complete";
  crew: string;
  customer: { name: string; address: string; phone: string };
  crewMembers: { id: string; name: string }[];
  brief: JobBrief;
  arrival: string | null;
  /** Owner/admin only. Omitted entirely for field accounts. */
  amount?: number;
};
export type JobList = {
  jobs: MobileJob[];
  revision: number;
  serverTime: string;
  hasMore: boolean;
};
export type JobDetail = { job: MobileJob; revision: number };
export type OwnerSummary = {
  scheduled: number;
  inProgress: number;
  complete: number;
  newInquiries: number;
  draftQuotes: number;
  unpaidInvoices: number;
  unpaidAmount: number;
  openIssues: number;
};
export type JobCommand =
  | { type: "start" }
  | { type: "complete" }
  | { type: "check-in" }
  | { type: "check-task"; taskId: string; completed: boolean }
  | {
      type: "report-issue";
      category: "Equipment" | "Materials" | "Access" | "Travel" | "Other";
      description: string;
      priority: "normal" | "urgent";
    };
export type MutationInput = {
  mutationId: string;
  revision: number;
  briefRevision: number;
  command: JobCommand;
};
export type MutationReceipt = {
  mutationId: string;
  revision: number;
  briefRevision: number;
  acceptedAt: string;
};
export type BriefInput = {
  revision: number;
  instructions: string;
  checklist: { id: string; label: string; required: boolean }[];
};
export type ApiProblem = { error: { code: string; message: string } };
export type TeamAccess = {
  employeeId: string;
  name: string;
  email: string;
  userId: string | null;
};
