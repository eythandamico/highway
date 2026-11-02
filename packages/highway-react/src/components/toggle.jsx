"use client";
import { Switch } from './ui/switch'
/** Legacy Toggle API delegates keyboard, disabled and form behavior to Switch. */
export function Toggle({ checked = false, onChange, size = 'default', ...props }) {
  return <Switch checked={checked} onCheckedChange={onChange} size={size === 'small' ? 'sm' : 'default'} {...props}/>
}
