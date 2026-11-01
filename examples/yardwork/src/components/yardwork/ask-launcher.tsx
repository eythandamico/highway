"use client";
import {type MouseEventHandler} from 'react';
import {AskBar} from '../../../../../packages/highway-react/src/components/ui/ask-bar';
import {useOffice} from './context';
import './ask-launcher.css';

export default function AskLauncher({open,onOpen}:{open:boolean;onOpen:MouseEventHandler<HTMLButtonElement>}) {
 const {state,mutate,busy}=useOffice();
 return <AskBar messages={state.chat} disabled={busy} hidden={open} floating compactOnScroll label="Ask Yardwork" onOpen={onOpen} onSend={async text=>{await mutate('ask',{id:crypto.randomUUID(),text});}}/>;
}
