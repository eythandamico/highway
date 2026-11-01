"use client";
import { useExampleState } from "./example-state";
import { previewFeedback } from './feedback.js';
import { BottomNav } from '../../../packages/highway-react/src/invariant/components/bottom-nav.jsx';
import { WorkspaceSwitcher } from '../../../packages/highway-react/src/invariant/components/workspace-switcher.jsx';
import { ProfileMenu } from '../../../packages/highway-react/src/invariant/components/profile-menu.jsx';
import { SearchBar } from '../../../packages/highway-react/src/invariant/components/search-bar.jsx';
import { SegmentedControl } from '../../../packages/highway-react/src/invariant/components/segmented-control.jsx';
import { Tabs } from '../../../packages/highway-react/src/invariant/components/tabs.jsx';
import { TABS, STARTUPS } from './fixtures.jsx';
import { PROFILE, PROFILE_ITEMS, ComponentStage } from "./preview-helpers.jsx";
export function BottomNavExample({ darkMode, toggleDarkMode }) {
    const [activeTab, setActiveTab] = useExampleState("activeTab", 'home');
    const addItems = [
        { label: 'New Objective', icon: 'bullseye-arrow', onAction: () => previewFeedback('New Objective') },
        { label: 'Upload File', icon: 'upload', onAction: () => previewFeedback('Upload File') },
        { label: 'Invite Agent', icon: 'robot', onAction: () => previewFeedback('Invite Agent') },
        { label: 'Post a Role', icon: 'target', onAction: () => previewFeedback('Post Role') },
    ];
    return (<>
          <div className="highway-viewport-demo">
            <BottomNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} addItems={addItems} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} chatTabId="chat" onSendMessage={(msg) => previewFeedback('Send:', msg)}/>
          </div>
        </>);
}
export function ProfileExample() {
    const [profileDir] = useExampleState("profileDir", 'bottom');
    const [profileAlign] = useExampleState("profileAlign", 'end');
    return (<>
            <ComponentStage>
              <ProfileMenu avatarUrl="/invariant-preview/avatar.svg" profile={PROFILE} profileItems={PROFILE_ITEMS} placement={`${profileDir}-${profileAlign === "center" ? "center" : (profileDir === "top" || profileDir === "bottom") ? (profileAlign === "start" ? "left" : "right") : (profileAlign === "start" ? "top" : "bottom")}`}/>
            </ComponentStage>

          </>);
}
export function StartupExample() {
    const [currentSlug, setCurrentSlug] = useExampleState("currentSlug", 'acme-ai-labs');
    const currentStartup = STARTUPS.find(s => s.slug === currentSlug);
    return (<ComponentStage>
          <WorkspaceSwitcher currentStartup={currentStartup} startups={STARTUPS} onStartupChange={setCurrentSlug}/>
        </ComponentStage>);
}
export function SearchExample() {
    return <ComponentStage><div style={{ width:360, maxWidth:'100%' }}><SearchBar placeholder="Search…"/></div></ComponentStage>;
}
export function SegmentedTabsExample() {
    const [tabDemo, setTabDemo] = useExampleState("tabDemo", 'all');
    const [segVariant] = useExampleState("segVariant", 'subdued');
    return (<>
          <ComponentStage>
            <SegmentedControl tabs={[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'archived', label: 'Archived' },
        ]} activeTab={tabDemo} onTabChange={setTabDemo} variant={segVariant}/>
          </ComponentStage>

        </>);
}
export function TabsExample() {
    const [activeTabDemo, setActiveTabDemo] = useExampleState("activeTabDemo", 'all');
    return (<ComponentStage>
          <Tabs tabs={[
            { id: 'all', label: 'All', count: 24 },
            { id: 'active', label: 'Active', count: 12 },
            { id: 'archived', label: 'Archived', count: 3 },
        ]} activeTab={activeTabDemo} onTabChange={setActiveTabDemo}/>
        </ComponentStage>);
}
