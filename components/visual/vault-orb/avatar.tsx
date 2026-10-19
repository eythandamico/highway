"use client";
import {useEffect,useRef} from 'react';
import { orbPalette } from './palette';
/** Vault's original liquid shader and runtime, loaded only after mount. */
export function VaultOrb({thinking=false}:{thinking?:boolean}) {
 const canvas=useRef<HTMLCanvasElement>(null),controller=useRef<import('./liquidOrbRenderer').LiquidOrbController|null>(null);
 useEffect(()=>{
  let disposed=false;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(motion.matches)return;
  void import('./liquidOrbRenderer').then(({createLiquidOrb})=>{
   if(disposed||!canvas.current)return;
   controller.current=createLiquidOrb(canvas.current);
   // Keep the existing spherical shader; tint its material and shell in the GPU.
   const overrides = new Map<number, number>([[4,0.86],[15,25],[16,2.4/(30*0.92)],[23,0.035]]);

   for (const [start, hex] of Object.entries(orbPalette)) {
    for (let channel=0; channel<3; channel++) {
     overrides.set(Number(start)+channel,parseInt(hex.slice(1+channel*2,3+channel*2),16)/255);
    }
   }
   controller.current.setOverrides(overrides);
  });
  return()=>{disposed=true;controller.current?.destroy();controller.current=null;};
 },[]);
 useEffect(()=>{controller.current?.setState(thinking?'thinking':'idle');},[thinking]);
 return <span className="yw-vault-orb" aria-hidden="true"><canvas ref={canvas}/></span>;
}
