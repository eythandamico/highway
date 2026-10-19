"use client";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import Icon from '../lib/icon.jsx'
import { popoverStyle, menuShadow } from '../lib/popover.js'
import { useClickOutside } from '../lib/use-click-outside.js'
import { useIsMobile } from '../lib/use-is-mobile.js'

/**
 * Floating bottom navigation bar with add menu, sliding indicators,
 * and chat input morph when the chat tab is active.
 */
export function BottomNav({ tabs = [], activeTab, onTabChange, addItems = [], notifications = {}, avatarUrl, profile, profileItems = [], chatTabId = 'chat', onSendMessage, darkMode = false, onToggleDarkMode }) {
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
          role="menuitem"
          onClick={() => { setAddMenuOpen(false); item.onAction?.() }}
          className="w-full text-left px-2 py-1.5 text-[15px] text-[var(--inv-menu-text-active)] hover:text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
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
            <div className="text-[15px] font-semibold text-[var(--inv-menu-text-active)] truncate">{profile.name}</div>
            <div className="text-[13px] text-[var(--inv-menu-text)] truncate">{profile.email}</div>
          </div>
          <div className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" aria-hidden="true" />
        </>
      )}
      {/* Dark mode toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={darkMode}
        aria-label="Toggle dark mode"
        onClick={() => onToggleDarkMode?.()}
        className="w-full text-left px-2 py-1.5 text-[15px] text-[var(--inv-menu-text-active)] hover:text-[var(--inv-menu-text-active)] hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color] duration-150 ease-out cursor-pointer flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
      >
        <Icon name={darkMode ? 'sun' : 'moon'} size={18} className="text-[var(--inv-menu-text)]" aria-hidden="true" />
        <span className="flex-1">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        <span className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${darkMode ? 'bg-[var(--inv-accent)]' : 'bg-[var(--inv-menu-hover-bg)]'}`} aria-hidden="true">
          <span className={`absolute top-[3px] left-[3px] w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${darkMode ? 'translate-x-[14px]' : ''}`} />
        </span>
      </button>
      <div className="border-t border-[var(--inv-menu-divider)] mx-2.5 my-1" aria-hidden="true" />
      {profileItems.map((item, i) => (
        <button
          key={i}
          type="button"
          role="menuitem"
          onClick={() => { setProfileMenuOpen(false); item.onAction?.() }}
          className={`w-full text-left px-2 py-1.5 text-[15px] hover:bg-[var(--inv-menu-hover-bg)] rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
            item.danger ? 'text-red-400 hover:text-red-300' : 'text-[var(--inv-menu-text-active)] hover:text-[var(--inv-menu-text-active)]'
          }`}
        >
          <Icon name={item.icon} size={18} className={item.danger ? 'text-red-400' : 'text-[var(--inv-menu-text)]'} aria-hidden="true" />
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
            <div className="rounded-[20px] bg-[var(--inv-menu-bg)]/90 backdrop-blur-xl py-2 px-2" role="menu" style={menuShadow}>
              {renderAddMenuContent()}
            </div>
          </div>

          <div
            className="fixed bottom-[76px] left-1/2 z-50"
            style={{ width: navWidth || 'auto', transform: 'translateX(-50%)', ...popoverStyle(profileMenuOpen, 'bottom center') }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="rounded-[20px] bg-[var(--inv-menu-bg)]/90 backdrop-blur-xl py-2 px-2" role="menu" style={menuShadow}>
              {renderProfileMenuContent()}
            </div>
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
          transition: navWidth ? 'width 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)' : undefined,
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
              ? 'opacity 0.12s cubic-bezier(0.4, 0, 1, 1), scale 0.12s cubic-bezier(0.4, 0, 1, 1), filter 0.12s cubic-bezier(0.4, 0, 1, 1)'
              : 'opacity 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s, scale 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s, filter 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s',
            pointerEvents: isChatMode ? 'none' : 'auto',
          }}
          aria-hidden={isChatMode}
        >
          {/* Add button */}
          {addItems.length > 0 && (
            <>
              <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { navigator.vibrate?.(10); setAddMenuOpen(prev => !prev); setProfileMenuOpen(false) }}
                  className={`flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-[background-color,color,scale] duration-200 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
                    addMenuOpen
                      ? 'bg-[var(--inv-accent)] text-white'
                      : 'bg-[var(--inv-heading)] text-[var(--inv-bg)] hover:bg-[var(--inv-accent)] hover:text-white'
                  }`}
                  aria-label={addMenuOpen ? 'Close menu' : 'Add new'}
                  aria-expanded={addMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="relative flex items-center justify-center w-[18px] h-[18px]">
                    <span
                      className="absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-200"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)', opacity: addMenuOpen ? 0 : 1, scale: addMenuOpen ? '0.25' : '1', filter: addMenuOpen ? 'blur(4px)' : 'blur(0px)' }}
                    >
                      <Icon name="plus" size={20} aria-hidden="true" />
                    </span>
                    <span
                      className="transition-[opacity,filter,scale] duration-200"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)', opacity: addMenuOpen ? 1 : 0, scale: addMenuOpen ? '1' : '0.25', filter: addMenuOpen ? 'blur(0px)' : 'blur(4px)' }}
                    >
                      <Icon name="close" size={20} aria-hidden="true" />
                    </span>
                  </span>
                </button>

                {/* Desktop popover menu */}
                {!isMobile && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5"
                    style={popoverStyle(addMenuOpen, 'bottom center')}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <div className="rounded-[20px] bg-[var(--inv-menu-bg)]/90 backdrop-blur-xl py-2 px-2 w-52" role="menu" style={menuShadow}>
                      {renderAddMenuContent()}
                    </div>
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
              style={{ transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s', opacity: 0 }}
              aria-hidden="true"
            />
            <div
              ref={hoverIndicatorRef}
              className="absolute top-0 left-0 w-11 h-11 rounded-xl bg-[var(--inv-nav-hover-bg)] pointer-events-none"
              style={{ transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s', opacity: 0 }}
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
                    className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-[color,scale] duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
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
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 px-2 py-1.5 rounded-xl bg-[var(--inv-nav)] text-[var(--inv-nav-text-active)] text-[15px] font-medium whitespace-nowrap pointer-events-none"
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
                  className="w-11 h-11 rounded-xl overflow-hidden cursor-pointer transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
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
                    <div className="rounded-[20px] bg-[var(--inv-menu-bg)]/90 backdrop-blur-xl py-2 px-2 w-56" role="menu" style={menuShadow}>
                      {renderProfileMenuContent()}
                    </div>
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
              ? 'opacity 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s, scale 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s, filter 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s'
              : 'opacity 0.12s cubic-bezier(0.4, 0, 1, 1), scale 0.12s cubic-bezier(0.4, 0, 1, 1), filter 0.12s cubic-bezier(0.4, 0, 1, 1)',
            pointerEvents: isChatMode ? 'auto' : 'none',
          }}
          aria-hidden={!isChatMode}
        >
          <button
            type="button"
            onClick={() => { navigator.vibrate?.(10); setDismissedChat(true) }}
            className="flex items-center justify-center w-11 h-11 rounded-xl text-[var(--inv-nav-text)] hover:text-[var(--inv-nav-text-active)] hover:bg-[var(--inv-nav-hover-bg)] transition-[color,background-color,scale] duration-150 ease-out cursor-pointer active:scale-[0.96] flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1"
            aria-label="Collapse chat input"
          >
            <Icon name="arrow-left" size={18} aria-hidden="true" />
          </button>

          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            placeholder="Message your agents..."
            aria-label="Chat message"
            className="flex-1 bg-[var(--inv-nav-hover-bg)] rounded-xl px-3 h-11 text-[15px] text-[var(--inv-nav-text-active)] placeholder-[var(--inv-nav-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] transition-[background-color] duration-150 min-w-0"
          />

          <button
            type="button"
            onClick={handleSend}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-[background-color,color,scale] duration-150 ease-out cursor-pointer active:scale-[0.96] flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--inv-accent)] focus-visible:ring-offset-1 ${
              chatInput.trim()
                ? 'bg-[var(--inv-accent)] text-white'
                : 'bg-[var(--inv-nav-hover-bg)] text-[var(--inv-nav-text)]'
            }`}
            aria-label="Send message"
          >
            <Icon name="arrow-right" size={18} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </>
  )
}
