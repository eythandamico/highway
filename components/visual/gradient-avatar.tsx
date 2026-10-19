"use client";
import { useId } from "react";
import { avatarIdentity } from "@/lib/gradient-identity";
import { cn } from "@/lib/utils";
/** Deterministic identity colors; same broad SVG fields as the source avatar.
 * Supply label when the image conveys identity, omit it beside a visible name. */
export function GradientAvatar({identity,label,size=48,className}:{identity:string;label?:string;size?:number;className?:string}) {
 const instance=useId(),{start,end,blend,accent}=avatarIdentity(identity);
 return <svg className={cn("fx-gradient-avatar",className)} viewBox="0 0 24 24" width={size} height={size} role={label?"img":undefined} aria-label={label} aria-hidden={label?undefined:true} focusable="false">
 <defs><radialGradient id={`${instance}-bloom`} cx="18%" cy="14%" r="90%"><stop stopColor={start}/><stop offset="1" stopColor={start} stopOpacity="0"/></radialGradient><radialGradient id={`${instance}-glow`} cx="88%" cy="62%" r="75%"><stop stopColor={blend} stopOpacity=".9"/><stop offset="1" stopColor={blend} stopOpacity="0"/></radialGradient><radialGradient id={`${instance}-cool`} cx="25%" cy="100%" r="70%"><stop stopColor={accent} stopOpacity=".8"/><stop offset="1" stopColor={accent} stopOpacity="0"/></radialGradient></defs><circle cx="12" cy="12" r="12" fill={end}/>{["bloom","glow","cool"].map(layer=><circle key={layer} cx="12" cy="12" r="12" fill={`url(#${instance}-${layer})`}/>)}</svg>;
}
