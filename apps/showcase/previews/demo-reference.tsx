"use client";
import { useExampleState } from "./example-state";
import { OfficeNavigation } from "../../../examples/yardwork/src/components/yardwork/office-navigation";
import BookingsChart from "../../../examples/yardwork/src/components/yardwork/bookings-chart";
import { demoSuite } from "../../../examples/yardwork/src/lib/yardwork/demo-suite";
import "../../../packages/highway-react/src/components/visual/visual-effects.css";
import "../../../examples/yardwork/src/components/yardwork/yardwork.css";

export function NavigationPreview(){const [view,setView]=useExampleState<"today"|"schedule"|"customers"|"money">("view", "today");return <div className="yw-app"><OfficeNavigation current={view} onNavigate={setView}/><p className="sr-only" role="status">Selected: {view}</p></div>;}

export function ChartPreview(){const [sample]=useExampleState("sample", demoSuite);return <div className="yw-app"><BookingsChart jobs={sample.jobs}/></div>;}
