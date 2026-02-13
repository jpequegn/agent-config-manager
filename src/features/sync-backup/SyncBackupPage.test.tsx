/**
 * SyncBackupPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SyncBackupPage } from './SyncBackupPage'
import { useSyncBackupStore } from '@/stores/sync-backup-store'

// Mock scrollIntoView for radix compatibility
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

const mockBackups = [
  {
    id: 'backup-001',
    name: 'Full Backup',
    type: 'manual' as const,
    status: 'complete' as const,
    harness: 'all' as const,
    createdAt: new Date('2025-06-01'),
    expiresAt: null,
    size: 2048,
    description: 'Initial full backup',
    contents: { skills: 3, hooks: 2, settings: 1, mcpServers: 1, projectContextFiles: 2 },
  },
  {
    id: 'backup-002',
    name: 'Cursor Backup',
    type: 'auto' as const,
    status: 'complete' as const,
    harness: 'cursor' as const,
    createdAt: new Date('2025-06-02'),
    expiresAt: null,
    size: 1024,
    contents: { skills: 2, hooks: 1, settings: 1, mcpServers: 0, projectContextFiles: 0 },
  },
]

const mockSyncStates = [
  {
    harness: 'claude-code' as const,
    status: 'synced' as const,
    lastSyncedAt: new Date(),
    pendingChanges: 0,
  },
  {
    harness: 'cursor' as const,
    status: 'pending' as const,
    lastSyncedAt: new Date(),
    pendingChanges: 3,
  },
  { harness: 'copilot' as const, status: 'never' as const, lastSyncedAt: null, pendingChanges: 0 },
]

const mockStats = {
  totalBackups: 2,
  totalSize: 3072,
  oldestBackup: new Date('2025-06-01'),
  newestBackup: new Date('2025-06-02'),
  byType: [
    { type: 'manual' as const, count: 1 },
    { type: 'auto' as const, count: 1 },
  ],
  byHarness: [{ harness: 'all', count: 2 }],
}

// Mock sync-backup service
vi.mock('@/services/sync-backup', () => ({
  listBackups: vi.fn(() => Promise.resolve(mockBackups)),
  createBackup: vi.fn(() =>
    Promise.resolve({
      id: 'backup-new',
      name: 'New Backup',
      type: 'manual',
      status: 'complete',
      harness: 'all',
      createdAt: new Date(),
      size: 512,
      contents: { skills: 1, hooks: 0, settings: 1, mcpServers: 0, projectContextFiles: 0 },
    })
  ),
  deleteBackup: vi.fn(() => Promise.resolve(true)),
  restoreBackup: vi.fn(() =>
    Promise.resolve({
      success: true,
      backupId: 'backup-001',
      restoredItems: 5,
      skippedItems: 0,
      errors: [],
      duration: 150,
    })
  ),
  getSyncStates: vi.fn(() => Promise.resolve(mockSyncStates)),
  syncHarness: vi.fn(() =>
    Promise.resolve({
      harness: 'cursor',
      status: 'synced',
      lastSyncedAt: new Date(),
      pendingChanges: 0,
    })
  ),
  syncAll: vi.fn(() =>
    Promise.resolve(
      mockSyncStates.map((s) => ({
        ...s,
        status: s.status === 'never' ? 'never' : 'synced',
        pendingChanges: 0,
      }))
    )
  ),
  getBackupStats: vi.fn(() => Promise.resolve(mockStats)),
  runRotation: vi.fn(() => Promise.resolve({ deleted: 1, remaining: 3 })),
}))

describe('SyncBackupPage', () => {
  beforeEach(() => {
    useSyncBackupStore.setState({
      backups: [],
      selectedBackupId: null,
      syncStates: [],
      rotationConfig: null,
      stats: null,
      lastRestoreResult: null,
      isLoadingBackups: false,
      isCreatingBackup: false,
      isRestoring: false,
      isSyncing: false,
      isRotating: false,
      message: null,
    })
  })

  describe('initial rendering', () => {
    it('should render the page header', async () => {
      render(<SyncBackupPage />)
      expect(screen.getByText('Sync & Backup')).toBeInTheDocument()
      expect(screen.getByText('Manage configuration backups and sync status')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<SyncBackupPage />)
      expect(screen.getByText('Rotate')).toBeInTheDocument()
      expect(screen.getByText('Refresh')).toBeInTheDocument()
      expect(screen.getByText('New Backup')).toBeInTheDocument()
    })

    it('should load and display backups', async () => {
      render(<SyncBackupPage />)
      await waitFor(() => {
        expect(screen.getByText('Full Backup')).toBeInTheDocument()
        expect(screen.getByText('Cursor Backup')).toBeInTheDocument()
      })
    })

    it('should load and display sync states', async () => {
      render(<SyncBackupPage />)
      await waitFor(() => {
        expect(screen.getByText('Sync Status')).toBeInTheDocument()
        expect(screen.getByText('Sync All')).toBeInTheDocument()
      })
    })

    it('should display backup stats', async () => {
      render(<SyncBackupPage />)
      await waitFor(() => {
        expect(screen.getByText('Backup Stats')).toBeInTheDocument()
        expect(screen.getByText('Total Backups')).toBeInTheDocument()
      })
    })
  })

  describe('backup selection', () => {
    it('should select a backup on click', async () => {
      render(<SyncBackupPage />)
      await waitFor(() => screen.getByText('Full Backup'))

      fireEvent.click(screen.getByText('Full Backup'))
      expect(useSyncBackupStore.getState().selectedBackupId).toBe('backup-001')
    })

    it('should show restore and delete buttons when a backup is selected', async () => {
      render(<SyncBackupPage />)
      await waitFor(() => screen.getByText('Full Backup'))

      fireEvent.click(screen.getByText('Full Backup'))

      await waitFor(() => {
        expect(screen.getByText('Restore')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })
    })
  })

  describe('create backup dialog', () => {
    it('should open create dialog when New Backup is clicked', async () => {
      render(<SyncBackupPage />)

      fireEvent.click(screen.getByText('New Backup'))

      await waitFor(() => {
        expect(screen.getByText('Create a new backup of your configurations')).toBeInTheDocument()
        expect(screen.getByText('All Harnesses')).toBeInTheDocument()
      })
    })
  })

  describe('message banner', () => {
    it('should display a message banner when message is set', async () => {
      useSyncBackupStore.getState().setMessage('Test banner message')
      render(<SyncBackupPage />)

      expect(screen.getByText('Test banner message')).toBeInTheDocument()
      expect(screen.getByText('Dismiss')).toBeInTheDocument()
    })

    it('should dismiss message on Dismiss click', async () => {
      useSyncBackupStore.getState().setMessage('To dismiss')
      render(<SyncBackupPage />)

      fireEvent.click(screen.getByText('Dismiss'))
      expect(useSyncBackupStore.getState().message).toBeNull()
    })
  })

  describe('sync actions', () => {
    it('should show Sync All button in sync panel', async () => {
      render(<SyncBackupPage />)
      await waitFor(() => {
        expect(screen.getByText('Sync All')).toBeInTheDocument()
      })
    })
  })

  describe('backup count display', () => {
    it('should show backup count in header', async () => {
      render(<SyncBackupPage />)
      await waitFor(() => {
        expect(screen.getByText('Backups (2)')).toBeInTheDocument()
      })
    })
  })
})
