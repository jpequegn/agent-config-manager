/**
 * CommandPalette Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'
import { useUIStore, useHarnessStore } from '@/stores'

// Mock scrollIntoView for cmdk compatibility
Element.prototype.scrollIntoView = vi.fn()

// Mock the stores
vi.mock('@/stores', () => ({
  useUIStore: vi.fn(),
  useCommandPaletteOpen: vi.fn(),
  useHarnessStore: vi.fn(),
}))

// Mock harness config
vi.mock('@/components/harness', () => ({
  getHarnessConfig: vi.fn((type: string) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    shortName: type,
    brandColor: '#000000',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-600',
    description: `${type} description`,
    website: `https://${type}.com`,
  })),
  getAllHarnessTypes: vi.fn(() => ['claude-code', 'cursor', 'copilot']),
}))

// Mock search service
vi.mock('@/services/search', () => ({
  searchAll: vi.fn(() => Promise.resolve([])),
  addRecentSearch: vi.fn(),
  getRecentSearches: vi.fn(() => []),
  clearRecentSearches: vi.fn(),
}))

describe('CommandPalette', () => {
  const mockOpenCommandPalette = vi.fn()
  const mockCloseCommandPalette = vi.fn()
  const mockSetActiveHarness = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    vi.mocked(useUIStore).mockImplementation((selector) => {
      const state = {
        openCommandPalette: mockOpenCommandPalette,
        closeCommandPalette: mockCloseCommandPalette,
        isCommandPaletteOpen: false,
      }
      return selector(state as unknown as ReturnType<typeof useUIStore.getState>)
    })

    vi.mocked(useHarnessStore).mockImplementation((selector) => {
      const state = {
        setActiveHarness: mockSetActiveHarness,
        activeHarness: 'claude-code',
      }
      return selector(state as unknown as ReturnType<typeof useHarnessStore.getState>)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('keyboard shortcut', () => {
    it('opens command palette on Cmd+K', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(false)

      render(<CommandPalette />)

      fireEvent.keyDown(document, { key: 'k', metaKey: true })

      expect(mockOpenCommandPalette).toHaveBeenCalled()
    })

    it('opens command palette on Ctrl+K', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(false)

      render(<CommandPalette />)

      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

      expect(mockOpenCommandPalette).toHaveBeenCalled()
    })

    it('closes command palette when already open', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      fireEvent.keyDown(document, { key: 'k', metaKey: true })

      expect(mockCloseCommandPalette).toHaveBeenCalled()
    })

    it('does not open without modifier key', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(false)

      render(<CommandPalette />)

      fireEvent.keyDown(document, { key: 'k' })

      expect(mockOpenCommandPalette).not.toHaveBeenCalled()
    })

    it('cleans up event listener on unmount', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(false)

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = render(<CommandPalette />)
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('dialog rendering', () => {
    it('renders dialog when open', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      expect(
        screen.getByPlaceholderText('Search everything or type > for commands...')
      ).toBeInTheDocument()
    })

    it('renders search scope toggle', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      expect(screen.getByText('Search in:')).toBeInTheDocument()
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Current Harness')).toBeInTheDocument()
    })

    it('renders quick actions when no search', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('Create New Skill')).toBeInTheDocument()
      expect(screen.getByText('Create New Hook')).toBeInTheDocument()
    })

    it('renders keyboard shortcuts hint', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      expect(screen.getByText('for commands')).toBeInTheDocument()
    })
  })

  describe('command mode', () => {
    it('shows commands when > prefix is typed', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      const input = screen.getByPlaceholderText('Search everything or type > for commands...')
      fireEvent.change(input, { target: { value: '>' } })

      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Switch Harness')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('renders navigation commands in command mode', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      const input = screen.getByPlaceholderText('Search everything or type > for commands...')
      fireEvent.change(input, { target: { value: '>' } })

      expect(screen.getByText('Go to Skills')).toBeInTheDocument()
      expect(screen.getByText('Go to Hooks')).toBeInTheDocument()
      expect(screen.getByText('Go to Sessions')).toBeInTheDocument()
      expect(screen.getByText('Go to Memory')).toBeInTheDocument()
      expect(screen.getByText('Go to Tools & MCP')).toBeInTheDocument()
      expect(screen.getByText('Go to Settings')).toBeInTheDocument()
    })

    it('renders harness commands in command mode', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      const input = screen.getByPlaceholderText('Search everything or type > for commands...')
      fireEvent.change(input, { target: { value: '>' } })

      expect(screen.getByText('Switch to Claude-code')).toBeInTheDocument()
      expect(screen.getByText('Switch to Cursor')).toBeInTheDocument()
      expect(screen.getByText('Switch to Copilot')).toBeInTheDocument()
    })

    it('renders action commands in command mode', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      const input = screen.getByPlaceholderText('Search everything or type > for commands...')
      fireEvent.change(input, { target: { value: '>' } })

      expect(screen.getByText('Refresh All')).toBeInTheDocument()
      expect(screen.getByText('Open Documentation')).toBeInTheDocument()
    })

    it('renders keyboard shortcuts in command mode', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      const input = screen.getByPlaceholderText('Search everything or type > for commands...')
      fireEvent.change(input, { target: { value: '>' } })

      expect(screen.getByText('⌘1')).toBeInTheDocument()
      expect(screen.getByText('⌘,')).toBeInTheDocument()
      expect(screen.getByText('⌘R')).toBeInTheDocument()
    })
  })

  describe('command selection', () => {
    it('calls setActiveHarness when harness command selected', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      const input = screen.getByPlaceholderText('Search everything or type > for commands...')
      fireEvent.change(input, { target: { value: '>' } })

      const cursorCommand = screen.getByText('Switch to Cursor')
      fireEvent.click(cursorCommand)

      expect(mockSetActiveHarness).toHaveBeenCalledWith('cursor')
      expect(mockCloseCommandPalette).toHaveBeenCalled()
    })

    it('closes palette after command selection', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      render(<CommandPalette />)

      const input = screen.getByPlaceholderText('Search everything or type > for commands...')
      fireEvent.change(input, { target: { value: '>' } })

      const skillsCommand = screen.getByText('Go to Skills')
      fireEvent.click(skillsCommand)

      expect(mockCloseCommandPalette).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('dialog state', () => {
    it('calls closeCommandPalette when dialog closes via Escape', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      const dialogContent = screen.getByRole('dialog')
      fireEvent.keyDown(dialogContent, { key: 'Escape' })

      expect(mockCloseCommandPalette).toHaveBeenCalled()
    })
  })
})
