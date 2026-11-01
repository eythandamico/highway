"use client";
import { useState } from 'react'
import Icon from '../lib/icon.jsx'
import { Button } from '../../components/ui/button'
import { AgentAvatar } from './agent-avatar.jsx'
import { ProfileAvatar } from './profile-avatar.jsx'

function ThinkingIndicator() {
  return (
    <span
      className="highway-type-body bg-clip-text"
      style={{
        backgroundImage: 'linear-gradient(90deg, var(--muted-foreground) 25%, var(--inv-border) 50%, var(--muted-foreground) 75%)',
        opacity: 0.8,
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'shimmer var(--message-shimmer-duration) ease-in-out infinite',
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
    <Button variant="ghost" size="icon-xs" className="hw-message-action"
      type="button"
      onClick={onClick}

      aria-label={label}
    >
      <Icon name={icon} size={14} />
    </Button>
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
      className={`flex gap-3 ${thinking ? 'items-center' : ''} ${isAgent ? '' : 'flex-row-reverse'} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${thinking ? '' : 'pt-0.5'}`}>
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
          className={`highway-type-body hw-message-content ${
            isAgent
              ? 'pt-1 pb-0 text-[var(--inv-heading)]'
              : 'px-4 py-2 rounded-2xl rounded-tr-md hw-message-user text-[var(--inv-heading)]'
          }`}
        >
          {isAgent && thinking ? <ThinkingIndicator /> : content}
        </div>

        {/* Actions row */}
        <div
          className={`mt-0.5 flex items-center gap-1 ${isAgent ? '' : 'flex-row-reverse'}`}
          style={{
            display: thinking ? 'none' : undefined,
            opacity: showActions ? 1 : 0,
            transition: 'opacity var(--expansion-exit-duration) ease',
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
            <span className="highway-type-caption text-[var(--inv-muted)] px-1">{timestamp}</span>
          )}
        </div>
      </div>
    </div>
  )
}
