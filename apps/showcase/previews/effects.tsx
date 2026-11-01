"use client";
import { useExampleState } from "./example-state";
import { Plus, Star, Play, Pause } from "lucide-react";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { StateIcon } from "../../../packages/highway-react/src/components/ui/state-icon";
import { ProgressiveBlur, type BlurEdge } from "../../../packages/highway-react/src/components/visual/progressive-blur";
import { EdgeFade } from "../../../packages/highway-react/src/components/visual/edge-fade";
import { MediaScrim } from "../../../packages/highway-react/src/components/visual/media-scrim";
import { GradientAvatar } from "../../../packages/highway-react/src/components/visual/gradient-avatar";
import "../../../components/visual/visual-guide.css";

export function ProgressiveBlurPreview() {
 const [edge]=useExampleState<BlurEdge>("edge", "top");
 const [recipe]=useExampleState<"header"|"rail"|"panel">("recipe", "header");
 const [count,setCount]=useExampleState("count", 0);
 return <>
  <div className="fx-demo-stage">
   <div className="fx-demo-art" aria-hidden="true">{["Make","Discover","Create","Build","Share","Explore"].map((word,i)=><span key={word} data-color={i%3}>{word}</span>)}</div>
   <div className="fx-demo-strip" data-edge={edge}><ProgressiveBlur edge={edge} recipe={recipe}/><div className="fx-demo-sharp"><span>Sharp foreground</span><Button size="icon" variant="secondary" aria-label="Test foreground action" onClick={()=>setCount(n=>n+1)}><Plus/></Button></div></div>
  </div>

  <p className="sr-only" role="status">Foreground action count: {count}</p>
 </>;
}
export function EdgeFadePreview() {
 const [axis]=useExampleState<"horizontal"|"vertical">("axis", "horizontal");
 return <><div className="fx-edge-demo"><div className="fx-edge-swatches" aria-hidden="true">{["alex","blair","cam","devon","erin","frank","gale"].map(identity=><GradientAvatar key={identity} identity={identity} size={80}/>)}</div><EdgeFade axis={axis}/></div><p className="library-source">Decorative tint only. Keep required content and focus rings outside the faded edges.</p></>;
}
export function MediaScrimPreview() {
 const [saved,setSaved]=useExampleState("saved", false);
 return <><div className="fx-media-frame fx-media-demo"><div className="fx-demo-art" aria-hidden="true">{["A","B","C"].map((letter,i)=><span key={letter} data-color={i}>{letter}</span>)}</div><MediaScrim/><div className="fx-media-foreground"><h3>Keep the caption clear.</h3><p>A scrim behind the text; glass around the action.</p></div><Button className="image-action fx-demo-image-action" variant="secondary" aria-pressed={saved} aria-label={saved?"Unsave example":"Save example"} onClick={()=>setSaved(value=>!value)}><Star fill={saved?"currentColor":"none"}/></Button></div><p className="sr-only" role="status">{saved?"Example saved locally.":"Try the glass save action."}</p></>;
}
export function StateIconPreview() {
 const [active,setActive]=useExampleState("active", false);
 return <div className="library-preview-row"><Button aria-pressed={active} variant="secondary" onClick={()=>setActive(value=>!value)}><StateIcon active={active} inactiveIcon={<Play/>} activeIcon={<Pause/>} size={18}/>Toggle icon</Button><span className="sr-only" role="status">{active?"Pause icon":"Play icon"}</span></div>;
}
