/**
 * Session Types
 * Types for conversation sessions and messages
 */

import type { HarnessType } from './harness'

/** Message role in conversation */
export type MessageRole = 'user' | 'assistant' | 'system'

/** Tool call status */
export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error'

/** File change type */
export type FileChangeType = 'create' | 'modify' | 'delete' | 'rename'

/** File change in a session */
export interface FileChange {
  /** Type of change */
  type: FileChangeType
  /** File path */
  path: string
  /** Previous path (for renames) */
  previousPath?: string
  /** Diff content */
  diff?: string
  /** Number of lines added */
  linesAdded?: number
  /** Number of lines removed */
  linesRemoved?: number
}

/** Tool call within a message */
export interface ToolCall {
  /** Unique tool call ID */
  id: string
  /** Tool name */
  name: string
  /** Tool input/parameters */
  input: Record<string, unknown>
  /** Tool output/result */
  output?: string
  /** Execution status */
  status: ToolCallStatus
  /** Execution duration in ms */
  duration?: number
  /** Error message if status is 'error' */
  error?: string
  /** Timestamp when tool was called */
  timestamp: Date
}

/** Message in a conversation */
export interface Message {
  /** Unique message ID */
  id: string
  /** Message role */
  role: MessageRole
  /** Message content (text) */
  content: string
  /** Tool calls made in this message */
  toolCalls?: ToolCall[]
  /** File changes made in this message */
  fileChanges?: FileChange[]
  /** Timestamp */
  timestamp: Date
  /** Token count (if available) */
  tokenCount?: number
}

/** Session metadata */
export interface SessionMetadata {
  /** Session title (auto-generated or custom) */
  title: string
  /** Project name/path this session is associated with */
  project?: string
  /** Project directory path */
  projectPath?: string
  /** Tags for organization */
  tags?: string[]
  /** Custom notes */
  notes?: string
}

/** Session statistics */
export interface SessionStats {
  /** Total message count */
  messageCount: number
  /** User message count */
  userMessageCount: number
  /** Assistant message count */
  assistantMessageCount: number
  /** Total tool calls */
  toolCallCount: number
  /** Total file changes */
  fileChangeCount: number
  /** Total tokens used */
  totalTokens?: number
  /** Session duration in ms */
  duration: number
}

/** Complete session definition */
export interface Session {
  /** Unique session ID */
  id: string
  /** Harness this session belongs to */
  harness: HarnessType
  /** Session metadata */
  metadata: SessionMetadata
  /** All messages in the session */
  messages: Message[]
  /** Session statistics */
  stats: SessionStats
  /** Session start timestamp */
  startedAt: Date
  /** Session end timestamp (if completed) */
  endedAt?: Date
  /** Whether session is currently active */
  isActive: boolean
  /** File path where session is stored */
  filePath?: string
}

/** Session summary for list views */
export interface SessionSummary {
  /** Unique session ID */
  id: string
  /** Harness this session belongs to */
  harness: HarnessType
  /** Session title */
  title: string
  /** Project name */
  project?: string
  /** Start timestamp */
  startedAt: Date
  /** End timestamp */
  endedAt?: Date
  /** Duration in ms */
  duration: number
  /** Message count */
  messageCount: number
  /** Preview of last message */
  lastMessagePreview?: string
  /** Tags */
  tags?: string[]
}

/** Options for filtering sessions */
export interface SessionFilterOptions {
  /** Filter by harness */
  harness?: HarnessType | HarnessType[]
  /** Filter by project */
  project?: string
  /** Filter by date range start */
  startDate?: Date
  /** Filter by date range end */
  endDate?: Date
  /** Filter by tags */
  tags?: string[]
  /** Search text in title/content */
  searchText?: string
  /** Only active sessions */
  activeOnly?: boolean
}
