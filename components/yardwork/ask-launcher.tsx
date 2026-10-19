"use client";
import {ArrowUp,Mic,MessageSquare,X} from 'lucide-react';
import {useEffect,useRef,useState,type MouseEventHandler} from 'react';
import {Button,Input} from './shared';
import {useOffice} from './context';
import {MetalHelper} from '@/components/visual/vault-orb/helper';
import './ask-launcher.css';

export default function AskLauncher({open,onOpen}:{open:boolean;onOpen:MouseEventHandler<HTMLButtonElement>}) {
 const {state,mutate,busy}=useOffice();
 const [value,setValue]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState(''),[since,setSince]=useState<number|null>(null);
 const [perched,setPerched]=useState(false),[engaged,setEngaged]=useState(false),input=useRef<HTMLInputElement>(null),sending=useRef(false);
 const stack=useRef<HTMLDivElement>(null),log=useRef<HTMLDivElement>(null);
 const compact=perched&&!engaged&&!value&&!pending&&since===null;
 const replies=since===null?[]:state.chat.slice(since);
 const visibleReply=!open&&(replies.length>0||!!error);
 const question=replies.find(message=>message.role==='user')?.text||value;
 useEffect(()=>{
  if(!visibleReply)return;
  const dismiss=()=>{setSince(null);setError('');};
  const pointer=(event:PointerEvent)=>{if(event.target instanceof Node&&!stack.current?.contains(event.target))dismiss();};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.stopPropagation();dismiss();input.current?.focus();}};
  window.addEventListener('pointerdown',pointer);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('pointerdown',pointer);window.removeEventListener('keydown',key);};
 },[visibleReply]);
 useEffect(()=>{
  const scroller=log.current;if(!scroller)return;
  const last=scroller.lastElementChild as HTMLElement|null;
  if(last)scroller.scrollTop=Math.max(0,last.offsetTop);
 },[state.chat.length,pending]);
 useEffect(()=>{
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
 },[]);
 async function send(){const text=value.trim();if(!text||busy||sending.current)return;sending.current=true;setPending(true);setError('');const start=since??state.chat.length;try{await mutate('ask',{id:crypto.randomUUID(),text});setSince(start);setValue('');}catch(e){setError(e instanceof Error?e.message:'Could not send. Please try again.');}finally{sending.current=false;setPending(false);requestAnimationFrame(()=>input.current?.focus());}}
 return <div className="yw-ask-dock" hidden={open}>
  <div className="yw-vault-stack" ref={stack}>
   {(replies.length>0||error)&&<section className="yw-vault-reply" aria-label="Yardwork reply">
    <div className="yw-vault-reply-head"><span className="yw-vault-reply-question" title={question}>{question||'Yardwork'}</span><Button type="button" variant="ghost" size="icon" aria-label="Dismiss reply" onClick={()=>{setSince(null);setError('');input.current?.focus();}}><X size={16}/></Button></div>
    <div ref={log} className="yw-vault-reply-log" role="log" aria-label="Conversation preview" aria-live="polite">{replies.map((message,index)=>index===0&&message.role==='user'?null:<p key={message.id} data-role={message.role}>{message.text}</p>)}{pending&&<p className="yw-vault-reply-pending" role="status">Thinking…</p>}</div>
    {error&&<p role="alert">{error}</p>}
    <Button type="button" variant="ghost" onClick={event=>{setSince(null);setError('');onOpen(event);}}>Continue in chat <MessageSquare size={16}/></Button>
   </section>}
   <form className="yw-vault-capsule" data-compact={compact} onSubmit={event=>{event.preventDefault();void send();}} onPointerEnter={()=>setEngaged(true)} onPointerLeave={event=>{if(!event.currentTarget.contains(document.activeElement))setEngaged(false);}} onFocusCapture={()=>setEngaged(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setEngaged(false);}}>
    <span className="yw-vault-glass" aria-hidden="true"/><span className="yw-vault-rim" aria-hidden="true"/>
    <Button type="button" className="yw-vault-orb-button" variant="ghost" size="icon" aria-label="Open Ask Yardwork conversation" onClick={event=>{setSince(null);setError('');onOpen(event);}}><MetalHelper thinking={pending}/></Button>
    <Button type="button" className="yw-vault-expand" variant="ghost" tabIndex={compact?0:-1} aria-hidden={!compact} onClick={()=>{setEngaged(true);requestAnimationFrame(()=>input.current?.focus());}}>Ask Yardwork</Button>
    <div className="yw-vault-compose" inert={compact} aria-hidden={compact}>
     <Input ref={input} className="yw-vault-input" aria-label="Ask Yardwork" placeholder={pending?'Thinking…':'Ask anything…'} value={value} onChange={event=>setValue(event.target.value)} maxLength={4000} disabled={pending} autoComplete="off" onKeyDown={event=>{if(event.key==='Escape'){setSince(null);setError('');}}}/>
     {value.trim()?<Button className="yw-vault-send" variant="ghost" size="icon" type="submit" aria-label="Send message" aria-busy={pending} disabled={busy||pending}><ArrowUp size={20}/></Button>:<Button className="yw-vault-mic" variant="ghost" size="icon" type="button" aria-label="Voice input unavailable" title="Voice input will be available after voice service setup" disabled><Mic size={20}/></Button>}
    </div>
   </form>
  </div>
 </div>;
}
