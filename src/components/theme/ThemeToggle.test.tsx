/**
 * ThemeToggle Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'
import { useUIStore } from '@/stores'

// Mock the stores
vi.mock('@/stores', () => ({
  useUIStore: vi.fn(),
  useTheme: vi.fn(),
}))

describe('ThemeToggle', () => {
  const mockSetTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders toggle button', async () => {
    const { useTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = { setTheme: mockSetTheme }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(<ThemeToggle />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has accessible label', async () => {
    const { useTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = { setTheme: mockSetTheme }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(<ThemeToggle />)

    expect(screen.getByText('Toggle theme')).toBeInTheDocument()
  })

  it('opens dropdown menu when clicked', async () => {
    const { useTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = { setTheme: mockSetTheme }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('calls setTheme when light option clicked', async () => {
    const { useTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = { setTheme: mockSetTheme }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    const lightOption = screen.getByText('Light')
    await userEvent.click(lightOption)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('calls setTheme when dark option clicked', async () => {
    const { useTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('light')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = { setTheme: mockSetTheme }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    const darkOption = screen.getByText('Dark')
    await userEvent.click(darkOption)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme when system option clicked', async () => {
    const { useTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = { setTheme: mockSetTheme }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    const systemOption = screen.getByText('System')
    await userEvent.click(systemOption)

    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })

  it('applies custom className', async () => {
    const { useTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = { setTheme: mockSetTheme }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(<ThemeToggle className="custom-class" />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})
