"use client";
import { useExampleState } from "./example-state";
import { TextInput } from '../../../packages/highway-react/src/components/text-input.jsx';
import { Select } from '../../../packages/highway-react/src/components/select.jsx';
import { Toggle } from '../../../packages/highway-react/src/components/toggle.jsx';
import { PinInput } from '../../../packages/highway-react/src/components/pin-input.jsx';
import { NumberInput } from '../../../packages/highway-react/src/components/number-input.jsx';
import { Textarea } from '../../../packages/highway-react/src/components/textarea.jsx';
import { Checkbox } from '../../../packages/highway-react/src/components/checkbox.jsx';
import { RadioGroup } from '../../../packages/highway-react/src/components/radio-group.jsx';
import { SliderInput } from '../../../packages/highway-react/src/components/slider-input.jsx';
import { ComponentStage } from "./preview-helpers.jsx";
export function SelectExample() {
    const [disabled] = useExampleState("disabled", false);
    const [selectValue, setSelectValue] = useExampleState("selectValue", null);
    return (<ComponentStage>
          <div className="w-[280px]">
            <Select disabled={disabled} label="Model" placeholder="Choose a model..." options={[
            { id: 'sonnet', label: 'Sonnet 4' },
            { id: 'opus', label: 'Opus 4' },
            { id: 'haiku', label: 'Haiku 4' },
            { id: 'gpt4o', label: 'GPT-4o' },
            { id: 'gemini', label: 'Gemini 2.5 Pro' },
        ]} value={selectValue} onChange={setSelectValue}/>
          </div>
        </ComponentStage>);
}
export function TextInputExample() {
    const [inputState] = useExampleState("inputState", 'default');
    const [inputIcon] = useExampleState("inputIcon", false);
    return (<>
          <ComponentStage>
            <div className="w-[360px]">
              <TextInput label="Email" placeholder="you@example.com" disabled={inputState === 'disabled'} error={inputState === 'error' ? 'Invalid email address' : undefined} autoFocus={inputState === 'focus'} icon={inputIcon ? 'mail' : undefined}/>
            </div>
          </ComponentStage>

        </>);
}
export function TextareaExample() {
    const [error] = useExampleState("error", false);
    const [disabled] = useExampleState("disabled", false);
    const [textareaValue, setTextareaValue] = useExampleState("textareaValue", '');
    return (<ComponentStage>
          <div className="w-[360px]">
            <Textarea error={error ? "Check this value" : undefined} disabled={disabled} label="Bio" placeholder="Tell us about yourself..." value={textareaValue} onChange={(e) => setTextareaValue(e.target.value)} maxLength={280} rows={5}/>
          </div>
        </ComponentStage>);
}
export function NumberInputExample() {
    const [error] = useExampleState("error", false);
    const [disabled] = useExampleState("disabled", false);
    const [numberValue, setNumberValue] = useExampleState("numberValue", 5);
    return (<ComponentStage>
          <NumberInput error={error ? "Check this value" : undefined} disabled={disabled} value={numberValue} onChange={setNumberValue} min={0} max={99}/>
        </ComponentStage>);
}
export function PinInputExample() {
    const [error] = useExampleState("error", false);
    const [disabled] = useExampleState("disabled", false);
    const [pinValue, setPinValue] = useExampleState("pinValue", '');
    return (<ComponentStage>
          <PinInput error={error ? "Check this value" : undefined} disabled={disabled} value={pinValue} onChange={setPinValue}/>
        </ComponentStage>);
}
export function CheckboxExample() {
    const [checkboxA, setCheckboxA] = useExampleState("checkboxA", false);
    const [checkboxB, setCheckboxB] = useExampleState("checkboxB", true);
    return (<ComponentStage>
          <div className="flex flex-col gap-3">
            <Checkbox checked={checkboxA} onChange={setCheckboxA} label="I agree to the terms"/>
            <Checkbox checked={checkboxB} onChange={setCheckboxB} label="Send me updates"/>
            <Checkbox disabled label="Locked by policy"/>
          </div>
        </ComponentStage>);
}
export function RadioGroupExample() {
    const [direction] = useExampleState("direction", "vertical");
    const [disabled] = useExampleState("disabled", false);
    const [radioValue, setRadioValue] = useExampleState("radioValue", 'pro');
    return (<ComponentStage>
          <RadioGroup direction={direction} disabled={disabled} options={[
            { id: 'free', label: 'Free' },
            { id: 'pro', label: 'Pro' },
            { id: 'team', label: 'Team' },
        ]} value={radioValue} onChange={setRadioValue}/>
        </ComponentStage>);
}
export function SliderInputExample() {
    const [disabled] = useExampleState("disabled", false);
    const [sliderValue, setSliderValue] = useExampleState("sliderValue", 40);
    return (<ComponentStage>
          <div className="w-[360px]">
            <SliderInput disabled={disabled} label="Volume" value={sliderValue} onChange={setSliderValue} min={0} max={100} suffix="%"/>
          </div>
        </ComponentStage>);
}
export function ToggleExample() {
    const [disabled] = useExampleState("disabled", false);
    const [size] = useExampleState("toggleSize", "default");
    const [toggleOn, setToggleOn] = useExampleState("toggleOn", false);
    return <ComponentStage><Toggle disabled={disabled} checked={toggleOn} onChange={setToggleOn} size={size}/></ComponentStage>;
}
