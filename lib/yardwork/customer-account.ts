import type { Workspace } from './yardwork';

/** One relationship view derived from the authorized workspace, never copied balances. */
export function customerAccount(state: Workspace, customerId: string) {
  if (!state.customers.some(c => c.id === customerId)) return null;
  const jobs = state.jobs.filter(j => j.customerId === customerId).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  const invoices = state.invoices.filter(i => i.customerId === customerId);
  const total = (status: 'paid' | 'unpaid') => invoices.filter(i => i.status === status)
    .reduce((cents, i) => cents + Math.round(i.amount * 100) + Math.round(i.tax * 100), 0) / 100;
  return { jobs, invoices, quotes: state.quotes.filter(q => q.customerId === customerId),
    requests: state.leads.filter(l => l.customerId === customerId), outstanding: total('unpaid'), collected: total('paid') };
}

export type RecordKind = 'customer' | 'job' | 'quote' | 'invoice' | 'lead';
export function recordQuery(kind: RecordKind, id: string) {
  const view = { customer: 'customers', job: 'schedule', quote: 'money', invoice: 'money', lead: 'inbox' }[kind];
  return new URLSearchParams({ view, attention: kind, record: id });
}

/** Preserve joins while excluding addresses, contact information, notes and messages. */
export function assistantContext(state: Workspace) {
  const customers = state.customers.slice(0, 100);
  const ids = new Set(customers.map(c => c.id));
  const jobs = state.jobs.filter(j => ids.has(j.customerId)).slice(-100);
  const invoices = state.invoices.filter(i => ids.has(i.customerId)).slice(-100);
  const quotes = state.quotes.filter(q => ids.has(q.customerId)).slice(-100);
  return {
    business: state.business.name,
    customers: customers.map(c => ({ id: c.id, name: c.name })),
    rates: state.rates.slice(0, 40),
    jobs: jobs.map(j => ({ id: j.id, customerId: j.customerId, sourceQuoteId: j.sourceQuoteId, service: j.service, date: j.date, time: j.time, crew: j.crew, status: j.status })),
    invoices: invoices.map(i => ({ id: i.id, customerId: i.customerId, jobId: i.jobId, sourceQuoteId: i.sourceQuoteId, service: i.service, amount: i.amount, tax: i.tax, due: i.due, status: i.status })),
    quotes: quotes.map(q => ({ id: q.id, customerId: q.customerId, leadId: q.leadId, service: q.service, status: q.status })),
    truncated: customers.length < state.customers.length || jobs.length < state.jobs.length || invoices.length < state.invoices.length || quotes.length < state.quotes.length,
  };
}
