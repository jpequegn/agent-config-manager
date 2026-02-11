/**
 * HooksPage Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { HooksPage } from './HooksPage'
import { useHooksStore } from '@/stores/hooks-store'

// Mock Monaco Editor since it requires web workers
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="mock-monaco" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

describe('HooksPage', () => {
  beforeEach(() => {
    const store = useHooksStore.getState()
    store.setHookGroups([])
    store.clearSelection()
    store.setFilterTrigger(null)
    store.setFilterHarness(null)
    store.setIsLoading(false)
    store.setIsBulkOperating(false)
    store.setLastMessage(null)
  })

  it('should render the page header', () => {
    render(<HooksPage />)
    expect(screen.getByText('Hooks')).toBeInTheDocument()
    expect(screen.getByText('Manage automation hooks by trigger type')).toBeInTheDocument()
  })

  it('should render the refresh button', () => {
    render(<HooksPage />)
    expect(screen.getByRole('button', { name: /refresh hooks list/i })).toBeInTheDocument()
  })

  it('should show trigger filter pills', () => {
    render(<HooksPage />)
    expect(screen.getByText('All Triggers')).toBeInTheDocument()
    expect(screen.getByText('Pre Tool Use')).toBeInTheDocument()
    expect(screen.getByText('Post Tool Use')).toBeInTheDocument()
  })

  it('should load and show hook groups', async () => {
    render(<HooksPage />)
    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
      expect(screen.getByText('Lint on save')).toBeInTheDocument()
    })
  })

  it('should show hooks grouped by trigger', async () => {
    render(<HooksPage />)
    await waitFor(() => {
      // Check for group headers - use getAllByText since there are filter pills + section headers
      const preToolUseElements = screen.getAllByText('Pre Tool Use')
      expect(preToolUseElements.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should show hook stats', async () => {
    render(<HooksPage />)
    await waitFor(() => {
      expect(screen.getByText('342 runs')).toBeInTheDocument()
      expect(screen.getByText('24 blocked')).toBeInTheDocument()
    })
  })

  it('should show enable/disable toggles', async () => {
    render(<HooksPage />)
    await waitFor(() => {
      const toggles = screen.getAllByRole('switch')
      expect(toggles.length).toBeGreaterThan(0)
    })
  })

  it('should filter by trigger type', async () => {
    const user = userEvent.setup()
    render(<HooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    // Click Notification filter pill (within the filter bar, not the group header)
    const filterPills = screen.getAllByText('Notification')
    await user.click(filterPills[0])

    await waitFor(() => {
      expect(screen.getByText('Slack notification')).toBeInTheDocument()
      expect(screen.queryByText('Sensitive file guard')).not.toBeInTheDocument()
    })
  })

  it('should show select all checkbox', () => {
    render(<HooksPage />)
    expect(screen.getByLabelText('Select all hooks')).toBeInTheDocument()
  })

  it('should show New Hook button', () => {
    render(<HooksPage />)
    expect(screen.getByRole('button', { name: /create new hook/i })).toBeInTheDocument()
  })

  it('should open editor when New Hook is clicked', async () => {
    const user = userEvent.setup()
    render(<HooksPage />)

    await user.click(screen.getByRole('button', { name: /create new hook/i }))

    await waitFor(() => {
      expect(screen.getByText('Create Hook', { selector: 'h2' })).toBeInTheDocument()
    })
  })

  it('should show edit buttons on hook cards', async () => {
    render(<HooksPage />)
    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/^Edit /)
      expect(editButtons.length).toBeGreaterThan(0)
    })
  })

  it('should open editor when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<HooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    const editButton = screen.getByLabelText('Edit Sensitive file guard')
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByText('Edit Hook')).toBeInTheDocument()
    })
  })
})
