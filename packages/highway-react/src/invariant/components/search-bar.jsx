"use client";
import { useRef, useState, useImperativeHandle } from 'react'
import { ExpandableSearch } from './expandable-search.jsx'
import Icon from '../lib/icon.jsx'
import { Button } from '../../components/ui/button'

/** @param {import('../types').SearchBarProps} props */
export function SearchBar({ placeholder = 'Search…', shortcutKey = '', className = '', onSearch, autoFocus = false, expandable = false, value, inputRef, 'aria-label': ariaLabel }) {
  const [localQuery, setQuery] = useState('')
  const query = value ?? localQuery
  const input = useRef(null)
  useImperativeHandle(inputRef, () => input.current)
  const update = value => { setQuery(value); onSearch?.(value) }
  const clear = () => { update(''); input.current?.focus() }
  if (expandable) return <ExpandableSearch placeholder={placeholder} shortcutKey={shortcutKey} onSearch={onSearch} className={className}/>
  return (
    <div className={`hw-search-bar ${className}`}>
      <Icon name="search" size={18} className="hw-search-icon" />
      <input
        ref={input}
        type="search"
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        value={query}
        onChange={event => update(event.target.value)}
        onKeyDown={event => { if (event.key === 'Escape' && query) { event.preventDefault(); event.stopPropagation(); clear() } }}
        className="hw-search-input highway-type-body"
        autoFocus={autoFocus}
      />
      {query ? <Button static variant="ghost" size="icon-xs" className="hw-search-clear" aria-label="Clear search" onClick={clear}><Icon name="close"/></Button> : shortcutKey ? <kbd className="hw-search-shortcut highway-type-caption">{shortcutKey}</kbd> : null}
    </div>
  )
}
