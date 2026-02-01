/**
 * ThemeProvider Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from './ThemeProvider'
import { useUIStore } from '@/stores'

// Mock the stores
vi.mock('@/stores', () => ({
  useUIStore: vi.fn(),
  useTheme: vi.fn(),
  useResolvedTheme: vi.fn(),
}))

describe('ThemeProvider', () => {
  const mockSetTheme = vi.fn()
  const mockSetResolvedTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Reset document class
    document.documentElement.classList.remove('light', 'dark')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children', async () => {
    const { useTheme, useResolvedTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('dark')
    vi.mocked(useResolvedTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = {
        setTheme: mockSetTheme,
        setResolvedTheme: mockSetResolvedTheme,
      }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(
      <ThemeProvider>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('applies dark class to document when theme is dark', async () => {
    const { useTheme, useResolvedTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('dark')
    vi.mocked(useResolvedTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = {
        setTheme: mockSetTheme,
        setResolvedTheme: mockSetResolvedTheme,
      }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('applies light class to document when theme is light', async () => {
    const { useTheme, useResolvedTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('light')
    vi.mocked(useResolvedTheme).mockReturnValue('light')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = {
        setTheme: mockSetTheme,
        setResolvedTheme: mockSetResolvedTheme,
      }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })

  it('uses system preference when theme is system', async () => {
    const { useTheme, useResolvedTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue('system')
    vi.mocked(useResolvedTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = {
        setTheme: mockSetTheme,
        setResolvedTheme: mockSetResolvedTheme,
      }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Should resolve to system preference (dark based on our mock)
    expect(mockSetResolvedTheme).toHaveBeenCalledWith('dark')
  })

  it('uses defaultTheme when no theme is set', async () => {
    const { useTheme, useResolvedTheme } = await import('@/stores')
    vi.mocked(useTheme).mockReturnValue(null as unknown as 'dark')
    vi.mocked(useResolvedTheme).mockReturnValue('dark')
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = {
        setTheme: mockSetTheme,
        setResolvedTheme: mockSetResolvedTheme,
      }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    render(
      <ThemeProvider defaultTheme="dark">
        <div>Test</div>
      </ThemeProvider>
    )

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
