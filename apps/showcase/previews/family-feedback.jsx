"use client";
import { useExampleState } from "./example-state";
import { StepIndicator } from '../../../packages/highway-react/src/invariant/components/step-indicator.jsx';
import { Badge } from '../../../packages/highway-react/src/invariant/components/badge.jsx';
import { Alert } from '../../../packages/highway-react/src/invariant/components/alert.jsx';
import { Progress } from '../../../packages/highway-react/src/invariant/components/progress.jsx';
import { ComponentStage, ToastDemo } from "./preview-helpers.jsx";
export function StepIndicatorExample() {
    const [stepVariant] = useExampleState("stepVariant", "default");
    const [activeStep, setActiveStep] = useExampleState("activeStep", 0);
    return (<>
          <ComponentStage>
            <div className="p-4 rounded-2xl" style={{ background: stepVariant === "light" || stepVariant === "dots-light" ? "var(--inv-heading)" : undefined }}><StepIndicator variant={stepVariant} steps={5} activeStep={activeStep} onStepChange={setActiveStep}/></div>
          </ComponentStage>


        </>);
}
export function BadgeExample() {
    return (<ComponentStage>
          <div className="flex items-center gap-2">
            <Badge label="Active" variant="dark"/>
            <Badge label="Pending" variant="subdued"/>
            <Badge label="v2.1.0" variant="outline"/>
          </div>
        </ComponentStage>);
}
export function ToastExample() {
    return <ToastDemo />;
}
export function ProgressExample() {
    const [progressValue] = useExampleState("progressValue", 65);
    return (<>
          <ComponentStage>
            <div className="w-[360px] flex flex-col gap-6">
              <Progress value={progressValue} label="Upload" showValue/>
              <Progress value={progressValue} size="small"/>
              <Progress value={100} label="Complete" size="large"/>
            </div>
          </ComponentStage>

        </>);
}
export function AlertExample() {
    return (<ComponentStage>
          <div className="w-[420px] flex flex-col gap-3">
            <Alert variant="info" title="New update available" description="Version 2.1 includes performance improvements and bug fixes." dismissible/>
            <Alert variant="success" title="Deployment complete" description="Your changes are now live."/>
            <Alert variant="warning" title="Rate limit" description="You're approaching your API quota."/>
            <Alert variant="error" title="Build failed" description="Check the logs for details." dismissible/>
          </div>
        </ComponentStage>);
}
