"use client";
import { useExampleState } from "./example-state";
import { previewFeedback } from './feedback.js';
import { ActionButton } from '../../../packages/highway-react/src/components/action-button.jsx';
import { Dropdown } from '../../../packages/highway-react/src/components/dropdown.jsx';
import { Button } from '../../../packages/highway-react/src/components/button.jsx';
import { IconButton } from '../../../packages/highway-react/src/components/icon-button.jsx';
import { ComponentStage } from "./preview-helpers.jsx";
export function DropdownExample() {
    const [dropdownDir] = useExampleState("dropdownDir", 'bottom');
    const [dropdownAlign] = useExampleState("dropdownAlign", 'start');
    const vertical = dropdownDir === "top" || dropdownDir === "bottom";
    const alignment = dropdownAlign === "center" ? "center" : dropdownAlign === "start" ? (vertical ? "left" : "top") : (vertical ? "right" : "bottom");
    return (<>
          <ComponentStage>
            <Dropdown placement={`${dropdownDir}-${alignment}`} items={[
            { label: 'Edit', icon: 'edit', onAction: () => previewFeedback('Edit') },
            { label: 'Duplicate', icon: 'copy', onAction: () => previewFeedback('Duplicate') },
            { label: 'Share', icon: 'external-link', onAction: () => previewFeedback('Share') },
            { divider: true },
            { label: 'Delete', icon: 'close', danger: true, onAction: () => previewFeedback('Delete') },
        ]}/>
          </ComponentStage>

        </>);
}
export function ButtonExample() {
    const [btnVariant] = useExampleState("btnVariant", 'primary');
    const [btnSize] = useExampleState("btnSize", 'default');
    const [btnIcon] = useExampleState("btnIcon", 'none');
    const [btnLoading] = useExampleState("btnLoading", false);
    const [btnDisabled] = useExampleState("btnDisabled", false);
    return (<>
          <ComponentStage>
            <Button label="Button" variant={btnVariant} size={btnSize} iconLeft={btnIcon === 'left' || btnIcon === 'both' ? 'plus' : undefined} iconRight={btnIcon === 'right' || btnIcon === 'both' ? 'arrow-right' : undefined} loading={btnLoading} disabled={btnDisabled}/>
          </ComponentStage>

        </>);
}
export function IconButtonExample() {
    return (<ComponentStage>
          <div className="flex items-center gap-2">
            <IconButton icon="plus" label="Add" elevated/>
            <IconButton icon="edit" label="Edit" elevated/>
            <IconButton icon="upload" label="Upload" elevated/>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <IconButton icon="close" label="Close" size="small"/>
            <IconButton icon="settings" label="Settings" size="small"/>
            <IconButton icon="search" label="Search" size="small"/>
          </div>
        </ComponentStage>);
}
export function MorphButtonExample() {
    const [size] = useExampleState("size", "default");
    const [variant] = useExampleState("variant", "default");
    return (<ComponentStage>
          <ActionButton size={size} variant={variant} label="Save" icon="check" onAction={() => new Promise(resolve => setTimeout(resolve, 900))}/>
        </ComponentStage>);
}
