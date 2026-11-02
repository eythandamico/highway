"use client";
import { useState } from "react";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { Input } from "../../../packages/highway-react/src/components/ui/input";
import { useExampleState } from "./example-state";
import { previewFeedback } from './feedback.js';
import { PromptBar } from '../../../packages/highway-react/src/components/prompt-bar.jsx';
import { MessageBubble } from '../../../packages/highway-react/src/components/message-bubble.jsx';
import { ImageCarousel } from '../../../packages/highway-react/src/components/image-carousel.jsx';
import { ComponentStage } from "./preview-helpers.jsx";
export function MessageBubbleExample() {
    const [messageState] = useExampleState("messageState", 'default');
    const [userText, setUserText] = useState("Can you help me deploy this to production?");
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(userText);
    const [notice, setNotice] = useState("");
    const [retried, setRetried] = useState(false);
    const answer = retried ? "Here’s another approach: review the build output first, then deploy when you’re ready." : "Start by running your build and reviewing the output. Then confirm the deployment target.";
    const copy = async text => {
      try { await navigator.clipboard.writeText(text); setNotice("Copied"); }
      catch { setNotice("Copy unavailable. Select the message text to copy it."); }
    };
    return <ComponentStage><div className="w-[500px] max-w-full flex flex-col gap-4">
      <MessageBubble role="user" content={userText} avatarUrl="/invariant-preview/avatar.svg" timestamp="2:14 PM" onCopy={() => copy(userText)} onEdit={() => { setDraft(userText); setEditing(true); }} onRetry={() => { setRetried(value => !value); setNotice("Example response regenerated"); }}/>
      {editing && <form className="flex gap-2" onSubmit={event => { event.preventDefault(); if (draft.trim()) { setUserText(draft.trim()); setEditing(false); } }}><Input aria-label="Edit message" value={draft} onChange={event => setDraft(event.target.value)} autoFocus/><Button size="sm" type="submit">Save</Button><Button size="sm" variant="ghost" type="button" onClick={() => setEditing(false)}>Cancel</Button></form>}
      <MessageBubble role="agent" agentName="Nova" content={messageState === 'thinking' ? undefined : answer} thinking={messageState === 'thinking'} timestamp="2:15 PM" onCopy={() => copy(answer)} onThumbsUp={() => setNotice("Marked helpful")} onThumbsDown={() => setNotice("Marked unhelpful")}/>
      <span role="status" className="highway-type-caption text-[var(--muted-foreground)]">{notice}</span>
    </div></ComponentStage>;
}
export function PromptBarExample() {
    const [selectedModel, setSelectedModel] = useExampleState("selectedModel", 'sonnet');
    return (<ComponentStage>
          <div className="w-[600px]">
            <PromptBar placeholder="Ask anything..." models={[
            { id: 'sonnet', label: 'Sonnet 4' },
            { id: 'gpt4o', label: 'GPT-4o' },
            { id: 'gemini', label: 'Gemini 2.5 Pro' },
        ]} activeModel={selectedModel} onModelChange={setSelectedModel} onSubmit={(msg) => previewFeedback('Send:', msg)} onUpload={() => previewFeedback('Upload')} onMicPress={() => previewFeedback('Mic')}/>
          </div>
        </ComponentStage>);
}
export function ImageCarouselExample() {
    const [carouselAutoHide] = useExampleState("carouselAutoHide", false);
    const [carouselPos] = useExampleState("carouselPos", 'bottom');
    return (<>
          <ComponentStage>
            <div className="w-[480px]">
              <ImageCarousel images={[
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&h=500&fit=crop',
        ]} height={300} autoHide={carouselAutoHide} controlsPosition={carouselPos}/>
            </div>
          </ComponentStage>

        </>);
}
