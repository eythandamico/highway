"use client";
import { useAsyncAction } from '../lib/interaction/use-async-action'
import { LiveStatus } from './ui/live-status'
import Icon from '../lib/icon.jsx'
import { Button } from './ui/button'

/** @param {import('../types').ActionButtonProps} props */
export function ActionButton({ label = 'Save', icon, size = 'default', variant = 'default', onAction, onActionError, pendingLabel = 'Saving', successLabel = 'Saved', errorLabel = 'Could not save. Try again.', resetAfterMs = 1500, disabled = false, className = '', loadingDuration: _legacyDuration, ...props }) {
  // Kept for source compatibility; elapsed time must never manufacture success.
  void _legacyDuration
  const action = useAsyncAction(resetAfterMs)
  const isLoading = action.pending
  const isDone = action.state === 'success'
  const isIdle = !isLoading && !isDone
  const handleClick = async () => {
    if (disabled || isLoading || isDone || !onAction) return
    await action.run(async () => {
      try { await onAction() } catch (error) { onActionError?.(error); throw error }
    })
  }

  const spring = 'cubic-bezier(0.34, 1.3, 0.64, 1)'
  const contentIn = `opacity 0.2s ${spring} 0.08s, scale 0.2s ${spring} 0.08s, filter 0.2s ${spring} 0.08s`
  const contentOut = 'opacity var(--duration-fast) cubic-bezier(0.4, 0, 1, 1), scale var(--duration-fast) cubic-bezier(0.4, 0, 1, 1), filter var(--duration-fast) cubic-bezier(0.4, 0, 1, 1)'

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        type="button"
        size={size}
        variant={variant}
        onClick={handleClick}
        {...props}
        disabled={disabled}
        aria-disabled={disabled || !isIdle || undefined}
        aria-busy={isLoading || undefined}
        aria-label={label}
        iconPosition={isIdle && icon ? "start" : undefined}
        className="overflow-hidden"
        style={{
          gap: 0,
          paddingInline: isIdle ? undefined : 'calc((var(--control-height) - var(--button-icon-size) - 2px) / 2)',
          borderRadius: isIdle ? undefined : 'var(--radius-pill)',
          backgroundColor: isDone ? 'var(--inv-accent)' : undefined,
          color: isDone ? 'var(--primary-foreground)' : undefined,
          transition: `padding 0.35s ${spring}, border-radius 0.35s ${spring}, background-color var(--duration-slow) ease`,
        }}
      >
        {/* Idle — label + icon */}
        <span
          className="flex items-center gap-2 whitespace-nowrap"
          style={{
            opacity: isIdle ? 1 : 0,
            scale: isIdle ? '1' : '0.85',
            filter: isIdle ? 'blur(0px)' : 'blur(6px)',
            transition: isIdle ? contentIn : contentOut,
            width: isIdle ? 'auto' : 0,
            overflow: 'hidden',
          }}
        >
          {icon && <Icon name={icon} size={18} />}
          {label}
        </span>

        {/* Loading — spinner */}
        <span
          className="flex items-center justify-center shrink-0"
          style={{
            opacity: isLoading ? 1 : 0,
            scale: isLoading ? '1' : '0.85',
            filter: isLoading ? 'blur(0px)' : 'blur(6px)',
            transition: isLoading ? contentIn : contentOut,
            width: isLoading ? 'var(--button-icon-size)' : 0,
            height: 'var(--button-icon-size)',
            overflow: 'hidden',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" className="animate-spin">
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="24" strokeLinecap="round" />
          </svg>
        </span>

        {/* Done — check */}
        <span
          className="flex items-center justify-center shrink-0"
          style={{
            opacity: isDone ? 1 : 0,
            scale: isDone ? '1' : '0.85',
            filter: isDone ? 'blur(0px)' : 'blur(6px)',
            transition: isDone ? contentIn : contentOut,
            width: isDone ? 'var(--button-icon-size)' : 0,
            height: 'var(--button-icon-size)',
            overflow: 'hidden',
          }}
        >
          <Icon name="check" size={18} />
        </span>
      </Button>
      <LiveStatus>{isLoading ? pendingLabel : isDone ? successLabel : ''}</LiveStatus>
      {action.state === 'error' && <span role="alert" className="highway-type-body text-[var(--inv-muted)]">{errorLabel}</span>}
    </div>
  )
}
