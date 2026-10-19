import Link from "next/link";
import { EffectsGallery } from "@/components/visual/effects-gallery";
export const metadata={title:"Visual effects guide",robots:{index:false,follow:false}};
export default function Page(){return <div className="page"><Link href="/components">Back to components</Link><header className="page-heading" style={{marginTop:24}}><div><h1>Visual effects guide</h1><p className="muted">The visual layer from Playground, extracted into reusable recipes.</p></div></header><EffectsGallery/></div>;}
