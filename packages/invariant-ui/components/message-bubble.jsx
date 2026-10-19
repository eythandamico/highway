"use client";
import { useState } from 'react'
import Icon from '../lib/icon.jsx'
import { AgentAvatar } from './agent-avatar.jsx'
import { ProfileAvatar } from './profile-avatar.jsx'

function ThinkingIndicator() {
  return (
    <span
      className="text-[length:var(--type-body)] font-semibold bg-clip-text"
      style={{
        backgroundImage: 'linear-gradient(90deg, var(--inv-heading) 25%, var(--inv-border) 50%, var(--inv-heading) 75%)',
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'shimmer 2.5s ease-in-out infinite',
      }}
    >
      Thinking...
      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </span>
  )
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--inv-muted)] hover:text-[var(--inv-heading)] hover:bg-[var(--inv-nav-hover-bg)] transition-[color,background-color] duration-[var(--duration-fast)] cursor-pointer"
      aria-label={label}
    >
      <Icon name={icon} size={14} />
    </button>
  )
}

export function MessageBubble({
  content,
  role = 'user',
  thinking = false,
  agentName,
  avatarUrl,
  timestamp,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  onEdit,
  onRetry,
  className = '',
}) {
  const [hovered, setHovered] = useState(false)
  const isAgent = role === 'agent'
  const showActions = (isAgent || hovered) && !thinking

  return (
    <div
      className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        {isAgent ? (
          <AgentAvatar name={agentName || 'Agent'} size={32} state={thinking ? 'thinking' : 'default'} />
        ) : (
          <ProfileAvatar
            name="You"
            avatarUrl={avatarUrl || ''}
            size={32}
            rounded="full"
          />
        )}
      </div>

      {/* Content + Actions */}
      <div className={`max-w-[75%] flex flex-col ${isAgent ? '' : 'items-end'}`}>
        <div
          className={`text-[length:var(--type-body)] leading-relaxed ${
            isAgent
              ? 'py-1 text-[var(--inv-heading)]'
              : 'px-4 py-2.5 rounded-2xl rounded-tr-md bg-[var(--inv-bg-alt)] text-[var(--inv-heading)]'
          }`}
        >
          {isAgent && thinking ? <ThinkingIndicator /> : content}
        </div>

        {/* Actions row */}
        <div
          className={`mt-1 flex items-center gap-1 ${isAgent ? '' : 'flex-row-reverse'}`}
          style={{
            opacity: showActions ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: showActions ? 'auto' : 'none',
          }}
        >
          <div className="flex items-center gap-0.5">
            {isAgent ? (
              <>
                <ActionButton icon="copy" label="Copy" onClick={onCopy} />
                <ActionButton icon="thumbs-up" label="Like" onClick={onThumbsUp} />
                <ActionButton icon="thumbs-down" label="Dislike" onClick={onThumbsDown} />
              </>
            ) : (
              <>
                <ActionButton icon="edit" label="Edit" onClick={onEdit} />
                <ActionButton icon="copy" label="Copy" onClick={onCopy} />
                <ActionButton icon="repeat" label="Retry" onClick={onRetry} />
              </>
            )}
          </div>

          {timestamp && (
            <span className="text-[length:var(--type-caption)] text-[var(--inv-muted)] px-1">{timestamp}</span>
          )}
        </div>
      </div>
    </div>
  )
}
