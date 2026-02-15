/**
 * NotificationsPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationsPage } from './NotificationsPage'
import { useNotificationsStore } from '@/stores/notifications-store'

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

const mockNotifications = [
  {
    id: 'notif-001',
    category: 'hook-failure' as const,
    priority: 'critical' as const,
    title: 'Pre-commit hook failed',
    message: 'Hook failed with exit code 1',
    read: false,
    createdAt: new Date('2025-06-14T12:00:00'),
    harness: 'claude-code' as const,
    actionLabel: 'View Hook Logs',
    actionTarget: 'hook-testing',
  },
  {
    id: 'notif-002',
    category: 'sync-conflict' as const,
    priority: 'high' as const,
    title: 'Sync conflict detected',
    message: 'Manual resolution required',
    read: true,
    createdAt: new Date('2025-06-14T10:00:00'),
    harness: 'cursor' as const,
  },
  {
    id: 'notif-003',
    category: 'backup' as const,
    priority: 'low' as const,
    title: 'Backup completed',
    message: 'Auto-backup finished successfully',
    read: true,
    createdAt: new Date('2025-06-14T08:00:00'),
  },
]

const mockStats = {
  total: 3,
  unread: 1,
  byCategory: [
    { category: 'hook-failure' as const, count: 1 },
    { category: 'sync-conflict' as const, count: 1 },
    { category: 'backup' as const, count: 1 },
  ],
  byPriority: [
    { priority: 'critical' as const, count: 1 },
    { priority: 'high' as const, count: 1 },
    { priority: 'low' as const, count: 1 },
  ],
}

const mockPreferences = {
  desktopEnabled: false,
  soundEnabled: true,
  toastDurationMs: 5000,
  toastCategories: ['hook-failure' as const, 'sync-conflict' as const],
  desktopMinPriority: 'high' as const,
  maxHistory: 100,
}

// Mock notifications service
vi.mock('@/services/notifications', () => ({
  getNotifications: vi.fn(() => Promise.resolve(mockNotifications)),
  getNotification: vi.fn(() => Promise.resolve(mockNotifications[0])),
  markAsRead: vi.fn(() => Promise.resolve(true)),
  markAllAsRead: vi.fn(() => Promise.resolve(1)),
  deleteNotification: vi.fn(() => Promise.resolve(true)),
  clearAllNotifications: vi.fn(() => Promise.resolve()),
  getUnreadCount: vi.fn(() => Promise.resolve(1)),
  getNotificationStats: vi.fn(() => Promise.resolve(mockStats)),
  getNotificationPreferences: vi.fn(() => Promise.resolve(mockPreferences)),
  updateNotificationPreferences: vi.fn((updates: Record<string, unknown>) =>
    Promise.resolve({ ...mockPreferences, ...updates })
  ),
  requestDesktopPermission: vi.fn(() => Promise.resolve('granted')),
  sendDesktopNotification: vi.fn(() => Promise.resolve(true)),
}))

describe('NotificationsPage', () => {
  beforeEach(() => {
    useNotificationsStore.setState({
      notifications: [],
      unreadCount: 0,
      stats: null,
      preferences: null,
      filterCategory: null,
      filterPriority: null,
      filterUnreadOnly: false,
      isLoading: false,
      isUpdatingPreferences: false,
      message: null,
    })
  })

  describe('initial rendering', () => {
    it('should render the page header', () => {
      render(<NotificationsPage />)
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('Alerts, events, and system notifications')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<NotificationsPage />)
      expect(screen.getByText('Preferences')).toBeInTheDocument()
      expect(screen.getByText('Mark All Read')).toBeInTheDocument()
      expect(screen.getByText('Refresh')).toBeInTheDocument()
      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })

    it('should load and display notifications', async () => {
      render(<NotificationsPage />)
      await waitFor(() => {
        expect(screen.getByText('Pre-commit hook failed')).toBeInTheDocument()
        expect(screen.getByText('Sync conflict detected')).toBeInTheDocument()
        expect(screen.getByText('Backup completed')).toBeInTheDocument()
      })
    })

    it('should display filter panel', async () => {
      render(<NotificationsPage />)
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument()
        expect(screen.getByText('Category')).toBeInTheDocument()
        expect(screen.getByText('Priority')).toBeInTheDocument()
      })
    })

    it('should display stats', async () => {
      render(<NotificationsPage />)
      await waitFor(() => {
        expect(screen.getByText('Summary')).toBeInTheDocument()
        expect(screen.getByText('Total')).toBeInTheDocument()
        expect(screen.getByText('Unread')).toBeInTheDocument()
      })
    })
  })

  describe('notification count', () => {
    it('should show notification count in header', async () => {
      render(<NotificationsPage />)
      await waitFor(() => {
        expect(screen.getByText('Notifications (3)')).toBeInTheDocument()
      })
    })
  })

  describe('filter buttons', () => {
    it('should have category filter buttons', async () => {
      render(<NotificationsPage />)
      await waitFor(() => {
        expect(screen.getByText('Hook Failure')).toBeInTheDocument()
        expect(screen.getByText('Sync Conflict')).toBeInTheDocument()
        expect(screen.getByText('Backup')).toBeInTheDocument()
      })
    })

    it('should have priority filter buttons', async () => {
      render(<NotificationsPage />)
      await waitFor(() => {
        // Priority buttons in filter panel - these are lowercase labels
        const criticalButtons = screen.getAllByText('Critical')
        expect(criticalButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('message banner', () => {
    it('should display a message when set', () => {
      useNotificationsStore.getState().setMessage('Test message')
      render(<NotificationsPage />)
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should dismiss message on click', () => {
      useNotificationsStore.getState().setMessage('Dismiss me')
      render(<NotificationsPage />)
      fireEvent.click(screen.getByText('Dismiss'))
      expect(useNotificationsStore.getState().message).toBeNull()
    })
  })

  describe('preferences dialog', () => {
    it('should open preferences dialog', async () => {
      render(<NotificationsPage />)
      await waitFor(() => screen.getByText('Preferences'))

      fireEvent.click(screen.getByText('Preferences'))

      await waitFor(() => {
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument()
        expect(screen.getByText('Desktop Notifications')).toBeInTheDocument()
        expect(screen.getByText('Sound')).toBeInTheDocument()
      })
    })
  })

  describe('notification actions', () => {
    it('should show action labels on notifications', async () => {
      render(<NotificationsPage />)
      await waitFor(() => {
        expect(screen.getByText('View Hook Logs')).toBeInTheDocument()
      })
    })
  })
})
