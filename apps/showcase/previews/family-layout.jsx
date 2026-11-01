"use client";
import { useExampleState } from "./example-state";
import { ExpandCard } from '../../../packages/highway-react/src/invariant/components/expand-card.jsx';
import { SpotlightCard } from '../../../packages/highway-react/src/invariant/components/spotlight-card.jsx';
import { Card } from '../../../packages/highway-react/src/invariant/components/card.jsx';
import { SplitPane } from '../../../packages/highway-react/src/invariant/components/split-pane.jsx';
import { ComponentStage } from "./preview-helpers.jsx";
export function MorphCardExample() {
    return (<ComponentStage>
          <div className="w-[400px] flex flex-col gap-3">
            <ExpandCard title="Getting started" icon="home">
              Everything you need to set up your project and start building. Follow the quick start guide to get running in minutes.
            </ExpandCard>
            <ExpandCard title="Configuration" icon="settings">
              Customize your setup with flexible options. Adjust settings to match your workflow and preferences.
            </ExpandCard>
            <ExpandCard title="Resources" icon="folder">
              Guides, examples, and references to help you get the most out of your tools.
            </ExpandCard>
          </div>
        </ComponentStage>);
}
export function SplitPaneExample() {
    const [direction] = useExampleState("direction", "horizontal");
    return (<ComponentStage>
          <SplitPane direction={direction} height={360} className="w-[560px]" left={<div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-[var(--inv-text-lg)] font-semibold text-[var(--inv-heading)] mb-1">Editor</div>
                  <div className="text-[var(--inv-text-sm)] text-[var(--inv-muted)]">Drag the divider</div>
                </div>
              </div>} right={<div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-[var(--inv-text-lg)] font-semibold text-[var(--inv-heading)] mb-1">Preview</div>
                  <div className="text-[var(--inv-text-sm)] text-[var(--inv-muted)]">Resizable panes</div>
                </div>
              </div>}/>
        </ComponentStage>);
}
export function CardExample() {
    const [cardVariant] = useExampleState("cardVariant", 'gradient');
    return (<>
          <ComponentStage>
            <Card variant={cardVariant} gradientSeed={cardVariant === 'gradient' ? 'Project Alpha' : undefined} image={cardVariant === 'video' ? '/invariant-preview/card-video.mp4' : undefined} title="Project Alpha" description="A next-generation interface for managing autonomous agent workflows." className="w-[340px]"/>
          </ComponentStage>

        </>);
}
export function SpotlightCardExample() {
    return (<ComponentStage>
          <SpotlightCard className="w-[280px]">
            <div className="p-5">
              <div className="text-[15px] font-medium text-[var(--inv-heading)] mb-1">Analytics</div>
              <div className="text-[14px] text-[var(--inv-muted)]">Track performance metrics and user engagement in real time.</div>
            </div>
          </SpotlightCard>
        </ComponentStage>);
}
