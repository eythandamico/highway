"use client";
import {ArrowUp,Mic,MessageSquare,X} from 'lucide-react';
import {useEffect,useLayoutEffect,useRef,useState,type MouseEventHandler} from 'react';
import {Button} from './button';
import {Input} from './input';
import './ask-bar.css';

export interface AskBarMessage { id: string; role: string; text: string }
export interface AskBarProps {
 messages?: AskBarMessage[];
 onSend: (text: string) => void | Promise<void>;
 onOpen?: MouseEventHandler<HTMLButtonElement>;
 label?: string;
 placeholder?: string;
 disabled?: boolean;
 hidden?: boolean;
 floating?: boolean;
 compactOnScroll?: boolean;
}
/** Glass composer; callers own conversation data and transport. No service is bundled. */
export function AskBar({messages=[],onSend,onOpen,label="Ask anything",placeholder="Ask anything…",disabled=false,hidden=false,floating=false,compactOnScroll=false}:AskBarProps) {
 const [value,setValue]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState(''),[since,setSince]=useState<number|null>(null);
 const [perched,setPerched]=useState(false),[engaged,setEngaged]=useState(false),input=useRef<HTMLInputElement>(null),sending=useRef(false);
 const focusAfterExpand=useRef(false);
 const stack=useRef<HTMLDivElement>(null),log=useRef<HTMLDivElement>(null);
 const compact=compactOnScroll&&perched&&!engaged&&!value&&!pending&&since===null;
 useLayoutEffect(()=>{
  if(!compact&&focusAfterExpand.current){focusAfterExpand.current=false;input.current?.focus();}
 },[compact]);
 const replies=since===null?[]:messages.slice(since);
 const visibleReply=!hidden&&(replies.length>0||!!error);
 const question=replies.find(message=>message.role==='user')?.text||value;
 useEffect(()=>{
  if(!visibleReply)return;
  const dismiss=()=>{setSince(null);setError('');};
  const pointer=(event:PointerEvent)=>{if(floating&&event.target instanceof Node&&!stack.current?.contains(event.target))dismiss();};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.stopPropagation();dismiss();input.current?.focus();}};
  window.addEventListener('pointerdown',pointer);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('pointerdown',pointer);window.removeEventListener('keydown',key);};
 },[visibleReply,floating]);
 useEffect(()=>{
  const scroller=log.current;if(!scroller)return;
  const last=scroller.lastElementChild as HTMLElement|null;
  if(last)scroller.scrollTop=Math.max(0,last.offsetTop);
 },[messages.length,pending]);
 useEffect(()=>{
  if(!compactOnScroll)return;
  let last=window.scrollY,travel=0,direction=0,frame=0;
  const update=()=>{
   frame=0;
   const next=Math.max(0,window.scrollY),delta=next-last;last=next;
   if(next<80){travel=0;setPerched(false);return;}
   if(Math.abs(delta)<1)return;
   const nextDirection=Math.sign(delta);
   if(nextDirection!==direction){travel=0;direction=nextDirection;}
   travel+=Math.abs(delta);
   // Require intentional travel, so trackpad jitter cannot reverse the morph.
   if(travel>=32){setPerched(direction>0&&next>160);travel=0;}
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',scroll,{passive:true});
  return()=>{window.removeEventListener('scroll',scroll);cancelAnimationFrame(frame);};
 },[compactOnScroll]);
 async function send(){const text=value.trim();if(!text||disabled||sending.current)return;sending.current=true;setPending(true);setError('');const start=since??messages.length;try{await onSend(text);setSince(start);setValue('');}catch(e){setError(e instanceof Error?e.message:'Could not send. Please try again.');}finally{sending.current=false;setPending(false);requestAnimationFrame(()=>input.current?.focus());}}
 return <div className="ui-ask-root" data-floating={floating} hidden={hidden}>
  <div className="ui-ask-stack" ref={stack}>
   {(replies.length>0||error)&&<section className="ui-ask-reply" aria-label={`${label} reply`}>
    <div className="ui-ask-reply-head"><span className="ui-ask-reply-question" title={question}>{question||label}</span><Button type="button" variant="ghost" size="icon" aria-label="Dismiss reply" onClick={()=>{setSince(null);setError('');input.current?.focus();}}><X size={16}/></Button></div>
    <div ref={log} className="ui-ask-reply-log" role="log" aria-label="Conversation preview" aria-live="polite">{replies.map((message,index)=>index===0&&message.role==='user'?null:<p key={message.id} data-role={message.role}>{message.text}</p>)}{pending&&<p className="ui-ask-reply-pending" role="status">Thinking…</p>}</div>
    {error&&<p role="alert">{error}</p>}
    {onOpen&&<Button type="button" variant="ghost" onClick={event=>{setSince(null);setError('');onOpen(event);}}>Continue in chat <MessageSquare size={16}/></Button>}
   </section>}
   <span className="sr-only" role="status">{pending?'Sending message…':''}</span>
   <form aria-label={`${label} composer`} aria-busy={pending} className="ui-ask-capsule" data-compact={compact} onSubmit={event=>{event.preventDefault();void send();}} onPointerEnter={()=>setEngaged(true)} onPointerLeave={event=>{if(!event.currentTarget.contains(document.activeElement))setEngaged(false);}} onFocusCapture={()=>{if(compact)focusAfterExpand.current=true;setEngaged(true);}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setEngaged(false);}}>
    <span className="ui-ask-glass" aria-hidden="true"/><span className="ui-ask-rim" aria-hidden="true"/>
    <Button type="button" className="ui-ask-expand" variant="ghost" disabled={disabled} tabIndex={compact?0:-1} aria-hidden={!compact} onClick={()=>{setEngaged(true);requestAnimationFrame(()=>input.current?.focus());}}>{label}</Button>
    <div className="ui-ask-compose" inert={compact} aria-hidden={compact}>
     <Input ref={input} className="ui-ask-input" aria-label={label} placeholder={pending?'Thinking…':placeholder} value={value} onChange={event=>setValue(event.target.value)} maxLength={4000} disabled={disabled||pending} autoComplete="off" onKeyDown={event=>{if(event.key==='Escape'){setSince(null);setError('');}}}/>
     {value.trim()?<Button className="ui-ask-send" variant="ghost" size="icon" type="submit" aria-label="Send message" aria-busy={pending} disabled={disabled||pending}><ArrowUp size={20}/></Button>:<Button className="ui-ask-mic" variant="ghost" size="icon" type="button" aria-label="Voice input unavailable" title="Voice input will be available after voice service setup" disabled><Mic size={20}/></Button>}
    </div>
   </form>
  </div>
 </div>;
}
