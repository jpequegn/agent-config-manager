/**
 * MigrationWizardPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MigrationWizardPage } from './MigrationWizardPage'
import { useMigrationStore } from '@/stores/migration-store'

// Mock scrollIntoView for cmdk/radix compatibility
Element.prototype.scrollIntoView = vi.fn()

// Mock harness config
vi.mock('@/components/harness', () => ({
  getHarnessConfig: vi.fn((type: string) => ({
    name: type === 'claude-code' ? 'Claude Code' : type.charAt(0).toUpperCase() + type.slice(1),
    shortName: type,
    brandColor: '#000000',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-600',
    description: `${type} description`,
    website: `https://${type}.com`,
  })),
  getAllHarnessTypes: vi.fn(() => [
    'claude-code',
    'cursor',
    'copilot',
    'cline',
    'continue',
    'aider',
  ]),
}))

// Mock HarnessIcon
vi.mock('@/components/harness/HarnessIcon', () => ({
  HarnessIcon: ({ type }: { type: string }) => <span data-testid={`icon-${type}`} />,
}))

// Mock migration service
vi.mock('@/services/migration', () => ({
  checkCompatibility: vi.fn(() =>
    Promise.resolve({
      source: 'claude-code',
      target: 'cursor',
      level: 'full',
      score: 70,
      summary: 'Highly compatible',
      warnings: ['Some configs may need adjustment'],
      unsupportedFeatures: ['hooks'],
    })
  ),
  analyzeMigration: vi.fn(() =>
    Promise.resolve({
      id: 'plan-1',
      source: 'claude-code',
      target: 'cursor',
      items: [
        {
          id: 'item-1',
          type: 'skill',
          name: 'Commit',
          description: 'Git commit skill',
          sourceHarness: 'claude-code',
          targetHarness: 'cursor',
          status: 'pending',
          compatibility: 'full',
          warnings: [],
          sourceContent: '# Commit',
          targetContent: '# .cursorrules\n# Commit',
          selected: true,
        },
        {
          id: 'item-2',
          type: 'hook',
          name: 'Pre-commit Lint',
          description: 'Lint hook',
          sourceHarness: 'claude-code',
          targetHarness: 'cursor',
          status: 'pending',
          compatibility: 'partial',
          warnings: ['Hooks not natively supported'],
          sourceContent: 'Hook: Lint',
          targetContent: '# cursor equivalent',
          selected: false,
        },
      ],
      compatibility: {
        source: 'claude-code',
        target: 'cursor',
        level: 'full',
        score: 70,
        summary: 'Highly compatible',
        warnings: [],
        unsupportedFeatures: [],
      },
      createdAt: new Date(),
    })
  ),
  createBackup: vi.fn(() =>
    Promise.resolve({
      id: 'backup-1',
      migrationId: 'plan-1',
      source: 'claude-code',
      target: 'cursor',
      itemCount: 1,
      createdAt: new Date(),
      size: 2048,
    })
  ),
  executeMigration: vi.fn(() =>
    Promise.resolve({
      id: 'result-1',
      planId: 'plan-1',
      backup: {
        id: 'backup-1',
        migrationId: 'plan-1',
        source: 'claude-code',
        target: 'cursor',
        itemCount: 1,
        createdAt: new Date(),
        size: 2048,
      },
      source: 'claude-code',
      target: 'cursor',
      totalItems: 1,
      migratedItems: 1,
      skippedItems: 1,
      failedItems: 0,
      warningItems: 0,
      items: [
        {
          id: 'item-1',
          type: 'skill',
          name: 'Commit',
          description: 'Git commit skill',
          sourceHarness: 'claude-code',
          targetHarness: 'cursor',
          status: 'migrated',
          compatibility: 'full',
          warnings: [],
          sourceContent: '# Commit',
          targetContent: '# .cursorrules\n# Commit',
          selected: true,
        },
        {
          id: 'item-2',
          type: 'hook',
          name: 'Pre-commit Lint',
          description: 'Lint hook',
          sourceHarness: 'claude-code',
          targetHarness: 'cursor',
          status: 'skipped',
          compatibility: 'partial',
          warnings: [],
          sourceContent: 'Hook: Lint',
          targetContent: '# cursor equivalent',
          selected: false,
        },
      ],
      startedAt: new Date(),
      completedAt: new Date(),
      duration: 1500,
    })
  ),
  rollbackMigration: vi.fn(() =>
    Promise.resolve({ success: true, message: 'Successfully rolled back migration.' })
  ),
  MIGRATION_STEPS: [
    { step: 'select', label: 'Select Harnesses' },
    { step: 'analyze', label: 'Analyze Compatibility' },
    { step: 'preview', label: 'Preview Changes' },
    { step: 'execute', label: 'Execute Migration' },
    { step: 'result', label: 'Results' },
  ],
}))

describe('MigrationWizardPage', () => {
  beforeEach(() => {
    useMigrationStore.getState().reset()
  })

  describe('initial rendering', () => {
    it('should render the wizard header', () => {
      render(<MigrationWizardPage />)
      expect(screen.getByText('Migration Wizard')).toBeInTheDocument()
      expect(screen.getByText('Transfer configurations between harnesses')).toBeInTheDocument()
    })

    it('should render step indicators', () => {
      render(<MigrationWizardPage />)
      expect(screen.getByText('Select Harnesses')).toBeInTheDocument()
      expect(screen.getByText('Analyze Compatibility')).toBeInTheDocument()
      expect(screen.getByText('Preview Changes')).toBeInTheDocument()
    })

    it('should show source and target harness selections', () => {
      render(<MigrationWizardPage />)
      expect(screen.getByText('Source Harness')).toBeInTheDocument()
      expect(screen.getByText('Target Harness')).toBeInTheDocument()
    })

    it('should render all 6 harnesses in source list', () => {
      render(<MigrationWizardPage />)
      expect(screen.getAllByText('Claude Code')).toHaveLength(2) // source + target
      expect(screen.getAllByText('Cursor')).toHaveLength(2)
    })

    it('should have Next button disabled when no harnesses selected', () => {
      render(<MigrationWizardPage />)
      const nextBtn = screen.getByRole('button', { name: /next/i })
      expect(nextBtn).toBeDisabled()
    })
  })

  describe('harness selection', () => {
    it('should enable Next when both harnesses are selected', () => {
      render(<MigrationWizardPage />)

      const claudeButtons = screen.getAllByText('Claude Code')
      fireEvent.click(claudeButtons[0]) // source

      const cursorButtons = screen.getAllByText('Cursor')
      fireEvent.click(cursorButtons[1]) // target

      const nextBtn = screen.getByRole('button', { name: /next/i })
      expect(nextBtn).not.toBeDisabled()
    })

    it('should disable selected source in target list', () => {
      useMigrationStore.getState().setSourceHarness('claude-code')

      render(<MigrationWizardPage />)

      // In target column, Claude Code should be disabled
      const targetSection = screen.getByText('Target Harness').closest('div')!
      const disabledButtons = targetSection.querySelectorAll('button[disabled]')
      expect(disabledButtons.length).toBe(1)
    })
  })

  describe('analysis step', () => {
    it('should show analysis results after advancing', async () => {
      useMigrationStore.getState().setSourceHarness('claude-code')
      useMigrationStore.getState().setTargetHarness('cursor')

      render(<MigrationWizardPage />)

      const nextBtn = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextBtn)

      await waitFor(() => {
        expect(screen.getByText('Compatibility Score')).toBeInTheDocument()
      })
    })

    it('should show compatibility score', async () => {
      useMigrationStore.getState().setSourceHarness('claude-code')
      useMigrationStore.getState().setTargetHarness('cursor')

      render(<MigrationWizardPage />)

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByText('70%')).toBeInTheDocument()
      })
    })

    it('should show warnings', async () => {
      useMigrationStore.getState().setSourceHarness('claude-code')
      useMigrationStore.getState().setTargetHarness('cursor')

      render(<MigrationWizardPage />)

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByText('Warnings')).toBeInTheDocument()
      })
    })
  })

  describe('preview step', () => {
    it('should show migration items after advancing to preview', async () => {
      useMigrationStore.getState().setSourceHarness('claude-code')
      useMigrationStore.getState().setTargetHarness('cursor')

      render(<MigrationWizardPage />)

      // Step 1 → 2
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByText('Compatibility Score')).toBeInTheDocument()
      })

      // Step 2 → 3
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByText('Commit')).toBeInTheDocument()
        expect(screen.getByText('Pre-commit Lint')).toBeInTheDocument()
      })
    })

    it('should show Select All and Deselect All buttons', async () => {
      useMigrationStore.getState().setSourceHarness('claude-code')
      useMigrationStore.getState().setTargetHarness('cursor')

      render(<MigrationWizardPage />)

      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      await waitFor(() => screen.getByText('Compatibility Score'))
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByText('Select All')).toBeInTheDocument()
        expect(screen.getByText('Deselect All')).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should show Back button on analysis step', async () => {
      useMigrationStore.getState().setSourceHarness('claude-code')
      useMigrationStore.getState().setTargetHarness('cursor')

      render(<MigrationWizardPage />)

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })
    })

    it('should go back to select step when Back is clicked', async () => {
      useMigrationStore.getState().setSourceHarness('claude-code')
      useMigrationStore.getState().setTargetHarness('cursor')

      render(<MigrationWizardPage />)

      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      await waitFor(() => screen.getByText('Compatibility Score'))

      fireEvent.click(screen.getByRole('button', { name: /back/i }))

      expect(screen.getByText('Source Harness')).toBeInTheDocument()
    })
  })
})
