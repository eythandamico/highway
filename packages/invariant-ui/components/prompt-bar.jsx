"use client";
import { useState, useRef, useEffect, useCallback } from 'react'
import Icon from '../lib/icon.jsx'
import { popoverStyle, menuShadow } from '../lib/popover.js'
import { useClickOutside } from '../lib/use-click-outside.js'

function VoiceVisualizer({ active }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const barsRef = useRef(Array.from({ length: 100 }, (_, i) => (Math.sin(i * 12.9898) + 1) * 0.15))

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animRef.current)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const draw = (time) => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const bars = barsRef.current
      const barCount = bars.length
      const barWidth = rect.width / barCount
      const centerY = rect.height / 2

      const style = getComputedStyle(document.documentElement)
      const color = style.getPropertyValue('--inv-muted').trim() || '#767270'

      for (let i = 0; i < barCount; i++) {
        // Simulate voice-like waveform — center bars are louder, edges quieter
        const centerBias = 1 - Math.abs((i / barCount) - 0.5) * 1.4
        const wave1 = Math.sin(time * 0.004 + i * 0.3) * 0.3
        const wave2 = Math.sin(time * 0.0067 + i * 1.1) * 0.15
        const wave3 = Math.sin(time * 0.0023 + i * 0.7) * 0.2
        const burst = Math.max(0, Math.sin(time * 0.002 + i * 0.15)) * 0.25
        const noise = (Math.random() - 0.5) * 0.06
        const target = (0.08 + wave1 + wave2 + wave3 + burst + noise) * centerBias
        bars[i] += (Math.max(0.03, target) - bars[i]) * 0.08

        const barHeight = bars[i] * rect.height * 0.85
        const x = i * barWidth + barWidth * 0.35
        const w = barWidth * 0.3
        const radius = w / 2

        ctx.beginPath()
        ctx.roundRect(x, centerY - barHeight / 2, w, barHeight, radius)
        ctx.fillStyle = color
        ctx.globalAlpha = 0.5 + bars[i] * 0.5
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  )
}

export function PromptBar({
  placeholder = 'Ask anything...',
  models = [],
  activeModel,
  onModelChange,
  onSubmit,
  onUpload,
  onMicPress,
  className = '',
}) {
  const [value, setValue] = useState('')
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const textareaRef = useRef(null)

  useClickOutside(modelMenuOpen, () => setModelMenuOpen(false))

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSubmit?.(value.trim())
        setValue('')
      }
    }
  }

  const handleMicToggle = () => {
    setRecording(prev => !prev)
    onMicPress?.()
  }

  const currentModel = models.find(m => m.id === activeModel) || models[0]
  const hasValue = value.trim().length > 0

  return (
    <div className={`w-full rounded-2xl bg-[var(--inv-surface)] ${className}`} style={{ boxShadow: 'var(--inv-shadow-sm)' }}>
      {/* Textarea / Voice visualizer */}
      <div className="px-4 pt-3 relative" style={{ minHeight: 64 }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="w-full bg-transparent text-[length:var(--type-body)] text-[var(--inv-heading)] placeholder-[var(--inv-muted)] outline-none resize-none leading-relaxed"
          style={{
            opacity: recording ? 0 : 1,
            pointerEvents: recording ? 'none' : 'auto',
            transition: 'opacity 0.2s ease',
          }}
        />
        <div
          className="absolute inset-0 flex items-center px-4"
          style={{
            opacity: recording ? 1 : 0,
            pointerEvents: recording ? 'auto' : 'none',
            transition: 'opacity 0.25s ease',
          }}
        >
          <VoiceVisualizer active={recording} />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <div className="flex items-center gap-1">
          {/* Upload */}
          <button
            type="button"
            onClick={onUpload}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--inv-muted)] hover:text-[var(--inv-heading)] hover:bg-[var(--inv-nav-hover-bg)] transition-[color,background-color] duration-[var(--duration-fast)] cursor-pointer"
            aria-label="Upload file"
          >
            <Icon name="plus" size={18} />
          </button>

          {/* Model selector */}
          {models.length > 0 && (
            <div className="relative" onMouseDown={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setModelMenuOpen(prev => !prev)}
                className="h-9 px-2.5 flex items-center gap-1.5 rounded-full text-[length:var(--type-secondary)] text-[var(--inv-muted)] hover:text-[var(--inv-heading)] hover:bg-[var(--inv-nav-hover-bg)] transition-[color,background-color] duration-[var(--duration-fast)] cursor-pointer"
                aria-label="Select model"
                aria-expanded={modelMenuOpen}
                aria-haspopup="true"
              >
                {currentModel?.icon && <Icon name={currentModel.icon} size={16} />}
                {currentModel?.label}
                <Icon name="chevrons-vertical" size={12} />
              </button>

              <div
                className="absolute bottom-full left-0 mb-2"
                style={popoverStyle(modelMenuOpen, 'bottom left')}
                onMouseDown={e => e.stopPropagation()}
              >
                <div className="rounded-[20px] bg-[var(--inv-menu-bg)] py-2 px-2 w-52" role="menu" style={menuShadow}>
                  {models.map(model => (
                    <button
                      key={model.id}
                      type="button"
                      role="menuitem"
                      onClick={() => { setModelMenuOpen(false); onModelChange?.(model.id) }}
                      className={`w-full text-left px-2 py-1.5 text-[length:var(--type-body)] rounded-xl transition-[color,background-color] duration-[var(--duration-fast)] ease-out cursor-pointer flex items-center gap-2 ${
                        model.id === activeModel
                          ? 'text-[var(--inv-menu-text-active)] font-medium bg-[var(--inv-menu-hover-bg)]'
                          : 'text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)]'
                      }`}
                    >
                      {model.icon && <Icon name={model.icon} size={18} className="text-[var(--inv-menu-text)]" />}
                      <div className="flex flex-col">
                        <span>{model.label}</span>
                        {model.description && <span className="text-[length:var(--type-caption)] text-[var(--inv-menu-text)]">{model.description}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Mic */}
          <button
            type="button"
            onClick={handleMicToggle}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-[color,background-color] duration-[var(--duration-fast)] cursor-pointer ${
              recording
                ? 'bg-red-500 text-white'
                : 'text-[var(--inv-muted)] hover:text-[var(--inv-heading)] hover:bg-[var(--inv-nav-hover-bg)]'
            }`}
            aria-label={recording ? 'Stop recording' : 'Voice input'}
          >
            <Icon name={recording ? 'close' : 'mic'} size={18} />
          </button>

          {/* Send */}
          <button
            type="button"
            onClick={() => {
              if (hasValue) {
                onSubmit?.(value.trim())
                setValue('')
              }
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-[color,background-color,scale] duration-[var(--duration-normal)] ease-out cursor-pointer active:scale-[0.96] ${
              hasValue
                ? 'bg-[var(--inv-accent)] text-white'
                : 'bg-[var(--inv-border)] text-[var(--inv-muted)]'
            }`}
            aria-label="Send"
          >
            <Icon name="arrow-right" size={18} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
