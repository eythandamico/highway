"use client";
import { forwardRef } from 'react'
import { Button as SharedButton } from '../../../components/ui/button'
import Icon from '../lib/icon.jsx'

/** Compatibility API; geometry, motion and state belong to the shared Button. */
export const Button = forwardRef(function Button({ label, children, variant = 'primary', size = 'default', iconLeft, iconRight, loading = false, ...props }, ref) {
  return <SharedButton ref={ref} type="button" variant={({ primary: 'default', danger: 'destructive' })[variant] || variant}
    size={({ small: 'sm', large: 'lg' })[size] || size} loading={loading} {...props}>
    {iconLeft && !loading && <Icon name={iconLeft} size={18}/>}
    {label ?? children}
    {iconRight && !loading && <Icon name={iconRight} size={18}/>}
  </SharedButton>
})
