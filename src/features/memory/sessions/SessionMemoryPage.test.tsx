/**
 * SessionMemoryPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { SessionMemoryPage } from './SessionMemoryPage'
import { useSessionsStore } from '@/stores'
import { useSessionMemoryStore } from '@/stores/session-memory-store'

describe('SessionMemoryPage', () => {
  beforeEach(() => {
    const sessStore = useSessionsStore.getState()
    sessStore.setSessions([])
    sessStore.setIsLoading(false)

    const memStore = useSessionMemoryStore.getState()
    memStore.clearSelection()
    memStore.setActivePanel('sessions')
    memStore.setPruneRules([])
    memStore.setIsBulkOperating(false)
    memStore.setLastOperationMessage(null)
  })

  it('should render the page header', () => {
    render(<SessionMemoryPage />)
    expect(screen.getByText('Session Memory')).toBeInTheDocument()
    expect(screen.getByText('Manage, export, and prune session data')).toBeInTheDocument()
  })

  it('should render the refresh button', async () => {
    render(<SessionMemoryPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh session memory/i })).toBeInTheDocument()
    })
  })

  it('should show panel tabs', () => {
    render(<SessionMemoryPage />)
    expect(screen.getByRole('tab', { name: 'Sessions' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Auto-Prune' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Export' })).toBeInTheDocument()
  })

  it('should load and show sessions with select-all', async () => {
    render(<SessionMemoryPage />)
    await waitFor(() => {
      expect(screen.getByLabelText('Select all sessions')).toBeInTheDocument()
    })
  })

  it('should show empty state for bulk actions', async () => {
    render(<SessionMemoryPage />)
    await waitFor(() => {
      expect(screen.getByText('Select sessions to perform bulk operations')).toBeInTheDocument()
    })
  })

  it('should switch to auto-prune panel', async () => {
    const user = userEvent.setup()
    render(<SessionMemoryPage />)

    await user.click(screen.getByRole('tab', { name: 'Auto-Prune' }))

    await waitFor(() => {
      expect(screen.getByText('Auto-Prune Rules')).toBeInTheDocument()
    })
  })

  it('should switch to export panel', async () => {
    const user = userEvent.setup()
    render(<SessionMemoryPage />)

    await user.click(screen.getByRole('tab', { name: 'Export' }))

    await waitFor(() => {
      expect(screen.getByText('Export Sessions')).toBeInTheDocument()
      expect(screen.getByText('JSON')).toBeInTheDocument()
      expect(screen.getByText('Markdown')).toBeInTheDocument()
    })
  })

  it('should show sessions after loading', async () => {
    render(<SessionMemoryPage />)
    await waitFor(() => {
      expect(screen.getByText('Implement project context scanner')).toBeInTheDocument()
    })
  })
})
