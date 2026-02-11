/**
 * SettingsPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { SettingsPage } from './SettingsPage'
import { useSettingsStore } from '@/stores'

describe('SettingsPage', () => {
  beforeEach(() => {
    const store = useSettingsStore.getState()
    store.setSettings([])
    store.selectKey(null)
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setActiveCategory(null)
    store.setModifiedOnly(false)
    store.setViewMode('tree')
  })

  it('should render the page header', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('View and manage configuration')).toBeInTheDocument()
  })

  it('should render the refresh button', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh settings/i })).toBeInTheDocument()
    })
  })

  it('should show view mode toggle', () => {
    render(<SettingsPage />)
    expect(screen.getByLabelText('Tree view')).toBeInTheDocument()
    expect(screen.getByLabelText('Raw JSON view')).toBeInTheDocument()
  })

  it('should show search input', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search settings...')).toBeInTheDocument()
    })
  })

  it('should auto-load and show settings', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByText(/modified/)).toBeInTheDocument()
    })
  })

  it('should show category entries', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('All Settings')).toBeInTheDocument()
      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Appearance')).toBeInTheDocument()
      expect(screen.getByText('AI')).toBeInTheDocument()
    })
  })

  it('should show setting names after loading', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByText('Default Harness')).toBeInTheDocument()
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })
  })

  it('should switch to raw view', async () => {
    render(<SettingsPage />)
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Raw JSON view'))

    await waitFor(() => {
      expect(screen.getByText(/"appearance.theme"/)).toBeInTheDocument()
    })
  })
})
