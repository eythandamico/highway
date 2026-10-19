"use client";
import { useState } from "react";
import { Plus, Star, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { StateIcon } from "@/components/ui/state-icon";
import { ProgressiveBlur, type BlurEdge } from "@/components/visual/progressive-blur";
import { EdgeFade } from "@/components/visual/edge-fade";
import { MediaScrim } from "@/components/visual/media-scrim";
import { GradientAvatar } from "@/components/visual/gradient-avatar";
import "@/components/visual/visual-guide.css";

export function ProgressiveBlurPreview() {
 const [edge,setEdge]=useState<BlurEdge>("top");
 const [recipe,setRecipe]=useState<"header"|"rail"|"panel">("header");
 const [count,setCount]=useState(0);
 return <>
  <div className="fx-demo-stage">
   <div className="fx-demo-art" aria-hidden="true">{["Make","Discover","Create","Build","Share","Explore"].map((word,i)=><span key={word} data-color={i%3}>{word}</span>)}</div>
   <div className="fx-demo-strip" data-edge={edge}><ProgressiveBlur edge={edge} recipe={recipe}/><div className="fx-demo-sharp"><span>Sharp foreground</span><Button size="icon" variant="secondary" aria-label="Test foreground action" onClick={()=>setCount(n=>n+1)}><Plus/></Button></div></div>
  </div>
  <div className="library-controls"><Label htmlFor="blur-recipe">Recipe</Label><NativeSelect id="blur-recipe" value={recipe} onChange={e=>setRecipe(e.target.value as typeof recipe)}>{["header","rail","panel"].map(value=><option key={value}>{value}</option>)}</NativeSelect><Label htmlFor="blur-edge">Strong edge</Label><NativeSelect id="blur-edge" value={edge} onChange={e=>setEdge(e.target.value as BlurEdge)}>{["top","bottom","left","right"].map(value=><option key={value}>{value}</option>)}</NativeSelect></div>
  <p className="library-source" role="status">Foreground action count: {count}</p>
 </>;
}
export function EdgeFadePreview() {
 const [axis,setAxis]=useState<"horizontal"|"vertical">("horizontal");
 return <><div className="fx-edge-demo"><div className="fx-edge-swatches" aria-hidden="true">{["alex","blair","cam","devon","erin","frank","gale"].map(identity=><GradientAvatar key={identity} identity={identity} size={80}/>)}</div><EdgeFade axis={axis}/></div><div className="library-controls"><Label htmlFor="fade-axis">Fade axis</Label><NativeSelect id="fade-axis" value={axis} onChange={e=>setAxis(e.target.value as typeof axis)}><option>horizontal</option><option>vertical</option></NativeSelect></div><p className="library-source">Decorative tint only. Keep required content and focus rings outside the faded edges.</p></>;
}
export function MediaScrimPreview() {
 const [saved,setSaved]=useState(false);
 return <><div className="fx-media-frame fx-media-demo"><div className="fx-demo-art" aria-hidden="true">{["A","B","C"].map((letter,i)=><span key={letter} data-color={i}>{letter}</span>)}</div><MediaScrim/><div className="fx-media-foreground"><h3>Keep the caption clear.</h3><p>A scrim behind the text; glass around the action.</p></div><Button className="image-action fx-demo-image-action" variant="secondary" aria-pressed={saved} aria-label={saved?"Unsave example":"Save example"} onClick={()=>setSaved(value=>!value)}><Star fill={saved?"currentColor":"none"}/></Button></div><p className="library-source" role="status">{saved?"Example saved locally.":"Try the glass save action."}</p></>;
}
export function StateIconPreview() {
 const [active,setActive]=useState(false);
 return <div className="fx-motion-example fx-elevated"><Button aria-pressed={active} variant="secondary" onClick={()=>setActive(value=>!value)}><StateIcon active={active} inactiveIcon={<Play/>} activeIcon={<Pause/>} size={18}/>Toggle icon</Button><span role="status">{active?"Pause icon":"Play icon"}</span></div>;
}
