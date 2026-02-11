/**
 * HookTestingPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { HookTestingPage } from './HookTestingPage'
import { useHookLogsStore } from '@/stores/hook-logs-store'

describe('HookTestingPage', () => {
  beforeEach(() => {
    useHookLogsStore.getState().reset()
  })

  it('should render the page header', () => {
    render(<HookTestingPage />)
    expect(screen.getByText('Hook Testing & Logs')).toBeInTheDocument()
    expect(screen.getByText('Select a hook to test and view execution logs')).toBeInTheDocument()
  })

  it('should load and show hooks list', async () => {
    render(<HookTestingPage />)
    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
      expect(screen.getByText('Lint on save')).toBeInTheDocument()
    })
  })

  it('should not show error-status hooks', async () => {
    render(<HookTestingPage />)
    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })
    // Stop handler has error status and should not appear
    expect(screen.queryByText('Stop handler')).not.toBeInTheDocument()
  })

  it('should navigate to hook detail when clicked', async () => {
    const user = userEvent.setup()
    render(<HookTestingPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sensitive file guard'))

    await waitFor(() => {
      expect(screen.getByText('Test Runner')).toBeInTheDocument()
      expect(screen.getByText('Execution Logs')).toBeInTheDocument()
    })
  })

  it('should show back button in detail view', async () => {
    const user = userEvent.setup()
    render(<HookTestingPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sensitive file guard'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to hook list/i })).toBeInTheDocument()
    })
  })

  it('should show stats bar in detail view', async () => {
    const user = userEvent.setup()
    render(<HookTestingPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sensitive file guard'))

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument()
      expect(screen.getByText(/Allowed:/)).toBeInTheDocument()
      expect(screen.getByText(/Blocked:/)).toBeInTheDocument()
      expect(screen.getByText(/Errors:/)).toBeInTheDocument()
    })
  })

  it('should show test runner with sample input options', async () => {
    const user = userEvent.setup()
    render(<HookTestingPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sensitive file guard'))

    await waitFor(() => {
      expect(screen.getByText('Edit .env')).toBeInTheDocument()
      expect(screen.getByText('Write file')).toBeInTheDocument()
      expect(screen.getByText('Bash command')).toBeInTheDocument()
      expect(screen.getByLabelText('Sample hook input')).toBeInTheDocument()
    })
  })

  it('should show log filter buttons', async () => {
    const user = userEvent.setup()
    render(<HookTestingPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sensitive file guard'))

    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Allowed')).toBeInTheDocument()
      expect(screen.getByText('Blocked')).toBeInTheDocument()
      expect(screen.getByText('Errors')).toBeInTheDocument()
    })
  })

  it('should navigate back to hook list', async () => {
    const user = userEvent.setup()
    render(<HookTestingPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sensitive file guard'))

    await waitFor(() => {
      expect(screen.getByText('Test Runner')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /back to hook list/i }))

    await waitFor(() => {
      expect(screen.getByText('Hook Testing & Logs')).toBeInTheDocument()
    })
  })

  it('should show clear logs button', async () => {
    const user = userEvent.setup()
    render(<HookTestingPage />)

    await waitFor(() => {
      expect(screen.getByText('Sensitive file guard')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sensitive file guard'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear logs/i })).toBeInTheDocument()
    })
  })
})
