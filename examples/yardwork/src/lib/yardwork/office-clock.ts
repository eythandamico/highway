/** A serialized timestamp and explicit business timezone keep SSR and hydration identical. */
export function officeClock(timestamp: string) {
  const now = new Date(timestamp);
  const timeZone = "America/Toronto";
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-CA", {
    timeZone, hour: "numeric", hourCycle: "h23",
  }).format(now));
  return { day, greeting: hour < 12 ? "morning" : "afternoon" };
}
