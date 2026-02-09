/**
 * ProjectContextPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
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
})
