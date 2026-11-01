"use client";
import { useExampleState } from "./example-state";
import { previewFeedback } from './feedback.js';
import { BottomNav } from '../../../packages/highway-react/src/invariant/components/bottom-nav.jsx';
import { CHAT_TABS } from './fixtures.jsx';
export function ChatNavExample() {
    const [chatTab, setChatTab] = useExampleState("chatTab", 'home');
    return (<>
          <div className="highway-viewport-demo">
            <BottomNav tabs={CHAT_TABS} activeTab={chatTab} onTabChange={setChatTab} chatTabId="chat" onSendMessage={(msg) => previewFeedback('Send:', msg)}/>
          </div>
        </>);
}
