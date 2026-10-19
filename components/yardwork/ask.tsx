"use client";
import { NativeSelect } from "@/components/ui/native-select";
import { useState, useEffect, useRef } from "react";
import { Paperclip, ArrowUp, X } from "lucide-react";
import { useOffice } from "./context";
import { Button, Textarea } from "./shared";
import type { ChatPhoto } from "@/lib/yardwork/chat-photos";
export default function Ask() {
  const { state, mutate, request, busy, demo, workspaceId } = useOffice(),
    [text, setText] = useState(""),
    [offerService, setOfferService] = useState(state.rates[0]?.service || ""),
    [photo, setPhoto] = useState<{
      image: ChatPhoto;
      blob: Blob;
      url: string;
    } | null>(null),
    [error, setError] = useState(""),
    [uploading, setUploading] = useState(false);
  const [aiReady, setAiReady] = useState(false), [aiMode, setAiMode] = useState(false), [aiReply, setAiReply] = useState("");
  useEffect(() => { let active=true; if(!demo) request<{services:{id:string;actionable:boolean}[]}>("/api/integrations").then(r=>{if(active)setAiReady(!!r.services.find(s=>s.id==='ai')?.actionable);}).catch(()=>{});return()=>{active=false;}; },[demo,request]);
  const composer=useRef<HTMLTextAreaElement>(null),stickToBottom=useRef(true),sending=useRef(false);
  const file = useRef<HTMLInputElement>(null),
    log = useRef<HTMLDivElement>(null),
    urls = useRef<string[]>([]),
    [demoPhotos, setDemoPhotos] = useState<Record<string, string>>({});
  useEffect(
    () => () => urls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  useEffect(() => {
    if(!stickToBottom.current)return;
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: "instant",
    });
  }, [state.chat.length, aiReply]);
  async function attach(f: File | undefined) {
    if (!f) return;
    setError("");
    setUploading(true);
    try {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
        f.size > 20 * 1024 * 1024
      )
        throw new Error("Choose a JPEG, PNG or WebP photo under 20 MB.");
      const bitmap = await createImageBitmap(f);
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height)),
        canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas
        .getContext("2d")!
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("Could not prepare image.")),
          "image/jpeg",
          0.86,
        ),
      );
      if (blob.size > 2 * 1024 * 1024)
        throw new Error(
          "The prepared photo is too large. Try a smaller image.",
        );
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      setPhoto({
        image: {
          id: crypto.randomUUID(),
          name: f.name.slice(0, 180),
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
        },
        blob,
        url,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not attach photo.");
    } finally {
      setUploading(false);
    }
  }
  async function send() {
    if (busy || uploading || sending.current || (!text.trim() && !photo)) return;
    sending.current=true;
    stickToBottom.current=true;
    setUploading(true);
    setError("");
    try {
      if (photo && !demo) {
        const response = await fetch(`/api/chat-photos/${photo.image.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "image/jpeg",
            "X-Workspace-ID": workspaceId || "",
          },
          body: photo.blob,
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok)
          throw new Error(result.error || "Could not upload photo.");
      }
      if(aiMode) {
        const result=await request<{text:string}>("/api/integrations/ai", {action:"draft",text:text.trim()||"Describe this photo and suggest questions for a service assessment.",...(photo?{image:photo.image}:{})});
        setAiReply(result.text);
      } else await mutate("ask", {
        id: crypto.randomUUID(),
        text,
        ...(photo ? { image: photo.image } : {}),
      });
      if (photo && demo)
        setDemoPhotos((all) => ({ ...all, [photo.image.id]: photo.url }));
      setText("");
      setPhoto(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send.");
    } finally {
      sending.current=false;
      setUploading(false);
      requestAnimationFrame(()=>composer.current?.focus());
    }
  }
  return (
    <section className="yw-agent-page" aria-label="Agent chat">
      <header className="yw-agent-header"><h1>Ask Yardwork</h1><span>{aiMode?'AI suggestions':'Workspace assistant'}</span></header>
      <div className="yw-chat-log" ref={log} role="log" aria-label="Conversation" aria-live="polite" onScroll={()=>{const el=log.current;if(el)stickToBottom.current=el.scrollHeight-el.scrollTop-el.clientHeight<80;}}>
       <div className="yw-agent-thread">
        {!state.chat.length && (
          <div className="yw-agent-empty"><h2>What can I help with?</h2><p>Make a plan, follow up, or find what needs your attention.</p></div>
        )}
        {state.chat.map((m) => (
          <div
            key={m.id}
            className={`yw-message ${m.role === "user" ? "yw-message-user" : ""}`}
          >
            <span className="sr-only">{m.role==='user'?'You':'Yardwork'}</span>
            {m.image && (demoPhotos[m.image.id] || !demo) && (
              // Private images and local blob previews must bypass image optimization.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  demo
                    ? demoPhotos[m.image.id]
                    : `/api/chat-photos/${m.image.id}`
                }
                alt={m.image.name}
              />
            )}
            <p>{m.text}</p>
            {m.intent && ["reminders", "campaign"].includes(m.intent) && (
              <div className="stack">
                {m.intent === "campaign" && (
                  <label>
                    Service to offer
                    <NativeSelect
                      className="yw-select"
                      value={offerService}
                      onChange={(e) => setOfferService(e.target.value)}
                    >
                      {state.rates.map((rate) => (
                        <option key={rate.service} value={rate.service}>
                          {rate.service}
                        </option>
                      ))}
                    </NativeSelect>
                  </label>
                )}
                <Button
                  variant="secondary"
                  disabled={busy || (m.intent === "campaign" && !offerService)}
                  onClick={() =>
                    void mutate(
                      m.intent as "reminders" | "campaign",
                      m.intent === "campaign" ? { service: offerService } : {},
                    ).catch(() => {})
                  }
                >
                  {m.intent === "reminders"
                    ? "Prepare reminder drafts"
                    : "Prepare offer drafts"}
                </Button>
              </div>
            )}
          </div>
        ))}
      {uploading&&<p role="status" className="yw-agent-pending">Working on it…</p>}
      {aiReply && <div className="yw-note"><h3>AI suggestion — review before use</h3><p>{aiReply}</p><p>This suggestion is temporary and has not changed your records.</p></div>}
       </div>
      </div>
      <div className="yw-agent-compose-area">
      {!state.chat.length&&<div className="yw-agent-suggestions">
        {[
          "My week",
          "Who owes me?",
          "Customer requests",
          "Draft service offers",
        ].map((prompt) => (
          <Button
            key={prompt}
            variant="secondary"
            onClick={() => {setText(prompt);composer.current?.focus();}}
          >
            {prompt}
          </Button>
        ))}
      </div>}
      {aiReady && <label><input type="checkbox" checked={aiMode} onChange={e=>setAiMode(e.target.checked)} disabled={busy||uploading}/> Use AI suggestions (workspace summary and attached photo are sent to Cloudflare AI)</label>}

      <form
        className="yw-agent-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Textarea
          ref={composer}
          onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();void send();}}}
          aria-label="Message to Yardwork"
          placeholder="Ask anything…"
          value={text}
          maxLength={4000}
          onChange={(e) => setText(e.target.value)}
          rows={2}
        />
        {photo && (
          <div className="yw-actions">
            <span>{photo.image.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove attachment"
              onClick={() => setPhoto(null)}
            >
              <X />
            </Button>
          </div>
        )}
        <input
          ref={file}
          type="file"
          aria-label="Attach a photo to your message"
          tabIndex={-1}
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            void attach(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <div className="yw-agent-composer-tools">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach photo"
            title="Attach photo"
            disabled={uploading}
            onClick={() => file.current?.click()}
          >
            <Paperclip size={17} />
          </Button>
          <Button
            disabled={busy || uploading || (!text.trim() && !photo)}
            type="submit"
            size="icon"
            aria-label={uploading?'Sending message':'Send message'}
          >
            <ArrowUp size={17} />
          </Button>
        </div>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
      </form>
      <p className="yw-agent-footnote">{aiReady?'Review suggestions before acting.':'Guided help with your workspace. Open-ended AI is not connected.'}</p>
      </div>
    </section>
  );
}
