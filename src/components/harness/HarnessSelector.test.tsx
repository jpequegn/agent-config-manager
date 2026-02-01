/**
 * HarnessSelector Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { HarnessSelector } from './HarnessSelector'
import { useHarnessStore } from '@/stores'

// Mock the store
vi.mock('@/stores', async () => {
  const actual = await vi.importActual('@/stores')
  return {
    ...actual,
    useHarnessStore: vi.fn(),
    useActiveHarness: vi.fn(),
  }
})

describe('HarnessSelector', () => {
  const mockSetActiveHarness = vi.fn()
  const mockIsHarnessDetected = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementation
    vi.mocked(useHarnessStore).mockImplementation((selector) => {
      const state = {
        activeHarness: 'claude-code',
        setActiveHarness: mockSetActiveHarness,
        isHarnessDetected: mockIsHarnessDetected,
      }
      return selector(state as never)
    })

    // By default, all harnesses are detected
    mockIsHarnessDetected.mockReturnValue(true)
  })

  it('renders all harness tabs', () => {
    render(<HarnessSelector />)

    expect(screen.getByText('Claude')).toBeInTheDocument()
    expect(screen.getByText('Cursor')).toBeInTheDocument()
    expect(screen.getByText('Copilot')).toBeInTheDocument()
    expect(screen.getByText('Cline')).toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
    expect(screen.getByText('Aider')).toBeInTheDocument()
  })

  it('calls setActiveHarness when clicking a detected tab', async () => {
    const user = userEvent.setup()
    render(<HarnessSelector />)

    await user.click(screen.getByText('Cursor'))

    expect(mockSetActiveHarness).toHaveBeenCalledWith('cursor')
  })

  it('does not call setActiveHarness when clicking an undetected tab', async () => {
    mockIsHarnessDetected.mockImplementation((type) => type !== 'aider')

    const user = userEvent.setup()
    render(<HarnessSelector />)

    await user.click(screen.getByText('Aider'))

    expect(mockSetActiveHarness).not.toHaveBeenCalled()
  })

  it('renders Add button when onAddHarness is provided', () => {
    const onAddHarness = vi.fn()
    render(<HarnessSelector onAddHarness={onAddHarness} />)

    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('does not render Add button when onAddHarness is not provided', () => {
    render(<HarnessSelector />)

    expect(screen.queryByText('Add')).not.toBeInTheDocument()
  })

  it('calls onAddHarness when Add button is clicked', async () => {
    const user = userEvent.setup()
    const onAddHarness = vi.fn()
    render(<HarnessSelector onAddHarness={onAddHarness} />)

    await user.click(screen.getByText('Add'))

    expect(onAddHarness).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(<HarnessSelector className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('disables undetected harness tabs', () => {
    mockIsHarnessDetected.mockImplementation((type) => type === 'claude-code')

    render(<HarnessSelector />)

    // Claude should be enabled
    const claudeButton = screen.getByText('Claude').closest('button')
    expect(claudeButton).not.toBeDisabled()

    // Cursor should be disabled
    const cursorButton = screen.getByText('Cursor').closest('button')
    expect(cursorButton).toBeDisabled()
  })
})
