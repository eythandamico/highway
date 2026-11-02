"use client";
import { useId, forwardRef } from 'react'
import { Input } from './ui/input'
import Icon from '../lib/icon.jsx'
export const TextInput = /* @__PURE__ */ forwardRef(function TextInput({ label, className = '', error, disabled = false, icon, id, ...rest }, ref) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const describedBy = [rest['aria-describedby'], error && `${fieldId}-error`].filter(Boolean).join(' ') || undefined
  return <div className={`foundation-field ${className}`}>
    {label && <label htmlFor={fieldId} className="highway-type-body-sm highway-weight-medium">{label}</label>}
    <div className="ui-labelled-input">
      {icon && <span aria-hidden="true"><Icon name={icon} size={18}/></span>}
      <Input {...rest} className="hw-text-field" ref={ref} id={fieldId} disabled={disabled} aria-invalid={!!error || rest['aria-invalid']} aria-describedby={describedBy}/>
    </div>
    {error && <span id={`${fieldId}-error`} role="alert" className="ui-field-error">{error}</span>}
  </div>
})
