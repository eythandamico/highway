import Office from "@/components/yardwork/office";
import { demoSuite } from "@/lib/yardwork/demo-suite";
export const metadata = { title: "Yardwork demo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function DemoPage() {
  return <Office demo initialNow={new Date().toISOString()} initial={{ state: demoSuite(), revision: 0 }}/>;
}
