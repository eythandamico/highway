"use client";
import { useExampleState } from "./example-state";
import { AgentAvatar } from '../../../packages/highway-react/src/components/agent-avatar.jsx';
import { ProfileAvatar, ProfileAvatarGroup } from '../../../packages/highway-react/src/components/profile-avatar.jsx';
import { ComponentStage } from "./preview-helpers.jsx";
export function ProfileAvatarExample() {
    const [avatarRounded] = useExampleState("avatarRounded", 'xl');
    const [avatarAlert] = useExampleState("avatarAlert", false);
    const [avatarView] = useExampleState("avatarView", 'single');
    return (<>
          <ComponentStage>
            {avatarView === 'single' ? (<ProfileAvatar name="Eythan D'Amico" avatarUrl="/invariant-preview/avatar.svg" size={40} rounded={avatarRounded} alert={avatarAlert}/>) : (<ProfileAvatarGroup max={avatarAlert ? 5 : 3} size={40} rounded={avatarRounded} avatars={[
                { name: 'Eythan', avatarUrl: '/invariant-preview/avatar.svg' },
                { name: 'Sarah', avatarUrl: '/invariant-preview/avatar.svg' },
                { name: 'James', avatarUrl: '/invariant-preview/avatar.svg' },
                { name: 'Maria', avatarUrl: '/invariant-preview/avatar.svg' },
                { name: 'Alex', avatarUrl: '/invariant-preview/avatar.svg', alert: avatarAlert },
            ]}/>)}
          </ComponentStage>

        </>);
}
export function AgentAvatarExample() {
    const [avatarState] = useExampleState("avatarState", 'default');
    const [avatarSize] = useExampleState("avatarSize", 80);
    return <ComponentStage><AgentAvatar name="Nova" size={avatarSize} state={avatarState}/></ComponentStage>;
}
