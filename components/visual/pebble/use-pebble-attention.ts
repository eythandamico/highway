"use client";
import {useEffect,useRef} from 'react';

/** Sparse idle timers and event-driven gaze; never a continuous animation loop. */
export function usePebbleAttention(thinking:boolean) {
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const host=ref.current;if(!host)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  let visible=false,disposed=false,frame=0,idle:ReturnType<typeof setTimeout>|undefined,settle:ReturnType<typeof setTimeout>|undefined;
  let lastExpression=-1;
  let following=false,lastFollow=-Infinity,lastMove=0,lastUpdate=0,pointer:{x:number;y:number}|null=null;
  const active=()=>!disposed&&visible&&!document.hidden&&!reduced.matches&&!thinking;
  const gaze=(x=0,y=0,tilt=0)=>{
   host.style.setProperty('--pebble-gaze-x',`${x}px`);
   host.style.setProperty('--pebble-gaze-y',`${y}px`);
   host.style.setProperty('--pebble-gaze-tilt',`${tilt}deg`);
   host.style.setProperty('--pebble-surface-x',`${-x*.32}px`);
   host.style.setProperty('--pebble-surface-y',`${-y*.32}px`);
   // The far eye narrows with the turn; vertical looks stretch both eyes slightly.
   const turn=Math.max(-1,Math.min(1,x/2.8));
   host.style.setProperty('--pebble-eye-left-x',`${1-Math.max(0,turn)*.14}`);
   host.style.setProperty('--pebble-eye-right-x',`${1-Math.max(0,-turn)*.14}`);
   host.style.setProperty('--pebble-eye-y',`${1+Math.min(.06,Math.abs(y)*.035)}`);
  };
  const stop=()=>{clearTimeout(idle);clearTimeout(settle);cancelAnimationFrame(frame);frame=0;following=false;host.dataset.attention='rest';host.dataset.expression='neutral';host.dataset.motionActive='false';gaze();};
  const track=()=>{
   frame=0;if(!active()||!pointer||!following)return;
   const box=host.getBoundingClientRect(),dx=pointer.x-box.left-box.width/2,dy=pointer.y-box.top-box.height/2;
   gaze(Math.tanh(dx/160)*2.8,Math.tanh(dy/140)*1.8,Math.tanh(dx/160)*2);
  };
  const rest=()=>{following=false;host.dataset.attention='rest';host.dataset.expression='neutral';gaze();};
  const follow=()=>{
   if(!active()||!fine.matches||!pointer)return;
   clearTimeout(settle);following=true;lastFollow=performance.now();host.dataset.attention='following';host.dataset.expression='attentive';track();
   settle=setTimeout(rest,2200);
  };
  const glance=()=>{
   if(!active())return;
   if(!following){
    if(pointer&&fine.matches&&performance.now()-lastMove<4000&&performance.now()-lastFollow>12000&&Math.random()<.5)follow();
    else {
     const expressions=['curious','content','ponder'];
     // Pick a different gesture each time, with ample neutral time between gestures.
     lastExpression=(lastExpression+1+Math.floor(Math.random()*2))%expressions.length;
     const expression=expressions[lastExpression],direction=Math.random()<.5?-1:1;
     host.dataset.attention='curious';host.dataset.expression=expression;
     if(expression==='content')gaze(0,.4,direction*2);
     else gaze(direction*(1.5+Math.random()),-.5-Math.random(),direction*(expression==='ponder'?5:3));
     clearTimeout(settle);settle=setTimeout(rest,1400+Math.random()*600);
    }
   }
   idle=setTimeout(glance,5000+Math.random()*5000);
  };
  const resume=()=>{stop();if(active()){host.dataset.motionActive='true';idle=setTimeout(glance,3500+Math.random()*3000);}};
  const move=(event:PointerEvent)=>{
   if(!active()||!fine.matches||event.pointerType!=='mouse')return;
   pointer={x:event.clientX,y:event.clientY};const now=performance.now();lastMove=now;
   if(!following&&now-lastFollow>12000){const box=host.getBoundingClientRect();if(Math.hypot(pointer.x-box.left-box.width/2,pointer.y-box.top-box.height/2)<220)follow();}
   if(following&&!frame&&now-lastUpdate>70){lastUpdate=now;frame=requestAnimationFrame(track);}
  };
  const greet=()=>{
   if(!active()||!fine.matches||following)return;
   clearTimeout(settle);host.dataset.expression='greeting';gaze(0,-.6,-2);
   settle=setTimeout(rest,1200);
  };
  host.addEventListener('pointerenter',greet);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();});observer.observe(host);
  window.addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);fine.addEventListener('change',resume);
  return()=>{disposed=true;stop();observer.disconnect();host.removeEventListener('pointerenter',greet);window.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',resume);fine.removeEventListener('change',resume);};
 },[thinking]);
 return ref;
}
