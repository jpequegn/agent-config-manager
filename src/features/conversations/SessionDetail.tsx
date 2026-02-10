/**
 * SessionDetail Component
 * Shows the full conversation and metadata of a selected session
 */

import {
  MessageSquare,
  Calendar,
  Clock,
  Tag,
  Folder,
  User,
  Bot,
  Wrench,
  FileCode,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSelectedSession } from '@/stores'
import type { HarnessType, Message } from '@/types'

/** Harness badge colors */
const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-teal-500/20 text-teal-400',
  aider: 'bg-amber-500/20 text-amber-400',
}

/** Format duration from ms */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/** Single message bubble */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : isSystem
              ? 'bg-muted text-muted-foreground'
              : 'bg-accent text-accent-foreground'
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((tc) => (
              <div
                key={tc.id}
                className="flex items-center gap-1.5 rounded bg-background/50 px-2 py-1 text-xs"
              >
                <Wrench className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono">{tc.name}</span>
                {tc.duration && <span className="text-muted-foreground">({tc.duration}ms)</span>}
                <span
                  className={cn(
                    'ml-auto rounded-full px-1.5 py-0.5 text-[10px]',
                    tc.status === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : tc.status === 'error'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  )}
                >
                  {tc.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* File changes */}
        {message.fileChanges && message.fileChanges.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.fileChanges.map((fc, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded bg-background/50 px-2 py-1 text-xs"
              >
                <FileCode className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono">{fc.path}</span>
                <span
                  className={cn(
                    'ml-auto rounded-full px-1.5 py-0.5 text-[10px]',
                    fc.type === 'create'
                      ? 'bg-green-500/20 text-green-400'
                      : fc.type === 'delete'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                  )}
                >
                  {fc.type}
                </span>
                {(fc.linesAdded || fc.linesRemoved) && (
                  <span className="text-muted-foreground">
                    {fc.linesAdded ? `+${fc.linesAdded}` : ''}
                    {fc.linesRemoved ? ` -${fc.linesRemoved}` : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <span className="mt-1 block text-[10px] text-muted-foreground/60">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

export function SessionDetail() {
  const session = useSelectedSession()

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <MessageSquare className="h-12 w-12" />
        <p className="text-sm">Select a session to view its conversation</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold leading-snug">{session.metadata.title}</h2>
          {session.isActive && (
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-400">
              Active
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              HARNESS_COLORS[session.harness]
            )}
          >
            {session.harness}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {session.startedAt.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(session.stats.duration)}
          </span>
          <span>{session.stats.messageCount} messages</span>
          {session.stats.toolCallCount > 0 && (
            <span className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              {session.stats.toolCallCount} tool calls
            </span>
          )}
          {session.stats.fileChangeCount > 0 && (
            <span className="flex items-center gap-1">
              <FileCode className="h-3 w-3" />
              {session.stats.fileChangeCount} file changes
            </span>
          )}
          {session.metadata.project && (
            <span className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              {session.metadata.project}
            </span>
          )}
        </div>

        {/* Tags */}
        {session.metadata.tags && session.metadata.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {session.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 p-6">
        {session.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  )
}
