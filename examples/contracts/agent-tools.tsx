import { VoiceRecorder, type VoiceRecording } from '../../packages/highway-react/src/components/ui/agent-tools';
export function AgentToolsExample({attach}:{attach:(audio:VoiceRecording)=>Promise<void>}){
 return <VoiceRecorder onAttach={attach}/>;
}
