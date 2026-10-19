"use client";
export function RadioGroup({
  options = [],
  value,
  onChange,
  label,
  direction = 'vertical',
  disabled = false,
  className = '',
}) {
  return (
    <fieldset className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <legend className={`text-[13px] font-medium ${disabled ? 'text-[var(--inv-muted)]' : 'text-[var(--inv-heading)]'}`}>{label}</legend>
      )}
      <div className={`flex ${direction === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
        {options.map((opt) => {
          const isSelected = value === opt.id
          return (
            <label
              key={opt.id}
              className={`inline-flex items-center gap-2.5 cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onChange?.(opt.id)}
                className="w-6 h-6 rounded-full bg-[var(--inv-bg-alt)] flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-[0.9] transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-2"
              >
                <span
                  className={`rounded-full ${
                    isSelected
                      ? 'w-3.5 h-3.5 bg-[var(--inv-accent)]'
                      : 'w-0 h-0'
                  }`}
                  style={{
                    transition: isSelected
                      ? 'width 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), background-color 0.15s'
                      : 'width 0.15s ease-in, height 0.15s ease-in, background-color 0.15s',
                  }}
                />
              </button>
              <span className={`text-[15px] select-none transition-colors duration-150 ${
                isSelected ? 'text-[var(--inv-heading)]' : 'text-[var(--inv-muted)]'
              }`}>{opt.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
