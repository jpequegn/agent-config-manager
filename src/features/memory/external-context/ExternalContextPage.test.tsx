/**
 * ExternalContextPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { ExternalContextPage } from './ExternalContextPage'
import { useExternalContextStore } from '@/stores/external-context-store'

describe('ExternalContextPage', () => {
  beforeEach(() => {
    const store = useExternalContextStore.getState()
    store.setDrives([])
    store.selectDrive(null)
    store.setIsDetecting(false)
    store.setLastMessage(null)
  })

  it('should render the page header', () => {
    render(<ExternalContextPage />)
    expect(screen.getByText('External Context')).toBeInTheDocument()
    expect(
      screen.getByText('Manage external drives and context synchronization')
    ).toBeInTheDocument()
  })

  it('should render the scan button', () => {
    render(<ExternalContextPage />)
    expect(screen.getByRole('button', { name: /scan for external drives/i })).toBeInTheDocument()
  })

  it('should show empty state when no drive selected', async () => {
    render(<ExternalContextPage />)
    await waitFor(() => {
      expect(
        screen.getByText('Select a drive to view details and sync settings')
      ).toBeInTheDocument()
    })
  })

  it('should show drives after detection', async () => {
    render(<ExternalContextPage />)
    await waitFor(() => {
      expect(screen.getByText('Extreme Pro')).toBeInTheDocument()
    })
  })

  it('should show connected and disconnected sections', async () => {
    render(<ExternalContextPage />)
    await waitFor(() => {
      expect(screen.getByText(/Connected \(\d+\)/)).toBeInTheDocument()
      expect(screen.getByText(/Disconnected \(\d+\)/)).toBeInTheDocument()
    })
  })

  it('should show stats bar after loading', async () => {
    render(<ExternalContextPage />)
    await waitFor(() => {
      expect(screen.getByText('Drives:')).toBeInTheDocument()
      expect(screen.getByText('With PAI Context:')).toBeInTheDocument()
    })
  })

  it('should select a drive and show details', async () => {
    const user = userEvent.setup()
    render(<ExternalContextPage />)

    await waitFor(() => {
      expect(screen.getByText('Extreme Pro')).toBeInTheDocument()
    })

    // Click on the Extreme Pro drive button
    const driveButtons = screen.getAllByRole('button')
    const extremeProButton = driveButtons.find(
      (btn) => btn.textContent?.includes('Extreme Pro') && btn.textContent?.includes('/Volumes')
    )
    expect(extremeProButton).toBeDefined()
    await user.click(extremeProButton!)

    await waitFor(() => {
      expect(screen.getByText('Sync Now')).toBeInTheDocument()
    })
  })

  it('should show disconnected state for offline drive', async () => {
    const user = userEvent.setup()
    render(<ExternalContextPage />)

    await waitFor(() => {
      expect(screen.getByText('Network NAS')).toBeInTheDocument()
    })

    const driveButtons = screen.getAllByRole('button')
    const nasButton = driveButtons.find((btn) => btn.textContent?.includes('Network NAS'))
    expect(nasButton).toBeDefined()
    await user.click(nasButton!)

    await waitFor(() => {
      expect(screen.getByText('This drive is currently disconnected')).toBeInTheDocument()
    })
  })
})
