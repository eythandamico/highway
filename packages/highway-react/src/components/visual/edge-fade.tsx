import "./visual-effects.css";
import { cn } from "../../lib/utils";
/** Surface-colored tint for decorative ribbon/scroll edges. Does not blur or
 * mask the content itself and never intercepts clicks. */
export function EdgeFade({axis="horizontal",className}:{axis?:"horizontal"|"vertical";className?:string}) {return <span className={cn("fx-edge-fade",className)} data-axis={axis} aria-hidden="true"/>;}
