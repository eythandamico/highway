import {
  Dropdown,
  NumberInput,
  Progress,
  Select,
  SliderInput,
  Tabs,
} from "@highway/react";

// Valid minimal usage should not require runtime-optional bounds or error props.
export const minimalPackageControls = (
  <>
    <NumberInput label="Count" value={1} onChange={(value: number) => void value} />
    <SliderInput label="Level" value={5} onChange={(value: number) => void value} />
    <Progress value={5} max={10} />
    <Tabs tabs={[{ id: "overview", label: "Overview" }]} activeTab="overview" onTabChange={(id: string) => void id} />
    <Select label="Status" options={[{ id: "open", label: "Open" }]} value="open" onChange={(id: string) => void id} />
    <Dropdown items={[{ label: "Open", onAction: () => undefined }]} />
  </>
);

export const invalidPackageControls = (
  <>
    {/* @ts-expect-error NumberInput callbacks receive numeric values. */}
    <NumberInput label="Count" value={1} onChange={(value: string) => void value} />
    {/* @ts-expect-error SliderInput callbacks receive numeric values. */}
    <SliderInput label="Level" value={5} onChange={(value: string) => void value} />
    {/* @ts-expect-error Each tab needs a string label. */}
    <Tabs tabs={[{ id: "overview" }]} activeTab="overview" />
    {/* @ts-expect-error Menu item labels must be renderable React content. */}
    <Dropdown items={[{ label: { unexpected: true }, onAction: () => undefined }]} />
    {/* @ts-expect-error Select options require a string id. */}
    <Select options={[{ id: 1, label: "Open" }]} value="open" />
    {/* @ts-expect-error Select callbacks receive string ids. */}
    <Select options={[{ id: "open", label: "Open" }]} onChange={(id: number) => void id} />
  </>
);
