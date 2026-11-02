"use client";
import { useId } from 'react'
import { Checkbox as SharedCheckbox } from './ui/checkbox'
export function Checkbox({ checked = false, onChange, label, disabled = false, className = '', id, ...props }) {
  const generatedId = useId()
  const fieldId = id || generatedId
  return <div className={`ui-choice-field hw-choice-field ${className}`}>
    <SharedCheckbox {...props} className="hw-checkbox" id={fieldId} checked={checked} onCheckedChange={onChange} disabled={disabled}/>
    {label && <label htmlFor={fieldId}>{label}</label>}
  </div>
}
