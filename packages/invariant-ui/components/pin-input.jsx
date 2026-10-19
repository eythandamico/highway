"use client";
import { useState, useRef, useCallback } from 'react'

export function PinInput({
  length = 6,
  value = '',
  onChange,
  error,
  disabled = false,
  className = '',
}) {
  const inputs = useRef([])
  const [focused, setFocused] = useState(false)

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  const focusAt = useCallback((i) => {
    const el = inputs.current[i]
    if (el) { el.focus(); el.select() }
  }, [])

  const update = useCallback((newDigits) => {
    onChange?.(newDigits.join(''))
  }, [onChange])

  const handleInput = useCallback((i, e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return
    const newDigits = [...digits]
    newDigits[i] = val[val.length - 1]
    update(newDigits)
    if (i < length - 1) focusAt(i + 1)
  }, [digits, length, focusAt, update])

  const handleKeyDown = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newDigits = [...digits]
      if (digits[i]) {
        newDigits[i] = ''
        update(newDigits)
      } else if (i > 0) {
        newDigits[i - 1] = ''
        update(newDigits)
        focusAt(i - 1)
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focusAt(i - 1)
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      focusAt(i + 1)
    }
  }, [digits, length, focusAt, update])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const newDigits = pasted.split('').concat(Array(length).fill('')).slice(0, length)
    update(newDigits)
    focusAt(Math.min(pasted.length, length - 1))
  }, [length, focusAt, update])

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            aria-label={`Digit ${i + 1} of ${length}`}
            ref={(el) => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={disabled}
            onInput={(e) => handleInput(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-11 h-13 text-center text-[length:var(--type-subheading)] font-semibold text-[var(--inv-heading)] bg-[var(--inv-surface)] rounded-xl outline-none transition-[box-shadow] duration-[var(--duration-fast)] ${
              disabled
                ? 'opacity-40 pointer-events-none [box-shadow:var(--inv-shadow-sm)]'
                : error
                  ? '[box-shadow:var(--inv-shadow-sm),0_0_0_2px_#ef4444]'
                  : '[box-shadow:var(--inv-shadow-sm)] focus:[box-shadow:var(--inv-shadow-sm-hover),0_0_0_2px_var(--inv-accent)]'
            }`}
          />
        ))}
      </div>
      {error && !disabled && (
        <span className="text-[length:var(--type-secondary)] text-[var(--status-error)]">{error}</span>
      )}
    </div>
  )
}
