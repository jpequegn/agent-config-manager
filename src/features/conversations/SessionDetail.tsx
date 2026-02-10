/**
 * SessionDetail Component
 * Shows the full conversation and metadata of a selected session
 * with collapsible tool calls, code block highlighting, and scroll-to-message
 */

import { useState, useRef, useEffect } from 'react'
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
  ChevronDown,
  ChevronRight,
  ArrowUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from '@/components/shared'
import { useSelectedSession } from '@/stores'
import type { HarnessType, Message, ToolCall, FileChange } from '@/types'

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

/** Collapsible tool call block */
function ToolCallBlock({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-2 overflow-hidden rounded-md border border-border/50 bg-background/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
        <Wrench className="h-3 w-3 text-muted-foreground" />
        <span className="font-mono font-medium">{toolCall.name}</span>
        {toolCall.duration && (
          <span className="text-muted-foreground">({toolCall.duration}ms)</span>
        )}
        <span
          className={cn(
            'ml-auto rounded-full px-1.5 py-0.5 text-[10px]',
            toolCall.status === 'success'
              ? 'bg-green-500/20 text-green-400'
              : toolCall.status === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
          )}
        >
          {toolCall.status}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border/50 px-2.5 py-2 text-xs">
          {/* Input */}
          <div className="mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Input
            </span>
            <pre className="mt-1 overflow-x-auto rounded bg-muted/50 p-2 font-mono text-[11px] leading-relaxed">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          {toolCall.output && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Output
              </span>
              <pre className="mt-1 overflow-x-auto rounded bg-muted/50 p-2 font-mono text-[11px] leading-relaxed">
                {toolCall.output}
              </pre>
            </div>
          )}

          {/* Error */}
          {toolCall.error && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-red-400">
                Error
              </span>
              <pre className="mt-1 overflow-x-auto rounded bg-red-500/10 p-2 font-mono text-[11px] leading-relaxed text-red-400">
                {toolCall.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** File change block with optional diff */
function FileChangeBlock({ change }: { change: FileChange }) {
  const [showDiff, setShowDiff] = useState(false)

  return (
    <div className="mt-1 overflow-hidden rounded-md border border-border/50 bg-background/50">
      <button
        onClick={() => change.diff && setShowDiff(!showDiff)}
        className={cn(
          'flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs',
          change.diff && 'cursor-pointer transition-colors hover:bg-muted/50'
        )}
      >
        {change.diff ? (
          showDiff ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )
        ) : (
          <FileCode className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="font-mono">{change.path}</span>
        <span
          className={cn(
            'ml-auto rounded-full px-1.5 py-0.5 text-[10px]',
            change.type === 'create'
              ? 'bg-green-500/20 text-green-400'
              : change.type === 'delete'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
          )}
        >
          {change.type}
        </span>
        {(change.linesAdded || change.linesRemoved) && (
          <span className="text-muted-foreground">
            {change.linesAdded ? (
              <span className="text-green-400">+{change.linesAdded}</span>
            ) : null}
            {change.linesRemoved ? (
              <span className="ml-1 text-red-400">-{change.linesRemoved}</span>
            ) : null}
          </span>
        )}
      </button>

      {showDiff && change.diff && (
        <div className="border-t border-border/50">
          <pre className="overflow-x-auto p-2.5 font-mono text-[11px] leading-relaxed">
            {change.diff.split('\n').map((line, i) => (
              <div
                key={i}
                className={cn(
                  'px-1',
                  line.startsWith('+') && 'bg-green-500/10 text-green-400',
                  line.startsWith('-') && 'bg-red-500/10 text-red-400'
                )}
              >
                {line}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  )
}

/** Single message bubble */
function MessageBubble({
  message,
  messageRef,
}: {
  message: Message
  messageRef: (el: HTMLDivElement | null) => void
}) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <div ref={messageRef} className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
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
        <MarkdownRenderer content={message.content} compact />

        {/* Collapsible tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1">
            {message.toolCalls.map((tc) => (
              <ToolCallBlock key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {/* File changes with diffs */}
        {message.fileChanges && message.fileChanges.length > 0 && (
          <div className="space-y-1">
            {message.fileChanges.map((fc, i) => (
              <FileChangeBlock key={i} change={fc} />
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

/** Message jump bar - shows message index for quick navigation */
function MessageJumpBar({
  messages,
  onJump,
}: {
  messages: Message[]
  onJump: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-1 border-t bg-muted/30 px-4 py-2">
      <span className="mr-2 text-xs text-muted-foreground">Jump to:</span>
      {messages.map((msg, i) => (
        <button
          key={msg.id}
          onClick={() => onJump(i)}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded text-[10px] font-medium transition-colors',
            msg.role === 'user'
              ? 'bg-primary/20 text-primary hover:bg-primary/30'
              : 'bg-accent/50 text-accent-foreground hover:bg-accent'
          )}
          title={`${msg.role}: ${msg.content.slice(0, 50)}...`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}

export function SessionDetail() {
  const session = useSelectedSession()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    function handleScroll() {
      setShowScrollTop((container?.scrollTop ?? 0) > 200)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [session])

  function scrollToMessage(index: number) {
    const el = messageRefs.current.get(index)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function scrollToTop() {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <MessageSquare className="h-12 w-12" />
        <p className="text-sm">Select a session to view its conversation</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
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

      {/* Message jump bar */}
      {session.messages.length > 2 && (
        <MessageJumpBar messages={session.messages} onJump={scrollToMessage} />
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="relative flex-1 space-y-4 overflow-auto p-6">
        {session.messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            messageRef={(el) => {
              if (el) messageRefs.current.set(index, el)
              else messageRefs.current.delete(index)
            }}
          />
        ))}

        {/* Scroll to top button */}
        {showScrollTop && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 z-10 h-8 w-8 rounded-full shadow-md"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
