import { z } from "zod/v3";
export const socialInput = z
  .object({
    area: z.string().trim().min(2).max(250),
    service: z.string().trim().min(2).max(120),
  })
  .strict();
export type SocialMatch = {
  title: string;
  url: string;
  snippet: string;
  pageDate: string | null;
};
export type SocialResult = {
  status: "ok" | "empty" | "not_configured" | "unavailable" | "rate_limited";
  message: string;
  matches: SocialMatch[];
};
const plain = (s: unknown, max: number) =>
  typeof s === "string"
    ? s
        .replace(/<[^>]*>/g, "")
        .replace(/[\u0000-\u001f]/g, " ")
        .slice(0, max)
    : "";
export async function findSocialLeads(
  input: z.infer<typeof socialInput>,
  key: string | undefined,
  fetcher = fetch,
): Promise<SocialResult> {
  if (!key)
    return {
      status: "not_configured",
      message:
        "Connect public web search to scan local social posts. You can still open a local search below.",
      matches: [],
    };
  const quoted = (value: string) =>
    '"' + value.replace(/["\\()]/g, " ").replace(/\s+/g, " ") + '"';
  const q = `${quoted(input.area)} ${quoted(input.service)} (site:reddit.com OR site:facebook.com OR site:nextdoor.com)`;
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.search = new URLSearchParams({
    q,
    freshness: "pm",
    count: "10",
    result_filter: "web",
    country: "CA",
    search_lang: "en",
    spellcheck: "false",
    text_decorations: "false",
  }).toString();
  try {
    const response = await fetcher(url, {
      headers: { Accept: "application/json", "X-Subscription-Token": key },
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    });
    if (response.status === 429)
      return {
        status: "rate_limited",
        message: "Search is busy. Please try again later.",
        matches: [],
      };
    if (!response.ok) throw new Error();
    const data = (await response.json()) as {
      web?: {
        results?: {
          title?: string;
          url?: string;
          description?: string;
          page_age?: string;
        }[];
      };
    };
    const matches: SocialMatch[] = [];
    for (const item of (data.web?.results || []).slice(0, 20)) {
      try {
        const u = new URL(item.url || "");
        if (
          u.protocol !== "https:" ||
          u.username ||
          u.password ||
          !["reddit.com", "facebook.com", "nextdoor.com"].some(
            (host) => u.hostname === host || u.hostname.endsWith("." + host),
          )
        )
          continue;
        const title = plain(item.title, 200);
        if (!title || matches.some((m) => m.url === u.href)) continue;
        matches.push({
          title,
          url: u.href,
          snippet: plain(item.description, 500),
          pageDate: plain(item.page_age, 60) || null,
        });
      } catch {}
    }
    return {
      status: matches.length ? "ok" : "empty",
      message: matches.length
        ? "Public web matches from the last month. A page date may reflect an edit; these are not confirmed requests."
        : "No matching public pages found. Private groups and unindexed posts are not searched.",
      matches,
    };
  } catch {
    return {
      status: "unavailable",
      message:
        "Public web search is unavailable. Try again later or open a local search below.",
      matches: [],
    };
  }
}
