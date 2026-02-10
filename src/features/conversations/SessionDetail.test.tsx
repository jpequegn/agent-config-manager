/**
 * SessionDetail Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { SessionDetail } from './SessionDetail'
import { useSessionsStore } from '@/stores'
import type { Session } from '@/types'

const mockSession: Session = {
  id: 'sess-test',
  harness: 'claude-code',
  metadata: {
    title: 'Test Session Title',
    project: 'test-project',
    tags: ['test', 'mock'],
  },
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Help me fix a bug.',
      timestamp: new Date('2026-01-15T10:00:00'),
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content:
        'Here is the fix:\n\n```typescript\nconst x = 42\nconsole.log(x)\n```\n\nThis should work.',
      timestamp: new Date('2026-01-15T10:01:00'),
      toolCalls: [
        {
          id: 'tc-1',
          name: 'Read',
          input: { file_path: 'src/main.ts' },
          output: 'const x = 1\nconsole.log(x)',
          status: 'success',
          duration: 50,
          timestamp: new Date('2026-01-15T10:00:30'),
        },
        {
          id: 'tc-2',
          name: 'Edit',
          input: { file_path: 'src/main.ts', old_string: '1', new_string: '42' },
          status: 'error',
          error: 'File not found',
          duration: 10,
          timestamp: new Date('2026-01-15T10:00:45'),
        },
      ],
      fileChanges: [
        {
          type: 'modify',
          path: 'src/main.ts',
          linesAdded: 1,
          linesRemoved: 1,
          diff: '-const x = 1\n+const x = 42',
        },
      ],
    },
    {
      id: 'msg-3',
      role: 'user',
      content: 'Thanks, that worked!',
      timestamp: new Date('2026-01-15T10:02:00'),
    },
  ],
  stats: {
    messageCount: 3,
    userMessageCount: 2,
    assistantMessageCount: 1,
    toolCallCount: 2,
    fileChangeCount: 1,
    totalTokens: 500,
    duration: 120000,
  },
  startedAt: new Date('2026-01-15T10:00:00'),
  endedAt: new Date('2026-01-15T10:02:00'),
  isActive: false,
}

describe('SessionDetail', () => {
  beforeEach(() => {
    useSessionsStore.getState().selectSession(null)
  })

  it('should show empty state when no session selected', () => {
    render(<SessionDetail />)
    expect(screen.getByText('Select a session to view its conversation')).toBeInTheDocument()
  })

  it('should render session header with metadata', () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)
    expect(screen.getByText('Test Session Title')).toBeInTheDocument()
    expect(screen.getByText('claude-code')).toBeInTheDocument()
    expect(screen.getByText('test-project')).toBeInTheDocument()
    expect(screen.getByText('3 messages')).toBeInTheDocument()
    expect(screen.getByText('2 tool calls')).toBeInTheDocument()
    expect(screen.getByText('1 file changes')).toBeInTheDocument()
  })

  it('should render tags', () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('mock')).toBeInTheDocument()
  })

  it('should render all messages', () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)
    expect(screen.getByText('Help me fix a bug.')).toBeInTheDocument()
    expect(screen.getByText('This should work.')).toBeInTheDocument()
    expect(screen.getByText('Thanks, that worked!')).toBeInTheDocument()
  })

  it('should render code blocks from message content', () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)
    // Code block content renders inside <code> element
    expect(screen.getByText(/const x = 42/)).toBeInTheDocument()
    // Language label
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  it('should render tool calls as collapsible blocks', () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)
    // Tool names should be visible (collapsed)
    expect(screen.getByText('Read')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    // Status badges
    const successBadges = screen.getAllByText('success')
    expect(successBadges.length).toBeGreaterThan(0)
    expect(screen.getByText('error')).toBeInTheDocument()
  })

  it('should expand tool call to show input/output on click', async () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)

    // Click on the Read tool call to expand it
    const readButton = screen.getByText('Read').closest('button')!
    await userEvent.click(readButton)

    // Input and output should now be visible
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
  })

  it('should show file changes with diff toggle', async () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)

    // File path should be visible
    expect(screen.getByText('src/main.ts')).toBeInTheDocument()
    expect(screen.getByText('modify')).toBeInTheDocument()
  })

  it('should expand file diff on click', async () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)

    // Click on file change to show diff
    const fileButton = screen.getByText('src/main.ts').closest('button')!
    await userEvent.click(fileButton)

    // Diff lines should be visible
    expect(screen.getByText('-const x = 1')).toBeInTheDocument()
    expect(screen.getByText('+const x = 42')).toBeInTheDocument()
  })

  it('should show message jump bar for sessions with more than 2 messages', () => {
    useSessionsStore.getState().selectSession(mockSession)
    render(<SessionDetail />)
    expect(screen.getByText('Jump to:')).toBeInTheDocument()
    // Should show numbered buttons 1, 2, 3
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should show active badge for active sessions', () => {
    const activeSession = { ...mockSession, isActive: true }
    useSessionsStore.getState().selectSession(activeSession)
    render(<SessionDetail />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
