import "./visual-effects.css";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
export type BlurEdge = "top" | "bottom" | "left" | "right";
/** A decorative backdrop, not a blur applied to its foreground content.
 * Position inside a bounded, positioned parent and keep controls above it.
 * edge identifies the opaque end; the effect fades away from that edge.
 */
export function ProgressiveBlur({edge="top",recipe="header",className,style}:{edge?:BlurEdge;recipe?:"header"|"rail"|"panel";className?:string;style?:CSSProperties}) {
 return <div className={cn("fx-progressive",className)} data-edge={edge} data-recipe={recipe} style={style} aria-hidden="true"><span/><span/><span/></div>;
}
