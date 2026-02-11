/**
 * ToolsPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { ToolsPage } from './ToolsPage'
import { useToolsStore } from '@/stores'

describe('ToolsPage', () => {
  beforeEach(() => {
    const store = useToolsStore.getState()
    store.setTools([])
    store.selectTool(null)
    store.setMCPServers([])
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setFilterHarness(null)
    store.setFilterStatus(null)
    store.setFilterMCPOnly(false)
    store.setActiveTab('overview')
  })

  it('should render the page header', () => {
    render(<ToolsPage />)
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Browse tools and MCP servers')).toBeInTheDocument()
  })

  it('should render the refresh button', async () => {
    render(<ToolsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })
  })

  it('should show empty state for tool detail', () => {
    render(<ToolsPage />)
    expect(screen.getByText('Select a tool to view its details')).toBeInTheDocument()
  })

  it('should auto-load and show tools', async () => {
    render(<ToolsPage />)
    await waitFor(() => {
      expect(screen.getByText(/available/)).toBeInTheDocument()
    })
  })

  it('should show search input', async () => {
    render(<ToolsPage />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tools...')).toBeInTheDocument()
    })
  })

  it('should show MCP status bar after loading', async () => {
    render(<ToolsPage />)
    await waitFor(() => {
      expect(screen.getByText('MCP Servers')).toBeInTheDocument()
    })
  })

  it('should display MCP server names', async () => {
    render(<ToolsPage />)
    await waitFor(() => {
      expect(screen.getByText('Filesystem')).toBeInTheDocument()
      expect(screen.getByText('GitHub')).toBeInTheDocument()
    })
  })

  it('should show tool cards after loading', async () => {
    render(<ToolsPage />)
    await waitFor(() => {
      expect(screen.getByText('Bash')).toBeInTheDocument()
      expect(screen.getByText('Read')).toBeInTheDocument()
    })
  })
})
