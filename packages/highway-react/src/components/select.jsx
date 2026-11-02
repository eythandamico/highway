"use client";
import { useId } from 'react'
import { Select as Root, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'

/** @param {import('../types').SelectProps} props */
export function Select({ label, options = [], value, onChange, placeholder = 'Select...', className = '', disabled, name, required }) {
  const id = useId()
  return <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label htmlFor={id} className="highway-type-body-sm highway-weight-medium text-[var(--inv-heading)]">{label}</label>}
    <Root value={value} onValueChange={onChange} disabled={disabled} name={name} required={required}>
      <SelectTrigger id={id} className="w-full hw-text-field hw-select-field" aria-label={label ? undefined : placeholder}>
        <SelectValue placeholder={placeholder}/>
      </SelectTrigger>
      <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
        {options.map(option => <SelectItem key={option.id} value={option.id} disabled={option.disabled} textValue={option.textValue}>{option.label}</SelectItem>)}
      </SelectContent>
    </Root>
  </div>
}
