/**
 * ProjectContextPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { ProjectContextPage } from './ProjectContextPage'
import { useProjectContextStore } from '@/stores'

describe('ProjectContextPage', () => {
  beforeEach(() => {
    const store = useProjectContextStore.getState()
    store.setProjects([])
    store.selectProject(null)
    store.setIsScanning(false)
    store.setSearchQuery('')
    store.setFilterHarness(null)
  })

  it('should render the page header', () => {
    render(<ProjectContextPage />)
    expect(screen.getByText('Project Context')).toBeInTheDocument()
    expect(screen.getByText('Manage context files across your projects')).toBeInTheDocument()
  })

  it('should render the rescan button', async () => {
    render(<ProjectContextPage />)
    // Button starts as "Scanning..." during auto-scan, then becomes "Rescan"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /rescan/i })).toBeInTheDocument()
    })
  })

  it('should show empty state for project detail', () => {
    render(<ProjectContextPage />)
    expect(screen.getByText('Select a project to view its context files')).toBeInTheDocument()
  })

  it('should auto-scan and show projects', async () => {
    render(<ProjectContextPage />)

    await waitFor(() => {
      expect(screen.getByText('agent-config-manager')).toBeInTheDocument()
    })
  })

  it('should show search input', () => {
    render(<ProjectContextPage />)
    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument()
  })

  it('should show New Context File button when project is selected', async () => {
    render(<ProjectContextPage />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('agent-config-manager')).toBeInTheDocument()
    })

    // Select a project
    await user.click(screen.getByText('agent-config-manager'))

    await waitFor(() => {
      expect(screen.getByText('New Context File')).toBeInTheDocument()
    })
  })

  it('should show edit buttons on context files', async () => {
    render(<ProjectContextPage />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('agent-config-manager')).toBeInTheDocument()
    })

    await user.click(screen.getByText('agent-config-manager'))

    await waitFor(() => {
      expect(screen.getByLabelText('Edit CLAUDE.md')).toBeInTheDocument()
    })
  })

  it('should open editor when Edit is clicked', async () => {
    render(<ProjectContextPage />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('agent-config-manager')).toBeInTheDocument()
    })

    await user.click(screen.getByText('agent-config-manager'))

    await waitFor(() => {
      expect(screen.getByLabelText('Edit CLAUDE.md')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('Edit CLAUDE.md'))

    await waitFor(() => {
      expect(screen.getByText('Edit CLAUDE.md')).toBeInTheDocument()
      expect(screen.getByLabelText('File content editor')).toBeInTheDocument()
    })
  })

  it('should open create dialog when New Context File is clicked', async () => {
    render(<ProjectContextPage />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('agent-config-manager')).toBeInTheDocument()
    })

    await user.click(screen.getByText('agent-config-manager'))

    await waitFor(() => {
      expect(screen.getByText('New Context File')).toBeInTheDocument()
    })

    await user.click(screen.getByText('New Context File'))

    await waitFor(() => {
      expect(screen.getByText('Create Context File')).toBeInTheDocument()
    })
  })
})
