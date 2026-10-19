export function requestReview(category: string, confidence: number) {
  if (confidence < 0.8 || category === 'other') return { label: 'Needs a closer look', next: 'Read the customer’s request and confirm what they need before taking action.' };
  const guidance: Record<string, { label: string; next: string }> = {
    new_request: { label: 'New work', next: 'Review the prepared quote and confirm the scope and price with the customer.' },
    reschedule: { label: 'Schedule change', next: 'Review this customer’s visits and agree on a new time before moving work.' },
    cancellation: { label: 'Cancellation request', next: 'Confirm which visit the customer means and review any cancellation terms.' },
    billing: { label: 'Invoice question', next: 'Check this customer’s invoices and recorded payments before replying.' },
    complaint: { label: 'Service concern', next: 'Review the visit details and prepare a personal response.' },
  };
  return guidance[category] || { label: 'Needs a closer look', next: 'Review the request before taking action.' };
}
