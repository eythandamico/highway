import { CopyPage } from "../../../packages/highway-react/src/components/ui/copy-page";
import { useExampleState } from "./example-state";
export function CopyPagePreview() {
  const [showAssistants] = useExampleState("showAssistants", true);
  return <div className="library-preview-row"><CopyPage markdown={'# Example component\n\nA reusable component with quiet surfaces and clear interactions.'} showAssistants={showAssistants}/></div>;
}
