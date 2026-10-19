"use client";
import { useId } from 'react'
import { RadioGroup as SharedRadioGroup, RadioGroupItem } from '../../../components/ui/radio-group'
export function RadioGroup({ options = [], value, onChange, label, direction = 'vertical', disabled = false, className = '', ...props }) {
  const id = useId()
  return <fieldset className={`foundation-field ${className}`}>
    {label && <legend id={`${id}-label`}>{label}</legend>}
    <SharedRadioGroup {...props} aria-labelledby={label ? `${id}-label` : props['aria-labelledby']} value={value} onValueChange={onChange}
      orientation={direction} disabled={disabled} className={direction === 'horizontal' ? 'flex flex-wrap gap-4' : 'grid gap-2'}>
      {options.map((option, index) => <div key={option.id} className="ui-choice-field">
        <RadioGroupItem id={`${id}-${index}`} value={option.id} disabled={disabled || option.disabled}/>
        <label htmlFor={`${id}-${index}`}>{option.label}</label>
      </div>)}
    </SharedRadioGroup>
  </fieldset>
}
