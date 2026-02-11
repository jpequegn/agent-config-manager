/**
 * MemoryDashboard Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { MemoryDashboard } from './MemoryDashboard'
import { useMemoryStore } from '@/stores/memory-store'

describe('MemoryDashboard', () => {
  beforeEach(() => {
    const store = useMemoryStore.getState()
    store.setStats(null)
    store.setHealth([])
    store.setIsLoading(false)
    store.setBreakdownView('type')
  })

  it('should render the page header', () => {
    render(<MemoryDashboard />)
    expect(screen.getByText('Memory Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Storage usage and health monitoring')).toBeInTheDocument()
  })

  it('should render the refresh button', async () => {
    render(<MemoryDashboard />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh dashboard/i })).toBeInTheDocument()
    })
  })

  it('should auto-load and show summary cards', async () => {
    render(<MemoryDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Total Entries')).toBeInTheDocument()
      expect(screen.getByText('Total Storage')).toBeInTheDocument()
    })
  })

  it('should show memory type breakdown', async () => {
    render(<MemoryDashboard />)
    await waitFor(() => {
      expect(screen.getByText('By Memory Type')).toBeInTheDocument()
      // "Sessions" appears in both the donut chart legend and type breakdown cards
      expect(screen.getAllByText('Sessions').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Learnings').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Codebase Indexes').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should show storage health section', async () => {
    render(<MemoryDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Storage Health')).toBeInTheDocument()
      expect(screen.getByText('Local Storage')).toBeInTheDocument()
      expect(screen.getByText('External Drive')).toBeInTheDocument()
      expect(screen.getByText('Cloud Sync')).toBeInTheDocument()
    })
  })

  it('should show harness usage section', async () => {
    render(<MemoryDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Harness Usage')).toBeInTheDocument()
      expect(screen.getByText('Claude Code')).toBeInTheDocument()
    })
  })

  it('should show breakdown view toggle', async () => {
    render(<MemoryDashboard />)
    await waitFor(() => {
      expect(screen.getByText('By Type')).toBeInTheDocument()
      expect(screen.getByText('By Harness')).toBeInTheDocument()
    })
  })
})
