"use client";
import { useState, useCallback } from 'react'
import Icon from '../lib/icon.jsx'

export function Table({
  columns = [],
  data = [],
  footer,
  caption,
  selectable = false,
  onSelectionChange,
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState(new Set())
  const [hoveredRow, setHoveredRow] = useState(null)

  const handleSort = useCallback((key) => {
    if (!key) return
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey])

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  const toggleRow = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      onSelectionChange?.(Array.from(next))
      return next
    })
  }, [onSelectionChange])

  const toggleAll = useCallback(() => {
    if (selected.size === data.length) {
      setSelected(new Set())
      onSelectionChange?.([])
    } else {
      const all = new Set(data.map((_, i) => i))
      setSelected(all)
      onSelectionChange?.(Array.from(all))
    }
  }, [data, selected.size, onSelectionChange])

  const allSelected = data.length > 0 && selected.size === data.length

  return (
    <div className={`${className}`}>
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--inv-border)] bg-[var(--inv-bg-alt)]">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                      allSelected ? 'bg-[var(--inv-accent)] text-white' : 'bg-[var(--inv-surface)]'
                    }`}
                    style={{ boxShadow: allSelected ? undefined : 'var(--inv-shadow-sm)' }}
                  >
                    {allSelected && <Icon name="check" size={12} />}
                  </button>
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`text-left px-5 py-3 text-[14px] font-medium text-[var(--inv-heading)] ${
                    col.sortable !== false ? 'cursor-pointer select-none' : ''
                  } ${col.align === 'right' ? 'text-right' : ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <Icon
                        name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'}
                        size={12}
                        className="text-[var(--inv-heading)]"
                        style={{
                          animation: 'inv-table-sort 0.2s cubic-bezier(0.34, 1.3, 0.64, 1)',
                        }}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const isSelected = selected.has(i)
              const isHovered = hoveredRow === i
              return (
                <tr
                  key={i}
                  className="border-b border-[var(--inv-border)]"
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {selectable && (
                    <td className="w-12 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleRow(i)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-[0.9] ${
                          isSelected ? 'bg-[var(--inv-accent)] text-white' : 'bg-[var(--inv-surface)]'
                        }`}
                        style={{ boxShadow: isSelected ? undefined : 'var(--inv-shadow-sm)' }}
                      >
                        {isSelected && <Icon name="check" size={12} />}
                      </button>
                    </td>
                  )}
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-5 py-4 text-[14px] text-[var(--inv-heading)] ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
          {footer && (
            <tfoot>
              <tr>
                {footer.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-5 py-4 text-[14px] font-medium text-[var(--inv-heading)] ${
                      columns[i]?.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {caption && (
        <p className="text-[13px] text-[var(--inv-muted)] mt-3 text-center">{caption}</p>
      )}
      <style>{`
        @keyframes inv-table-sort {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
