import type { Workspace } from './yardwork';

export type AttentionItem = {
  id: string; title: string; description: string; label: string;
  priority?: 'urgent' | 'today' | 'overdue' | 'normal';
  context?: string;
  view: 'money' | 'inbox' | 'team'; kind: 'quote' | 'invoice' | 'lead' | 'issue'; entityId: string;
};
const amount = (value: number) => Number.isFinite(value)
  ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value) : '';
const calendarLabel = (date: string, day: string) => date === day ? 'Today' : new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const timeLabel = (time: string) => { const [hours, minutes] = time.split(':'); const h = Number(hours); return `${h % 12 || 12}:${minutes} ${h < 12 ? 'am' : 'pm'}`; };

/** Derived from unresolved records; no inferred urgency or separate notification store. */
export function attentionQueue(s: Workspace, day: string): AttentionItem[] {
  const customer = (id: string) => s.customers.find(c => c.id === id)?.name || 'Customer';
  const issues: AttentionItem[] = (s.teamIssues || []).filter(i => i.status === 'open')
    .sort((a,b) => a.createdAt.localeCompare(b.createdAt))
    .map(i => {
      const job = s.jobs?.find(j => j.id === i.jobId);
      const reporter = s.employees?.find(e => e.id === i.employeeId)?.name;
      return { id: `issue:${i.id}`, entityId: i.id, kind: 'issue', view: 'team',
        priority: i.priority === 'urgent' ? 'urgent' : job?.date === day && job.status !== 'complete' ? 'today' : 'normal',
        label: `${i.category || 'Team'} issue`,
        title: i.description?.trim() || 'Review the reported team issue',
        description: reporter ? `Reported by ${reporter}` : 'Reported by your team',
        context: job ? `${customer(job.customerId)} · ${calendarLabel(job.date, day)} at ${timeLabel(job.time)}` : undefined };
    });
  const invoices: AttentionItem[] = s.invoices.filter(i => i.status === 'unpaid' && i.due < day).sort((a,b) => a.due.localeCompare(b.due))
    .map(i => {
      const days = Math.round((Date.parse(`${day}T12:00:00Z`) - Date.parse(`${i.due}T12:00:00Z`)) / 86400000);
      return { id: `invoice:${i.id}`, entityId: i.id, kind: 'invoice', view: 'money', priority: 'overdue',
        label: 'Payment follow-up', title: `Follow up with ${customer(i.customerId)}`,
        description: [amount(i.amount + i.tax), i.service].filter(Boolean).join(' · '),
        context: `${days} ${days === 1 ? 'day' : 'days'} overdue · Due ${calendarLabel(i.due, day)}` };
    });
  const quotes: AttentionItem[] = s.quotes.filter(q => q.status === 'draft' && q.ownerReview?.status === 'pending')
    .map(q => ({ id: `quote:${q.id}`, entityId: q.id, kind: 'quote', view: 'money', priority: 'normal',
      label: 'Quote approval', title: `Review ${customer(q.customerId)}’s quote`,
      description: q.service, context: 'Scope and pricing need your approval' }));
  const leads: AttentionItem[] = s.leads.filter(l => l.status === 'new' && !s.quotes.some(q => q.leadId === l.id))
    .map(l => ({ id: `lead:${l.id}`, entityId: l.id, kind: 'lead', view: 'inbox', priority: 'normal',
      label: 'Customer request', title: `Respond to ${customer(l.customerId)}`, description: l.message,
      context: l.service }));
  const rank = { urgent: 0, today: 1, overdue: 2, normal: 3 };
  return [...issues, ...invoices, ...quotes, ...leads].sort((a,b) => rank[a.priority || 'normal'] - rank[b.priority || 'normal']);
}
