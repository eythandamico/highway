"use client";
import { useState, useRef, useLayoutEffect } from 'react'
import Icon from '../lib/icon.jsx'
import { Checkbox } from './ui/checkbox'
import { toggleSelection } from '../lib/interaction/selection'
import { LiveStatus } from './ui/live-status'
import { useReducedMotion } from '../lib/use-reduced-motion.js'

/**
 * @template {Record<string, unknown>} T
 * @param {import('../types').TableProps<T>} props
 */
export function Table({ columns = [], data = [], footer, caption, selectable = false, onSelectionChange, rowKey, selectedKeys, defaultSelectedKeys = [], onSelectedKeysChange, sort, onSortChange, className = '' }) {
  const reducedMotion = useReducedMotion()
  const root = useRef(null)
  const positions = useRef(new Map())
  const targets = useRef(new Map())
  const frame = useRef(0)
  const previousLayout = useRef(null)
  const staggerUntil = useRef(new Map())
  const [width, setWidth] = useState(Infinity)
  const collapsed = columns.filter((col, index) => index > 0 && col.collapseBelow && width < col.collapseBelow)
  const visibleColumns = columns.filter(col => !collapsed.includes(col))
  const renderValue = (col, row, key) => <span className="hw-table-value" data-table-motion={JSON.stringify([key, col.key])}>{col.render ? col.render(row[col.key], row, { width, collapsed: collapsed.includes(col) }) : row[col.key]}</span>
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    if (root.current) observer.observe(root.current)
    return () => observer.disconnect()
  }, [])
  useLayoutEffect(() => () => cancelAnimationFrame(frame.current), [])
  useLayoutEffect(() => {
    const nodes = [...(root.current?.querySelectorAll('[data-table-motion]') ?? [])]
    const origin = root.current?.getBoundingClientRect()
    if (!origin) return
    const layout = collapsed.map(col => col.key).join('|')
    const changedLayout = previousLayout.current !== null && previousLayout.current !== layout
    previousLayout.current = layout
    // Layout-effect measurement runs after commit, not during render.
    // eslint-disable-next-line react-hooks/purity
    const now = performance.now()
    if (changedLayout) {
      staggerUntil.current.clear()
      nodes.forEach(node => {
        const rowIndex = Number(node.closest('[data-table-row]')?.getAttribute('data-table-row') ?? 0)
        staggerUntil.current.set(node.dataset.tableMotion, now + Math.min(rowIndex * 18, 100))
      })
    }
    const nextTargets = new Map()
    nodes.forEach(node => {
      const key = node.dataset.tableMotion
      const rect = node.getBoundingClientRect()
      const transform = getComputedStyle(node).transform
      const matrix = transform === 'none' ? null : new DOMMatrixReadOnly(transform)
      const target = { left: rect.left - origin.left - (matrix?.m41 ?? 0), top: rect.top - origin.top - (matrix?.m42 ?? 0) }
      const oldTarget = targets.current.get(key)
      nextTargets.set(key, target)
      // Keep an in-flight animation when a resize observer causes another render.
      // Interrupt from the last painted position, never from the previous destination.
      if (oldTarget && Math.abs(oldTarget.left - target.left) + Math.abs(oldTarget.top - target.top) < .5 && !reducedMotion) return
      const previous = positions.current.get(key)
      node.getAnimations().forEach(animation => animation.cancel())
      if (previous && !reducedMotion) {
        const x = previous.left - target.left, y = previous.top - target.top
        if (Math.abs(x) + Math.abs(y) > .5) node.animate([
          { transform: `translate(${x}px, ${y}px)` },
          { transform: 'translate(0, 0)' }
        ], { duration: 360, delay: Math.max(0, (staggerUntil.current.get(key) ?? 0) - now), fill: 'backwards', easing: 'cubic-bezier(.22,1,.36,1)' })
      }
    })
    targets.current = nextTargets
    cancelAnimationFrame(frame.current)
    const capture = () => {
      const bounds = root.current?.getBoundingClientRect()
      if (!bounds) return
      const next = new Map()
      let moving = false
      nodes.forEach(node => {
        const rect = node.getBoundingClientRect()
        next.set(node.dataset.tableMotion, { left: rect.left - bounds.left, top: rect.top - bounds.top })
        moving ||= node.getAnimations().some(animation => animation.playState === 'running')
      })
      positions.current = next
      if (moving) frame.current = requestAnimationFrame(capture)
    }
    capture()
  })
  const [keyboardSort, setKeyboardSort] = useState(false)
  const [localSort, setLocalSort] = useState(/** @type {{ key: string; direction: 'asc' | 'desc' } | null} */(null))
  const [localSelection, setLocalSelection] = useState(defaultSelectedKeys)
  const selection = selectedKeys ?? localSelection
  const currentSort = sort === undefined ? localSort : sort
  // Original indices remain the legacy callback's contract; new hosts should pass rowKey.
  const records = data.map((row, index) => ({ row, index, key: typeof rowKey === 'function' ? rowKey(row) : rowKey ? row[rowKey] : typeof row.id === 'string' || typeof row.id === 'number' ? row.id : index }))
  const selected = new Set(selection)
  const available = records.map(record => record.key)
  const visibleCount = available.filter(key => selected.has(key)).length
  const updateSelection = (next) => {
    if (selectedKeys === undefined) setLocalSelection(next)
    onSelectedKeysChange?.(next)
    onSelectionChange?.(records.filter(record => next.includes(record.key)).map(record => record.index))
  }
  const handleSort = (key) => {
    const next = { key, direction: /** @type {'asc' | 'desc'} */(currentSort?.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc') }
    if (sort === undefined) setLocalSort(next)
    onSortChange?.(next)
  }
  const sorted = currentSort ? [...records].sort((a, b) => {
    const av = a.row[currentSort.key], bv = b.row[currentSort.key]
    const comparison = av == null ? (bv == null ? 0 : -1) : bv == null ? 1 : typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
    return currentSort.direction === 'asc' ? comparison : -comparison
  }) : records
  return <div ref={root} data-responsive={columns.some(col => col.collapseBelow) || undefined} className={`hw-responsive-table ${className}`}>
    <div className="hw-table-scroll">
      <table className="highway-table w-full border-collapse">
        {caption && <caption className="highway-type-body-sm text-center text-[var(--inv-muted)]" style={{ captionSide: 'bottom', paddingTop: 'var(--space-3)' }}>{caption}</caption>}
        <thead><tr className="border-b border-[var(--inv-border)] bg-[var(--inv-bg-alt)]">
          {selectable && <th scope="col" className="px-4 py-3"><Checkbox aria-label="Select all rows" disabled={!records.length} checked={visibleCount === records.length && records.length > 0 ? true : visibleCount > 0 ? 'indeterminate' : false} onCheckedChange={() => updateSelection(visibleCount === records.length ? selection.filter(key => !available.includes(key)) : [...new Set([...selection, ...available])])}/></th>}
          {visibleColumns.map(col => <th key={col.key} scope="col" aria-sort={currentSort?.key === col.key ? currentSort.direction === 'asc' ? 'ascending' : 'descending' : col.sortable !== false ? 'none' : undefined} className={`px-5 py-3 highway-type-body-sm highway-weight-medium text-[var(--inv-heading)] ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
            <span className="hw-table-value" data-table-motion={`header:${col.key}`}>{col.sortable === false ? col.label : <button type="button" onClick={event => { setKeyboardSort(event.detail === 0); handleSort(col.key) }} className="inline-flex min-h-11 items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--inv-accent)]">
              {col.label}{currentSort?.key === col.key && <Icon key={currentSort.direction} name={currentSort.direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={12} style={{ animation: reducedMotion || keyboardSort ? 'none' : 'inv-table-sort var(--duration-normal) cubic-bezier(0.34, 1.3, 0.64, 1)' }}/>}</button>}</span>
          </th>)}
        </tr></thead>
        <tbody>{sorted.length ? sorted.map(({ row, key, index }, rowIndex) => <tr key={key} data-table-row={rowIndex} className="border-b border-[var(--inv-border)]" data-selected={selected.has(key) || undefined}>
          {selectable && <td className="px-4 py-3"><Checkbox aria-label={`Select row ${index + 1}`} checked={selected.has(key)} onCheckedChange={() => updateSelection(toggleSelection(selection, key))}/></td>}
          {visibleColumns.map((col, columnIndex) => <td key={col.key} className={`px-5 py-4 highway-type-body-sm text-[var(--inv-heading)] ${col.align === 'right' ? 'text-right' : ''}`}><div className="hw-table-cell">{renderValue(col, row, key)}{columnIndex === 0 && collapsed.map(detail => <span key={detail.key} className="hw-table-detail"><span className="sr-only">{detail.label}: </span>{renderValue(detail, row, key)}</span>)}</div></td>)}
        </tr>) : <tr><td colSpan={Math.max(1, visibleColumns.length + Number(selectable))}>No rows to show.</td></tr>}</tbody>
        {footer && <tfoot><tr>{selectable && <td/>}{footer.map((cell, index) => !collapsed.includes(columns[index]) && <td key={index} className={`px-5 py-4 highway-type-body-sm highway-weight-medium ${columns[index]?.align === 'right' ? 'text-right' : ''}`}>{cell}{index === 0 && collapsed.map(col => <span className="hw-table-detail" key={col.key}> {footer[columns.indexOf(col)]}</span>)}</td>)}</tr></tfoot>}
      </table>
    </div>
    <style>{`@keyframes inv-table-sort { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    <LiveStatus>{selectable ? `${visibleCount} rows selected. ` : ''}{currentSort ? `Sorted ${currentSort.direction === 'asc' ? 'ascending' : 'descending'}.` : ''}</LiveStatus>
  </div>
}
