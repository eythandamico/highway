/** Describe confirmed record changes without implying delivery or payment processing. */
const messages: Record<string, string> = {
  customer: "Customer saved", request: "Request recorded", quote: "Quote saved",
  book: "Visit booked", job: "Visit saved", start: "Visit started", complete: "Visit completed",
  paid: "Invoice marked paid", reschedule: "Day rescheduled", settings: "Business settings saved",
  rates: "Service rates saved", appearance: "Appearance updated",
  "notification-preferences": "Notification preferences saved",
  "outreach-permission": "Contact permission updated",
  "save-prospect": "Business added to shortlist", "remove-prospect": "Business removed from shortlist",
  "prepare-request-quotes": "Quote drafts prepared", "approve-request-quote": "Quote approved",
};
export function actionFeedback(action: string, demo: boolean): string | null {
  if (["ask", "chat", "automation-run", "booking-read"].includes(action)) return null;
  const message = messages[action] ?? "Changes saved";
  return demo ? `${message} · Demo` : message;
}
