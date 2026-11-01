"use client";
import { useExampleState } from "./example-state";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { Status } from "../../../packages/highway-react/src/components/foundation/status";
import { Feedback, LoadingState } from "../../../packages/highway-react/src/components/foundation/feedback";

export function FeedbackPreview(){const [retry,setRetry]=useExampleState("retry", false);return retry?<div className="library-preview-form"><LoadingState>Retrying…</LoadingState><Button variant="ghost" onClick={()=>setRetry(false)}>Reset preview</Button></div>:<Feedback action={<Button variant="secondary" onClick={()=>setRetry(true)}>Retry</Button>}>Could not save. Your draft is still here.</Feedback>;}

export function LoadingPreview(){return <LoadingState>Loading results…</LoadingState>;}

export function StatusPreview(){return <div className="library-preview-row"><Status tone="good">Complete</Status><Status tone="warning">Needs attention</Status><Status tone="bad">Failed</Status><Status tone="info">In progress</Status></div>;}
