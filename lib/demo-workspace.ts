import type { api } from "./client";
import type { RecordItem } from "./records";

const examples = [
  ["Plan the next release", "Gather feedback, choose the next improvements, and write a short release note."],
  ["Review the welcome page", "Check the first impression on a phone and a desktop."],
  ["Collect useful references", "Keep notes and examples together for the next project."],
  ["Prepare the weekly update", "Summarize progress and list the decisions that still need a conversation."],
  ["Organize project files", "Try the Files tab to explore example attachments."],
];
type DemoFile = { id: string; name: string; bytes: number; href: string };

/** Each mounted demo owns its data. This adapter never calls a server. */
export function createDemoWorkspace() {
  let records: RecordItem[] = examples.map(([title, body], index) => ({
    id: `example-${index}`, title, body, status: "active", revision: 1,
    created_at: 1792400400000 - index, updated_at: 1792400400000 - index,
  }));
  records.push({ ...records[0], id: "example-archived", title: "Finish the first draft", body: "An archived example. Restore it to bring it back to your active list.", status: "archived" });
  const sampleText = "Foundation demo — project notes\n\nThis is a sample attachment. Demo changes stay in your browser and reset when you reload the page.\n";
  let files: DemoFile[] = [{ id: "example-file", name: "project-notes.txt", bytes: new TextEncoder().encode(sampleText).length, href: `data:text/plain;charset=utf-8,${encodeURIComponent(sampleText)}` }];
  const objectUrls = new Set<string>();
  const list = (query = "", status = "active", page = 1) => {
    const matching = records.filter(r => r.status === status && r.title.toLowerCase().includes(query.toLowerCase()));
    return { records: matching.slice((page - 1) * 20, page * 20).map(r => ({ ...r })), total: matching.length, page };
  };
  const initial = list();
  const request: typeof api = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    if (options.signal?.aborted) throw new Error("Request cancelled.");
    const url = new URL(path, "https://demo.invalid/");
    const method = options.method || "GET";
    let result: unknown;
    if (url.pathname === "/records") {
      if (method === "GET") result = list(url.searchParams.get("q") || "", url.searchParams.get("status") || "active", Number(url.searchParams.get("page") || 1));
      else {
        const data = JSON.parse(String(options.body));
        if (method === "POST") {
          const title = String(data.title || "").trim(), body = String(data.body || "").trim();
          if (!title || title.length > 160 || body.length > 4000) throw new Error("Check the text fields and try again.");
          const id = crypto.randomUUID();
          records.unshift({ id, title, body, status: "active", revision: 1, created_at: Date.now(), updated_at: Date.now() });
          result = { id };
        } else if (method === "PATCH") {
          const record = records.find(r => r.id === data.id);
          if (!record || record.revision !== data.revision) throw new Error("This record changed. Refresh before trying again.");
          if (data.status !== "active" && data.status !== "archived") throw new Error("Invalid status.");
          record.status = data.status; record.revision++; record.updated_at = Date.now();
          records = records.sort((a, b) => b.updated_at - a.updated_at);
          result = { ok: true };
        } else throw new Error("This action is unavailable in the demo.");
      }
    } else if (url.pathname === "/files" && method === "GET") result = { files: files.map(({ id, name, bytes }) => ({ id, name, bytes })) };
    else if (url.pathname === "/files" && method === "POST") {
      const file = options.body;
      if (!(file instanceof Blob) || !file.size || file.size > 5 * 1024 * 1024) throw new Error("Choose a non-empty file under 5 MB.");
      const id = crypto.randomUUID(), href = URL.createObjectURL(file);
      objectUrls.add(href);
      files.unshift({ id, href, name: url.searchParams.get("name") || "attachment", bytes: file.size });
      result = { id };
    } else if (url.pathname.startsWith("/files/") && method === "DELETE") {
      const id = url.pathname.slice("/files/".length), file = files.find(f => f.id === id);
      if (file && objectUrls.delete(file.href)) URL.revokeObjectURL(file.href);
      files = files.filter(f => f.id !== id); result = { ok: true };
    } else throw new Error("This action is unavailable in the demo.");
    return result as T;
  };
  return { initial, request, fileHref: (id: string) => files.find(f => f.id === id)?.href || "#", dispose: () => { for (const href of objectUrls) URL.revokeObjectURL(href); objectUrls.clear(); } };
}
