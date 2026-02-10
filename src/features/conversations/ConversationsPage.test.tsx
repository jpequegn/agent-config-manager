/**
 * ConversationsPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { ConversationsPage } from './ConversationsPage'
import { useSessionsStore } from '@/stores'

describe('ConversationsPage', () => {
  beforeEach(() => {
    const store = useSessionsStore.getState()
    store.setSessions([])
    store.selectSession(null)
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setFilterHarness(null)
    store.setFilterProject(null)
    store.setFilterDateStart(null)
    store.setFilterDateEnd(null)
    store.setSortBy('recent')
    store.setSortOrder('desc')
  })

  it('should render the page header', () => {
    render(<ConversationsPage />)
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('Browse and search conversation history')).toBeInTheDocument()
  })

  it('should render the refresh button', async () => {
    render(<ConversationsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })
  })

  it('should show empty state for session detail', () => {
    render(<ConversationsPage />)
    expect(screen.getByText('Select a session to view its conversation')).toBeInTheDocument()
  })

  it('should auto-load and show sessions', async () => {
    render(<ConversationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Implement project context scanner')).toBeInTheDocument()
    })
  })

  it('should show search input', () => {
    render(<ConversationsPage />)
    expect(screen.getByPlaceholderText('Search sessions...')).toBeInTheDocument()
  })

  it('should show session count', async () => {
    render(<ConversationsPage />)
    await waitFor(() => {
      expect(screen.getByText('10 sessions')).toBeInTheDocument()
    })
  })

  it('should show sort button', () => {
    render(<ConversationsPage />)
    expect(screen.getByRole('button', { name: /most recent/i })).toBeInTheDocument()
  })

  it('should show project filter button', () => {
    render(<ConversationsPage />)
    expect(screen.getByRole('button', { name: /project/i })).toBeInTheDocument()
  })

  it('should show date filter button', () => {
    render(<ConversationsPage />)
    expect(screen.getByRole('button', { name: /date/i })).toBeInTheDocument()
  })
})
