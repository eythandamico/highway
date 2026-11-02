"use client";
import { useId, forwardRef, useRef, useCallback, useEffect } from 'react'
import { Textarea as SharedTextarea } from './ui/textarea'

export const Textarea = /* @__PURE__ */ forwardRef(function Textarea({
  label,
  placeholder = '',
  value,
  onChange,
  maxLength,
  rows = 3,
  autoGrow = false,
  disabled = false,
  error,
  className = '',
  ...rest
}, ref) {
  const generatedId = useId()
  const fieldId = rest.id || generatedId
  const errorId = `${fieldId}-error`
  const innerRef = useRef(null)
  const textareaRef = innerRef
  const assignRef = useCallback(node => {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }, [ref])

  const resize = useCallback(() => {
    const el = typeof textareaRef === 'function' ? innerRef.current : textareaRef.current
    if (!el || !autoGrow) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [autoGrow, textareaRef])

  useEffect(() => { resize() }, [value, resize])

  const count = value?.length || 0

  return (
    <div className={`foundation-field ${className}`}>
      {label && (
        <label htmlFor={fieldId} className={`highway-type-body-sm highway-weight-medium ${disabled ? 'text-[var(--inv-muted)]' : 'text-[var(--inv-heading)]'}`}>{label}</label>
      )}
        <SharedTextarea
          className="hw-text-field"
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={[rest["aria-describedby"], error && errorId].filter(Boolean).join(" ") || undefined}
          ref={assignRef}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          rows={autoGrow ? 1 : rows}
          data-auto-grow={autoGrow || undefined}
          disabled={disabled}
          style={autoGrow ? { overflow: 'hidden' } : {}}
          {...rest}
        />
      {(error || maxLength) && <div className="flex items-center justify-between">
        {error && !disabled ? (
          <span id={errorId} role="alert" className="highway-type-body-sm text-[var(--status-error)]">{error}</span>
        ) : <span />}
        {maxLength && (
          <span className={`highway-type-caption ${count > maxLength * 0.9 ? 'text-[var(--status-error)]' : 'text-[var(--inv-muted)]'}`}>
            {count}/{maxLength}
          </span>
        )}
      </div>}
    </div>
  )
})
