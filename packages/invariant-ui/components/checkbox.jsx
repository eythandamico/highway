"use client";
import Icon from '../lib/icon.jsx'

export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
}) {
  return (
    <label
      className={`inline-flex items-center gap-2.5 cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className="w-6 h-6 rounded-lg bg-[var(--inv-bg-alt)] flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-[0.9] transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-2"
      >
        <span
          className={`rounded-md flex items-center justify-center text-white ${
            checked
              ? 'w-[18px] h-[18px] bg-[var(--inv-accent)]'
              : 'w-0 h-0'
          }`}
          style={{
            transition: checked
              ? 'width 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), background-color 0.15s'
              : 'width 0.15s ease-in, height 0.15s ease-in, background-color 0.15s',
            overflow: 'hidden',
          }}
        >
          {checked && <Icon name="check" size={12} />}
        </span>
      </button>
      {label && (
        <span className="text-[15px] text-[var(--inv-heading)] select-none">{label}</span>
      )}
    </label>
  )
}
