import Office from "../../src/components/yardwork/office";
import { demoSuite } from "../../src/lib/yardwork/demo-suite";
export const metadata = { title: "Yardwork demo" };
export default function Page() { return <Office demo initialNow={new Date().toISOString()} initial={{ state: demoSuite(), revision: 0 }}/>; }
