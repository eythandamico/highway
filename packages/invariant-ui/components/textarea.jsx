"use client";
import { useId, forwardRef, useRef, useCallback, useEffect } from 'react'

export const Textarea = forwardRef(function Textarea({
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
  const textareaRef = ref || innerRef

  const resize = useCallback(() => {
    const el = typeof textareaRef === 'function' ? innerRef.current : textareaRef.current
    if (!el || !autoGrow) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [autoGrow, textareaRef])

  useEffect(() => { resize() }, [value, resize])

  const count = value?.length || 0

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className={`text-[13px] font-medium ${disabled ? 'text-[var(--inv-muted)]' : 'text-[var(--inv-heading)]'}`}>{label}</label>
      )}
      <div
        className={`rounded-xl bg-[var(--inv-surface)] transition-[box-shadow] duration-150 ${
          disabled
            ? 'opacity-40 pointer-events-none [box-shadow:var(--inv-shadow-sm)]'
            : error
              ? '[box-shadow:var(--inv-shadow-sm),0_0_0_2px_#ef4444]'
              : '[box-shadow:var(--inv-shadow-sm)] has-[:focus-visible]:[box-shadow:var(--inv-shadow-sm-hover),0_0_0_2px_var(--inv-accent)]'
        }`}
      >
        <textarea
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : rest["aria-describedby"]}
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          rows={autoGrow ? 1 : rows}
          disabled={disabled}
          className="w-full px-3 py-2.5 bg-transparent text-[15px] text-[var(--inv-heading)] placeholder-[var(--inv-muted)] outline-none resize-none"
          style={autoGrow ? { overflow: 'hidden' } : {}}
          {...rest}
        />
      </div>
      <div className="flex items-center justify-between">
        {error && !disabled ? (
          <span id={errorId} role="alert" className="text-[13px] text-red-400">{error}</span>
        ) : <span />}
        {maxLength && (
          <span className={`text-[11px] ${count > maxLength * 0.9 ? 'text-red-400' : 'text-[var(--inv-muted)]'}`}>
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
})
