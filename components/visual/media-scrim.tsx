import "./visual-effects.css";
import { cn } from "@/lib/utils";
/** The caption is a sibling above this layer, so its text stays sharp.
 * Use softness only for short desktop emphasis, not full-size artwork. */
export function MediaScrim({softness=false,className}:{softness?:boolean;className?:string}) {return <div className={cn("fx-media-scrim",className)} data-softness={softness||undefined} aria-hidden="true"/>;}
