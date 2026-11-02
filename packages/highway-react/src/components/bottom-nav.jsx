"use client";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { Menu } from './menu.jsx'
import Icon from '../lib/icon.jsx'
import { Button } from './ui/button'
import { popoverStyle } from '../lib/popover.js'
import { useClickOutside } from '../lib/use-click-outside.js'
import { useIsMobile } from '../lib/use-is-mobile.js'

function NavMenu({ open, onClose, triggerRef, children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => { if (open) ref.current?.querySelector('[role^="menuitem"]:not(:disabled)')?.focus() }, [open])
  return <div ref={ref} inert={!open} aria-hidden={!open} onKeyDown={event => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation() }
      onClose(); triggerRef.current?.focus()
      return
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      const items = [...(ref.current?.querySelectorAll('[role^="menuitem"]:not(:disabled)') || [])]
      if (!items.length) return
      event.preventDefault()
      const current = items.indexOf(document.activeElement)
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
        : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[next]?.focus()
    }
  }}><Menu className={className}>{children}</Menu></div>
}

/**
 * Floating bottom navigation bar with add menu, sliding indicators,
 * and chat input morph when the chat tab is active.
 */
/** @param {import('../types').BottomNavProps} props */
export function BottomNav({ tabs = [], activeTab, onTabChange, addItems = [], notifications = {}, avatarUrl, profile, profileItems = [], chatTabId = 'chat', onSendMessage, darkMode = false, onToggleDarkMode }) {
  const addTrigger = useRef(null), profileTrigger = useRef(null)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [navWidth, setNavWidth] = useState(null)
  const barRef = useRef(null)
  const chatInputRef = useRef(null)
  const tabsContainerRef = useRef(null)
  const activeIndicatorRef = useRef(null)
  const hoverIndicatorRef = useRef(null)
  const [dismissedChat, setDismissedChat] = useState(false)
  const isMobile = useIsMobile()

  const isChatMode = activeTab === chatTabId && !dismissedChat


  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return
    const prevWidth = el.style.width
    const prevTransition = el.style.transition
    el.style.transition = 'none'
    el.style.width = 'auto'
    const w = el.offsetWidth
    el.style.width = prevWidth
    void el.offsetHeight
    el.style.transition = prevTransition
    setNavWidth(w)
  }, [tabs.length, addItems.length, avatarUrl])

  useEffect(() => {
    if (isChatMode) {
      const t = setTimeout(() => chatInputRef.current?.focus(), 250)
      return () => clearTimeout(t)
    }
  }, [isChatMode])


  useClickOutside(addMenuOpen, () => setAddMenuOpen(false))
  useClickOutside(profileMenuOpen, () => setProfileMenuOpen(false))

  const getTabOffset = useCallback((idx) => idx * 48, [])

  useEffect(() => {
    const el = activeIndicatorRef.current
    if (!el) return
    const idx = tabs.findIndex(t => t.id === activeTab)
    if (idx < 0) return
    el.style.transform = `translateX(${getTabOffset(idx)}px)`
    el.style.opacity = '1'
  }, [activeTab, tabs, getTabOffset])

  useEffect(() => {
    const el = hoverIndicatorRef.current
    if (!el) return
    if (hoveredIdx === null) { el.style.opacity = '0'; return }
    el.style.transform = `translateX(${getTabOffset(hoveredIdx)}px)`
    el.style.opacity = '1'
  }, [hoveredIdx, getTabOffset])

  const handleSend = () => {
    const msg = chatInput.trim()
    if (!msg) return
    onSendMessage?.(msg)
    setChatInput('')
  }

  const chatWidth = Math.min(typeof window !== 'undefined' ? window.innerWidth - 40 : 500, 540)

  // Menu content renderers
  const renderAddMenuContent = () => (
    <>
      {addItems.map((item, i) => (
        <button
          key={i}
          type="button"
          role="menuitem" disabled={item.disabled}
          onClick={() => { setAddMenuOpen(false); addTrigger.current?.focus(); item.onAction?.() }}
          className="w-full text-left px-2 py-1.5 highway-type-body text-[var(--inv-menu-text-active)] hover:text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color,scale] duration-[var(--invariant-detail-duration)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
        >
          <Icon name={item.icon} size={18} className={item.iconColor || 'text-[var(--inv-menu-text)]'} aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </>
  )

  const renderProfileMenuContent = () => (
    <>
      {profile && (
        <>
          <div className="px-2 py-1.5">
            <div className="highway-type-body highway-weight-semibold text-[var(--inv-menu-text-active)] truncate">{profile.name}</div>
            <div className="highway-type-body-sm text-[var(--inv-menu-text)] truncate">{profile.email}</div>
          </div>
          <div className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" aria-hidden="true" />
        </>
      )}
      {/* Dark mode toggle */}
      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={darkMode}
        aria-label="Toggle dark mode"
        onClick={() => onToggleDarkMode?.()}
        className="w-full text-left px-2 py-1.5 highway-type-body text-[var(--inv-menu-text-active)] hover:text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color] duration-[var(--invariant-detail-duration)] ease-out cursor-pointer flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
      >
        <Icon name={darkMode ? 'sun' : 'moon'} size={18} className="text-[var(--inv-menu-text)]" aria-hidden="true" />
        <span className="flex-1">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        {darkMode && <Icon name="check" size={16} className="hw-menu-check" aria-hidden="true" />}
      </button>
      <div className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" aria-hidden="true" />
      {profileItems.map((item, i) => (
        <button
          key={i}
          type="button"
          role="menuitem" disabled={item.disabled}
          onClick={() => { setProfileMenuOpen(false); profileTrigger.current?.focus(); item.onAction?.() }}
          className={`w-full text-left px-2 py-1.5 highway-type-body hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color,scale] duration-[var(--invariant-detail-duration)] ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
            item.danger ? 'text-[var(--status-error)]' : 'text-[var(--inv-menu-text-active)] hover:text-[var(--inv-menu-text-active)]'
          }`}
        >
          <Icon name={item.icon} size={18} className={item.danger ? 'text-[var(--status-error)]' : 'text-[var(--inv-menu-text)]'} aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </>
  )

  return (
    <>
      {/* Progressive blur backdrop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 h-28 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--inv-bg) 30%, color-mix(in srgb, var(--inv-bg) 80%, transparent) 60%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Mobile bottom sheet menus */}
      {isMobile && (
        <>
          <div
            className="fixed bottom-[76px] left-1/2 z-50"
            style={{ width: navWidth || 'auto', transform: 'translateX(-50%)', ...popoverStyle(addMenuOpen, 'bottom center') }}
            onMouseDown={e => e.stopPropagation()}
          >
            <NavMenu open={addMenuOpen} onClose={() => setAddMenuOpen(false)} triggerRef={addTrigger} className="">{renderAddMenuContent()}</NavMenu>
          </div>

          <div
            className="fixed bottom-[76px] left-1/2 z-50"
            style={{ width: navWidth || 'auto', transform: 'translateX(-50%)', ...popoverStyle(profileMenuOpen, 'bottom center') }}
            onMouseDown={e => e.stopPropagation()}
          >
            <NavMenu open={profileMenuOpen} onClose={() => setProfileMenuOpen(false)} triggerRef={profileTrigger} className="">{renderProfileMenuContent()}</NavMenu>
          </div>
        </>
      )}

      {/* Single morphing bar */}
      <nav
        ref={barRef}
        className="fixed bottom-5 left-1/2 z-50 bg-[var(--inv-nav)] rounded-[20px]"
        style={{
          transform: 'translateX(-50%)',
          width: navWidth ? (isChatMode ? chatWidth : navWidth) : undefined,
          transition: navWidth ? 'width var(--motion-morph-duration) cubic-bezier(0.34, 1.3, 0.64, 1)' : undefined,
          boxShadow: 'var(--inv-nav-shadow)',
        }}
        aria-label="Navigation"
      >
        {/* Nav content */}
        <div
          className="flex items-center gap-1 px-2 py-2"
          style={{
            opacity: isChatMode ? 0 : 1,
            scale: isChatMode ? '0.85' : '1',
            filter: isChatMode ? 'blur(6px)' : 'blur(0px)',
            transition: isChatMode
              ? 'opacity var(--duration-fast) cubic-bezier(0.4, 0, 1, 1), scale var(--duration-fast) cubic-bezier(0.4, 0, 1, 1), filter var(--duration-fast) cubic-bezier(0.4, 0, 1, 1)'
              : 'opacity var(--duration-normal) cubic-bezier(0.2, 0, 0, 1) 0.08s, scale var(--duration-normal) cubic-bezier(0.2, 0, 0, 1) 0.08s, filter var(--duration-normal) cubic-bezier(0.2, 0, 0, 1) 0.08s',
            pointerEvents: isChatMode ? 'none' : 'auto',
          }}
          aria-hidden={isChatMode} inert={isChatMode}
        >
          {/* Add button */}
          {addItems.length > 0 && (
            <>
              <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <Button variant="default" size="icon"
                  type="button"
                  onClick={() => { navigator.vibrate?.(10); setAddMenuOpen(prev => !prev); setProfileMenuOpen(false) }}
                  style={{ "--primary": addMenuOpen ? "var(--inv-accent)" : "var(--inv-heading)", "--primary-hover": "var(--inv-accent)" }}
                  ref={addTrigger}
                  aria-label={addMenuOpen ? 'Close menu' : 'Add new'}
                  aria-expanded={addMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="relative flex items-center justify-center w-[18px] h-[18px]">
                    <span
                      className="absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-[var(--duration-normal)]"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)', opacity: addMenuOpen ? 0 : 1, scale: addMenuOpen ? '0.25' : '1', filter: addMenuOpen ? 'blur(4px)' : 'blur(0px)' }}
                    >
                      <Icon name="plus" size={20} aria-hidden="true" />
                    </span>
                    <span
                      className="transition-[opacity,filter,scale] duration-[var(--duration-normal)]"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)', opacity: addMenuOpen ? 1 : 0, scale: addMenuOpen ? '1' : '0.25', filter: addMenuOpen ? 'blur(0px)' : 'blur(4px)' }}
                    >
                      <Icon name="close" size={20} aria-hidden="true" />
                    </span>
                  </span>
                </Button>

                {/* Desktop popover menu */}
                {!isMobile && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5"
                    style={popoverStyle(addMenuOpen, 'bottom center')}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <NavMenu open={addMenuOpen} onClose={() => setAddMenuOpen(false)} triggerRef={addTrigger} className="w-52">{renderAddMenuContent()}</NavMenu>
                  </div>
                )}
              </div>
              <div className="w-px h-6 bg-[var(--inv-nav-divider)] mx-0.5" aria-hidden="true" />
            </>
          )}

          {/* Tabs */}
          <div
            ref={tabsContainerRef}
            className="relative flex items-center gap-1"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div
              ref={activeIndicatorRef}
              className="absolute top-0 left-0 w-11 h-11 rounded-xl bg-[var(--inv-accent)]/15 pointer-events-none"
              style={{ transition: 'transform var(--slider-duration) cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s', opacity: 0 }}
              aria-hidden="true"
            />
            <div
              ref={hoverIndicatorRef}
              className="absolute top-0 left-0 w-11 h-11 rounded-xl bg-[var(--inv-nav-hover-bg)] pointer-events-none"
              style={{ transition: 'transform var(--duration-normal) cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s', opacity: 0 }}
              aria-hidden="true"
            />
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab.id
              const notifCount = notifications[tab.id] || 0
              return (
                <div key={tab.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => { navigator.vibrate?.(10); onTabChange?.(tab.id); setDismissedChat(false); setAddMenuOpen(false); setProfileMenuOpen(false) }}
                    onMouseEnter={() => setHoveredIdx(isActive ? null : idx)}
                    className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-[color,scale] duration-[var(--invariant-detail-duration)] ease-out active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
                      isActive ? 'text-[var(--inv-accent)]' : 'text-[var(--inv-nav-text)] hover:text-[var(--inv-nav-text-active)]'
                    }`}
                    aria-label={`${tab.label}${notifCount > 0 ? ` (${notifCount} new)` : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon name={tab.icon} size={20} aria-hidden="true" />
                    {notifCount > 0 && !isActive && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[var(--inv-accent)] ring-2 ring-[var(--inv-nav)] animate-pulse" aria-hidden="true" />
                    )}
                  </button>
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 px-2 py-1.5 rounded-xl bg-[var(--inv-nav)] text-[var(--inv-nav-text-active)] highway-type-body highway-weight-medium whitespace-nowrap pointer-events-none"
                    style={{
                      ...popoverStyle(hoveredIdx === idx, 'bottom center'),
                      boxShadow: 'var(--inv-shadow)',
                    }}
                  >
                    {tab.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Avatar + profile menu */}
          {avatarUrl && (
            <>
              <div className="w-px h-6 bg-[var(--inv-nav-divider)] mx-0.5" aria-hidden="true" />
              <div className="relative w-11 h-11 flex-shrink-0" onMouseDown={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { navigator.vibrate?.(10); setProfileMenuOpen(prev => !prev); setAddMenuOpen(false) }}
                  className="w-11 h-11 rounded-xl overflow-hidden cursor-pointer transition-[scale,opacity] duration-[var(--invariant-detail-duration)] ease-out active:scale-[0.96] hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
                  ref={profileTrigger}
                  aria-label="Profile menu"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--inv-outline)' }}
                >
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                </button>

                {/* Desktop popover menu */}
                {!isMobile && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5"
                    style={popoverStyle(profileMenuOpen, 'bottom center')}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <NavMenu open={profileMenuOpen} onClose={() => setProfileMenuOpen(false)} triggerRef={profileTrigger} className="w-56">{renderProfileMenuContent()}</NavMenu>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Chat input layer */}
        <div
          className="absolute inset-0 flex items-center gap-2 px-2 py-2"
          style={{
            opacity: isChatMode ? 1 : 0,
            scale: isChatMode ? '1' : '0.85',
            filter: isChatMode ? 'blur(0px)' : 'blur(6px)',
            transition: isChatMode
              ? 'opacity var(--duration-normal) cubic-bezier(0.2, 0, 0, 1) 0.08s, scale var(--duration-normal) cubic-bezier(0.2, 0, 0, 1) 0.08s, filter var(--duration-normal) cubic-bezier(0.2, 0, 0, 1) 0.08s'
              : 'opacity var(--duration-fast) cubic-bezier(0.4, 0, 1, 1), scale var(--duration-fast) cubic-bezier(0.4, 0, 1, 1), filter var(--duration-fast) cubic-bezier(0.4, 0, 1, 1)',
            pointerEvents: isChatMode ? 'auto' : 'none',
          }}
          aria-hidden={!isChatMode} inert={!isChatMode}
        >
          <Button variant="ghost" size="icon"
            type="button"
            onClick={() => { navigator.vibrate?.(10); setDismissedChat(true) }}

            aria-label="Collapse chat input"
          >
            <Icon name="arrow-left" size={18} aria-hidden="true" />
          </Button>

          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            placeholder="Message your agents..."
            aria-label="Chat message"
            className="flex-1 bg-[var(--inv-nav-hover-bg)] rounded-xl px-3 h-11 highway-type-body text-[var(--inv-nav-text-active)] placeholder-[var(--inv-nav-text)] outline-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] transition-[background-color] duration-[var(--invariant-detail-duration)] min-w-0"
          />

          <Button variant="default" size="icon"
            type="button"
            onClick={handleSend}
            style={{ backgroundColor: chatInput.trim() ? "var(--inv-accent)" : "var(--inv-nav-hover-bg)", color: chatInput.trim() ? "var(--primary-foreground)" : "var(--inv-nav-text)" }}
            aria-label="Send message"
          >
            <Icon name="arrow-right" size={18} aria-hidden="true" />
          </Button>
        </div>
      </nav>
    </>
  )
}
