"use client";
export function StepIndicator({ steps = 5, activeStep = 0, onStepChange, variant = 'default', className = '' }) {
  const isDark = variant === 'dark'
  const isLight = variant === 'light'

  const isDots = variant === 'dots' || variant === 'dots-light'
  const isDotsLight = variant === 'dots-light'

  const getColor = (isActive, isCompleted) => {
    if (isDotsLight) return '#ffffff'
    if (isDots) return 'var(--inv-heading)'
    if (isLight) return '#ffffff'
    if (isDark) return 'var(--inv-heading)'
    return isActive ? 'var(--inv-accent)' : isCompleted ? 'var(--inv-heading)' : 'var(--inv-border)'
  }

  const getOpacity = (isActive, isCompleted) => {
    if (isDots || isDotsLight) return isActive ? 1 : 0.35
    if (isLight) return isActive ? 1 : 0.4
    if (isDark) return isActive ? 1 : 0.3
    return isCompleted ? 0.35 : 1
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: steps }, (_, i) => {
        const isActive = i === activeStep
        const isCompleted = i < activeStep
        return (
          <button
            key={i}
            type="button"
            onClick={() => onStepChange?.(i)}
            className="hw-step-target cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-2 rounded-full"
            aria-label={`Step ${i + 1}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <div
              className="h-2.5 rounded-full"
              style={{
                width: (isDots || isDotsLight) ? 10 : (isActive ? 36 : 10),
                backgroundColor: getColor(isActive, isCompleted),
                opacity: getOpacity(isActive, isCompleted),
                transition: 'width var(--step-duration) cubic-bezier(0.34, 1.3, 0.64, 1), background-color var(--motion-soft-duration) ease, opacity var(--motion-soft-duration) ease',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
