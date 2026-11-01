"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Mic, Pause, Play, Square, Paperclip, X, Check, ArrowRight } from "lucide-react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog";

function RecordingWaveform({stream,active}:{stream:MediaStream|null;active:boolean}) {
 const canvas=useRef<HTMLCanvasElement|null>(null);
 const levels=useRef(new Float32Array(72));
 useEffect(()=>{
  if(!stream||!active||!canvas.current||typeof AudioContext==="undefined")return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let context:AudioContext|undefined,frame=0;
  try {
   context=new AudioContext();const analyser=context.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.85;
   context.createMediaStreamSource(stream).connect(analyser);
   void context.resume().catch(()=>{});
   const samples=new Uint8Array(analyser.frequencyBinCount);const surface=canvas.current;
   const bars=levels.current;let previous=performance.now();const draw=()=>{
    const paint=surface.getContext("2d");if(!paint)return;
    const rect=surface.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.round(32*dpr);
    if(surface.width!==width)surface.width=width;if(surface.height!==height)surface.height=height;
    paint.setTransform(dpr,0,0,dpr,0,0);paint.clearRect(0,0,rect.width,32);
    const now=performance.now(),blend=1-Math.exp(-Math.min(64,now-previous)/100);previous=now;
    analyser.getByteFrequencyData(samples);paint.fillStyle=getComputedStyle(surface).color;
    const step=rect.width/bars.length;
    for(let i=0;i<bars.length;i++){
     const index=Math.floor(i/bars.length*samples.length);
     const target=(samples[Math.max(0,index-1)]+samples[index]*2+samples[Math.min(samples.length-1,index+1)])/1020;
     bars[i]+=(target-bars[i])*blend;
     const center=1-Math.abs(i/(bars.length-1)-.5)*.65;
     const height=Math.max(2,bars[i]*30*center),width=Math.max(1,step*.3);
     paint.globalAlpha=.45+bars[i]*.55;paint.beginPath();paint.roundRect(i*step+(step-width)/2,(32-height)/2,width,height,width/2);paint.fill();
    }
    frame=requestAnimationFrame(draw);
   };draw();
  }catch{/* Metering is optional; recording continues when Web Audio is unavailable. */}
  return()=>{cancelAnimationFrame(frame);if(context)void context.close().catch(()=>{});};
 },[stream,active]);
 return <canvas ref={canvas} width={240} height={32} className="hw-voice-waveform" aria-hidden="true"/>;
}

function PlaybackWaveform({blob,position,duration,onSeek}:{blob:Blob;position:number;duration:number;onSeek:(value:number)=>void}) {
 const [peaks,setPeaks]=useState<number[]>([]);
 useEffect(()=>{
  let cancelled=false;let context:AudioContext|undefined;
  if(typeof AudioContext==="undefined")return;
  void (async()=>{
   try{
    context=new AudioContext();
    const decoded=await context.decodeAudioData(await blob.arrayBuffer());
    if(cancelled)return;
    const values=Array.from({length:64},(_,index)=>{
     const start=Math.floor(index*decoded.length/64),end=Math.max(start+1,Math.floor((index+1)*decoded.length/64));
     let peak=0;
     for(let channel=0;channel<decoded.numberOfChannels;channel++){
      const samples=decoded.getChannelData(channel);
      for(let i=start;i<end;i++)peak=Math.max(peak,Math.abs(samples[i]||0));
     }
     return peak;
    });
    const maximum=Math.max(.01,...values);
    setPeaks(values.map(value=>value/maximum));
   }catch{/* A flat seek track remains available when this codec cannot be decoded. */}
   finally{if(context&&context.state!=="closed")void context.close().catch(()=>{});}
  })();
  return()=>{cancelled=true;if(context&&context.state!=="closed")void context.close().catch(()=>{});};
 },[blob]);
 const progress=duration>0?position/duration:0;
 return <div className="hw-voice-playback-wave">
  <svg viewBox="0 0 256 32" preserveAspectRatio="none" aria-hidden="true">{Array.from({length:64},(_,i)=>{
   const height=Math.max(2,(peaks[i]||0)*30);
   return <rect key={i} x={i*4+1} y={(32-height)/2} width={2} height={height} rx={1} data-played={i/64<progress||undefined}/>;
  })}</svg>
  <input className="hw-voice-seek" type="range" aria-label="Recording position" aria-valuetext={`${Math.floor(position)} of ${Math.ceil(duration)} seconds`} min={0} max={Math.max(.01,duration)} step={.01} value={position} onChange={event=>onSeek(Number(event.target.value))}/>
 </div>;
}

export type VoiceRecording = { blob: Blob; durationMs: number; mimeType: string };
export type VoiceRecorderProps = { onAttach: (recording: VoiceRecording) => void | Promise<void>; disabled?: boolean; label?: string; className?: string };
/** Local microphone recording. No upload or transcription happens unless the host's onAttach performs it. */
export function VoiceRecorder({ onAttach, disabled = false, label = "Voice note", className = "" }: VoiceRecorderProps) {
 const [state,setState]=useState<"idle"|"requesting"|"recording"|"paused"|"stopping"|"ready"|"attaching">("idle");
 const container=useRef<HTMLElement|null>(null),focusTransition=useRef(false);
 const gesture=useRef<{id:number;x:number;at:number}|null>(null);
 const [cancelling,setCancelling]=useState(false);
 const audio=useRef<HTMLAudioElement|null>(null);
 const [playing,setPlaying]=useState(false),[position,setPosition]=useState(0);
 const [meterStream,setMeterStream]=useState<MediaStream|null>(null);
 const [playbackBlob,setPlaybackBlob]=useState<Blob|null>(null);
 const [error,setError]=useState(""); const [elapsed,setElapsed]=useState(0); const [url,setUrl]=useState("");
 const recorder=useRef<MediaRecorder|null>(null), stream=useRef<MediaStream|null>(null), recording=useRef<VoiceRecording|null>(null);
 const alive=useRef(true), generation=useRef(0), busy=useRef(false), objectUrl=useRef(""), started=useRef(0), duration=useRef(0);
 const stopTracks=()=>{stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;};
 const clearUrl=()=>{if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);objectUrl.current="";};
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;const r=recorder.current;if(r){r.ondataavailable=null;r.onstop=null;r.onerror=null;if(r.state!=="inactive")r.stop();}stopTracks();clearUrl();};},[]);
 useEffect(()=>{if(state!=="recording")return;const timer=window.setInterval(()=>setElapsed(duration.current+Date.now()-started.current),250);return()=>clearInterval(timer);},[state]);
 useEffect(()=>{if(focusTransition.current){container.current?.querySelector<HTMLButtonElement>("button")?.focus();if(state!=="requesting"&&state!=="stopping")focusTransition.current=false;}},[state]);
 const reset=()=>{focusTransition.current=true;setCancelling(false);generation.current++;clearUrl();recording.current=null;recorder.current=null;duration.current=0;busy.current=false;setUrl("");setPlaybackBlob(null);setPlaying(false);setPosition(0);setElapsed(0);setState("idle");setError("");};
 const start=async()=>{
  if(disabled||busy.current)return;busy.current=true;setError("");setState("requesting");const token=++generation.current;
  try{
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined")throw new Error("Recording is unavailable. Use a supported browser on HTTPS or localhost.");
   const input=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!alive.current||token!==generation.current){input.getTracks().forEach(t=>t.stop());return;}
   stream.current=input;setMeterStream(input);const r=new MediaRecorder(input);recorder.current=r;const chunks:BlobPart[]=[];
   r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   r.onerror=()=>{if(!alive.current||token!==generation.current)return;generation.current++;r.onstop=null;stopTracks();busy.current=false;setState("idle");setError("Recording was interrupted. Please try again.");};
   r.onstop=()=>{
    stopTracks();if(!alive.current||token!==generation.current)return;
    if(started.current){duration.current+=Date.now()-started.current;started.current=0;}
    const blob=new Blob(chunks,{type:r.mimeType||"audio/webm"});busy.current=false;
    if(!blob.size){setState("idle");setError("No audio was captured. Please try again.");return;}
    recording.current={blob,durationMs:duration.current,mimeType:blob.type};setPlaybackBlob(blob);clearUrl();objectUrl.current=URL.createObjectURL(blob);setUrl(objectUrl.current);setElapsed(duration.current);setState("ready");
   };
   duration.current=0;started.current=Date.now();r.start();setState("recording");
  }catch(e){if(alive.current&&token===generation.current){stopTracks();busy.current=false;setState("idle");setError(e instanceof DOMException&&e.name==="NotAllowedError"?"Microphone access was denied. Allow access in your browser, then try again.":e instanceof Error?e.message:"Could not start recording.");}}
 };
 const pause=()=>{const r=recorder.current;if(!r)return;try{if(r.state==="recording"){r.pause();duration.current+=Date.now()-started.current;started.current=0;setElapsed(duration.current);setState("paused");}else if(r.state==="paused"){r.resume();started.current=Date.now();setState("recording");}}catch{setError("Could not change recording state. Stop the recording and try again.");}};
 const stop=()=>{const r=recorder.current;if(!r||r.state==="inactive")return;if(started.current){duration.current+=Date.now()-started.current;started.current=0;}setState("stopping");r.stop();};
 const attach=async()=>{if(disabled||busy.current||!recording.current)return;busy.current=true;setState("attaching");setError("");try{await onAttach(recording.current);if(alive.current)reset();}catch(e){if(alive.current){busy.current=false;setState("ready");setError(e instanceof Error?e.message:"Could not attach the recording. Try again.");}}};
 const active=state==="recording"||state==="paused"||state==="stopping";
 const cancelRecording=()=>{const r=recorder.current;if(r){r.onstop=null;r.ondataavailable=null;r.onerror=null;if(r.state!=="inactive")r.stop();}stopTracks();reset();};
 const ready=state==="ready"||state==="attaching";
 const time=ready&&(playing||position>0)?position*1000:elapsed;
 const status=({idle:"Ready to record",requesting:"Waiting for microphone permission",recording:"Recording",paused:"Paused",stopping:"Preparing playback",ready:"Ready to attach",attaching:"Attaching recording"})[state];
 const togglePlayback=async()=>{const player=audio.current;if(!player)return;if(!player.paused){player.pause();return;}try{await player.play();setError("");}catch{setError("Playback could not start. Try again or attach the recording.");}};
 return <section ref={container} className={`hw-voice-recorder ${className}`} data-state={state} data-cancelling={cancelling||undefined}
 onPointerDown={event=>{if(disabled||state!=="idle"||event.button!==0||!(event.target as Element).closest("[data-voice-start]"))return;gesture.current={id:event.pointerId,x:event.clientX,at:performance.now()};event.currentTarget.setPointerCapture(event.pointerId);void start();}}
 onPointerMove={event=>{if(gesture.current?.id===event.pointerId)setCancelling(event.clientX-gesture.current.x < -64);}}
 onPointerUp={event=>{const g=gesture.current;if(!g||g.id!==event.pointerId)return;gesture.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);setCancelling(false);if(event.clientX-g.x < -64){cancelRecording();return;}if(performance.now()-g.at>200){if(recorder.current)stop();else reset();}}}
 onLostPointerCapture={event=>{if(gesture.current?.id===event.pointerId){gesture.current=null;cancelRecording();}}}
 onPointerCancel={event=>{if(gesture.current?.id!==event.pointerId)return;gesture.current=null;cancelRecording();}}
 aria-label={label} aria-busy={state==="requesting"||state==="attaching"}>
  <div className="hw-voice-capsule">
   {state==="idle"?<Button variant="ghost" className="hw-voice-start" data-voice-start aria-label="Record" aria-description="Hold and release to record a note, or tap and use the recording controls. Slide left while holding to discard." disabled={disabled} onClick={event=>{if(event.detail===0){focusTransition.current=true;void start();}}}><Mic/>Hold to record</Button>:<>
    {active&&<Button variant="ghost" size="icon" aria-label={state==="paused"?"Resume":"Pause"} disabled={state==="stopping"} onClick={pause}>{state==="paused"?<Play/>:<Pause/>}</Button>}
    {ready&&<Button size="icon" aria-label={playing?"Pause playback":"Play recording"} onClick={togglePlayback}>{playing?<Pause/>:<Play/>}</Button>}
    <div className="hw-voice-middle">
     {cancelling?<span className="hw-voice-label">Release to discard</span>:active?<RecordingWaveform stream={meterStream} active={state==="recording"}/>:ready?null:<span className="hw-voice-label">Allow microphone access</span>}
     {ready&&playbackBlob&&<PlaybackWaveform blob={playbackBlob} position={position} duration={elapsed/1000} onSeek={value=>{if(audio.current)audio.current.currentTime=value;setPosition(value);}}/>}
    </div>
    {(active||ready)&&<span className="hw-voice-time" aria-label="Recorded duration">{Math.floor(time/60000)}:{String(Math.floor(time/1000)%60).padStart(2,"0")}</span>}
    {state==="requesting"&&<Button variant="ghost" size="icon" aria-label="Cancel request" onClick={reset}><X/></Button>}
    {active&&<Button size="icon" aria-label="Stop recording" disabled={state==="stopping"} onClick={()=>{focusTransition.current=true;stop();}}><Square/></Button>}
    {ready&&<><Button variant="ghost" size="icon" aria-label="Discard" disabled={state==="attaching"} onClick={reset}><X/></Button><Button size="icon" aria-label={state==="attaching"?"Attaching…":"Attach recording"} disabled={disabled||state==="attaching"} onClick={attach}>{state==="attaching"?<Paperclip/>:<ArrowRight/>}</Button></>}
   </>}
  </div>
  <span role="status" className="sr-only">{status}</span>
  {url&&<audio ref={audio} preload="metadata" src={url} aria-label="Recorded voice note" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);setPosition(0);}} onTimeUpdate={event=>setPosition(event.currentTarget.currentTime)}/>}
  {error&&<p role="alert" className="hw-agent-error">{error}</p>}
 </section>;

}

export type ContextItem = { id: string; label: string; description?: string; content?: ReactNode };
export type ContextTrayProps = { items: ContextItem[]; onRemove?: (id: string) => void; disabled?: boolean; label?: string; emptyMessage?: string; className?: string };
/** Controlled context: the host decides which items are sent to its agent. */
export function ContextTray({items,onRemove,disabled=false,label="Included context",emptyMessage="No context attached.",className=""}:ContextTrayProps){
 const trigger=useRef<HTMLButtonElement|null>(null);const [selected,setSelected]=useState<string|null>(null);const item=items.find(i=>i.id===selected);
 return <section className={`hw-context-tray ${className}`} aria-label={label}><div className="hw-agent-toolbar"><span className="hw-agent-title">{label}</span><span className="hw-agent-muted">{items.length} {items.length===1?"item":"items"}</span></div>
 {items.length?<ul className="hw-context-items">{items.map(i=><li key={i.id}><Button variant="secondary" disabled={disabled} onClick={event=>{trigger.current=event.currentTarget;setSelected(i.id);}} aria-label={`Inspect ${i.label}`}><Paperclip/><span className="hw-context-label">{i.label}</span></Button>{onRemove&&<Button variant="ghost" size="icon" disabled={disabled} onClick={()=>onRemove(i.id)} aria-label={`Remove ${i.label}`}><X/></Button>}</li>)}</ul>:<p className="hw-agent-muted">{emptyMessage}</p>}
 <Dialog open={!!item} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}><DialogTitle>{item?.label}</DialogTitle><DialogDescription>{item?.description||"Context supplied by this application."}</DialogDescription><div className="hw-context-detail">{item?.content??"No preview available."}</div></DialogContent></Dialog>
 </section>;
}

export type ReviewApplyCardProps = { title: string; scope?: string; before: string; after: string; onApply: () => void | Promise<void>; onReject?: () => void; disabled?: boolean; className?: string };
/** Remount with a new key for each proposal. Success follows host confirmation, never a speculative animation. */
export function ReviewApplyCard({title,scope,before,after,onApply,onReject,disabled=false,className=""}:ReviewApplyCardProps){
 const [state,setState]=useState<"ready"|"pending"|"applied">("ready"),[error,setError]=useState("");const busy=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const apply=async()=>{if(disabled||busy.current)return;busy.current=true;setState("pending");setError("");try{await onApply();if(alive.current)setState("applied");}catch(e){if(alive.current){busy.current=false;setState("ready");setError(e instanceof Error?e.message:"Could not apply changes. Try again.");}}};
 return <Card className={`hw-review-card ${className}`} aria-busy={state==="pending"}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{scope||"Review the proposed change before applying it."}</CardDescription></CardHeader><CardContent><div className="hw-review-comparison"><section aria-label="Original content"><h4>Before</h4><pre>{before}</pre></section><section aria-label="Proposed content"><h4>After</h4><pre>{after}</pre></section></div>{error&&<p role="alert" className="hw-agent-error">{error}</p>}<p className="hw-agent-muted" role="status">{state==="pending"?"Applying changes…":state==="applied"?"Changes applied.":"Your original stays in place until you apply."}</p></CardContent><CardFooter>{onReject&&state!=="applied"&&<Button variant="secondary" disabled={disabled||state==="pending"} onClick={onReject}>Reject</Button>}<Button disabled={disabled||state!=="ready"} onClick={apply}>{state==="applied"?<><Check/>Applied</>:state==="pending"?"Applying…":<>Apply changes<ArrowRight/></>}</Button></CardFooter></Card>;
}
