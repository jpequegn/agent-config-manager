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
      }
      return selector(state as unknown as ReturnType<typeof useHarnessStore.getState>)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('keyboard shortcut', () => {
    it('opens command palette on Cmd+K', async () => {
      // Mock palette as closed
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(false)

      render(<CommandPalette />)

      // Simulate Cmd+K
      fireEvent.keyDown(document, { key: 'k', metaKey: true })

      expect(mockOpenCommandPalette).toHaveBeenCalled()
    })

    it('opens command palette on Ctrl+K', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(false)

      render(<CommandPalette />)

      // Simulate Ctrl+K
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

      expect(mockOpenCommandPalette).toHaveBeenCalled()
    })

    it('closes command palette when already open', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      // Simulate Cmd+K when open
      fireEvent.keyDown(document, { key: 'k', metaKey: true })

      expect(mockCloseCommandPalette).toHaveBeenCalled()
    })

    it('does not open without modifier key', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(false)

      render(<CommandPalette />)

      // Just 'k' without modifier
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

      expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument()
    })

    it('renders all command groups', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Switch Harness')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('renders navigation commands', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      expect(screen.getByText('Go to Skills')).toBeInTheDocument()
      expect(screen.getByText('Go to Hooks')).toBeInTheDocument()
      expect(screen.getByText('Go to Sessions')).toBeInTheDocument()
      expect(screen.getByText('Go to Memory')).toBeInTheDocument()
      expect(screen.getByText('Go to Tools & MCP')).toBeInTheDocument()
      expect(screen.getByText('Go to Settings')).toBeInTheDocument()
    })

    it('renders harness commands', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      expect(screen.getByText('Switch to Claude-code')).toBeInTheDocument()
      expect(screen.getByText('Switch to Cursor')).toBeInTheDocument()
      expect(screen.getByText('Switch to Copilot')).toBeInTheDocument()
    })

    it('renders action commands', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

      expect(screen.getByText('Create New Skill')).toBeInTheDocument()
      expect(screen.getByText('Create New Hook')).toBeInTheDocument()
      expect(screen.getByText('Refresh All')).toBeInTheDocument()
      expect(screen.getByText('Open Documentation')).toBeInTheDocument()
    })

    it('renders keyboard shortcuts', async () => {
      const { useCommandPaletteOpen } = await import('@/stores')
      vi.mocked(useCommandPaletteOpen).mockReturnValue(true)

      render(<CommandPalette />)

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

      // Get the dialog content and press Escape
      const dialogContent = screen.getByRole('dialog')
      fireEvent.keyDown(dialogContent, { key: 'Escape' })

      expect(mockCloseCommandPalette).toHaveBeenCalled()
    })
  })
})
