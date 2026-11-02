"use client";
import Icon from '../lib/icon.jsx'
import { Button } from './ui/button'

/** Legacy icon-name API; styling and behavior are owned by Button. */
export function IconButton({ icon, label, size = 'default', elevated = false, onClick, className = '', ...rest }) {
  return <Button type="button" variant={elevated ? 'secondary' : 'ghost'} size={size === 'small' ? 'icon-sm' : 'icon'} onClick={onClick} className={className} aria-label={label} {...rest}>
    <Icon name={icon} size={16}/>
  </Button>
}
