/**
 * Notifications Service
 * Manages notification events, history, and preferences
 */

import type { HarnessType } from '@/types'

// ============================================
// Types
// ============================================

/** Notification categories */
export type NotificationCategory =
  | 'hook-failure'
  | 'sync-conflict'
  | 'backup'
  | 'migration'
  | 'system'
  | 'security'

/** Priority levels */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

/** A single notification entry */
export interface Notification {
  id: string
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  read: boolean
  createdAt: Date
  /** Related harness, if applicable */
  harness?: HarnessType
  /** Action link / metadata */
  actionLabel?: string
  actionTarget?: string
  /** Additional context */
  metadata?: Record<string, string>
}

/** Notification preferences */
export interface NotificationPreferences {
  /** Enable desktop notifications (Notification API) */
  desktopEnabled: boolean
  /** Enable sound */
  soundEnabled: boolean
  /** Auto-dismiss toasts after ms (0 = no auto-dismiss) */
  toastDurationMs: number
  /** Categories to show as toasts */
  toastCategories: NotificationCategory[]
  /** Minimum priority for desktop notifications */
  desktopMinPriority: NotificationPriority
  /** Maximum notifications to keep in history */
  maxHistory: number
}

/** Summary stats */
export interface NotificationStats {
  total: number
  unread: number
  byCategory: { category: NotificationCategory; count: number }[]
  byPriority: { priority: NotificationPriority; count: number }[]
}

// ============================================
// Mock Data
// ============================================

const now = Date.now()
const HOUR = 3600000
const DAY = 86400000

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    category: 'hook-failure',
    priority: 'critical',
    title: 'Pre-commit hook failed',
    message:
      'The pre-commit lint hook failed with exit code 1. ESLint found 3 errors in src/utils.ts.',
    read: false,
    createdAt: new Date(now - 15 * 60000), // 15 min ago
    harness: 'claude-code',
    actionLabel: 'View Hook Logs',
    actionTarget: 'hook-testing',
  },
  {
    id: 'notif-002',
    category: 'sync-conflict',
    priority: 'high',
    title: 'Sync conflict in .cursorrules',
    message:
      'The .cursorrules file was modified both locally and remotely. Manual resolution required.',
    read: false,
    createdAt: new Date(now - HOUR),
    harness: 'cursor',
    actionLabel: 'Resolve Conflict',
    actionTarget: 'sync-backup',
  },
  {
    id: 'notif-003',
    category: 'backup',
    priority: 'low',
    title: 'Auto-backup completed',
    message:
      'Scheduled backup "Auto Backup 2025-06-14" completed successfully. 24 items backed up (3.2 KB).',
    read: true,
    createdAt: new Date(now - 2 * HOUR),
    actionLabel: 'View Backups',
    actionTarget: 'sync-backup',
  },
  {
    id: 'notif-004',
    category: 'migration',
    priority: 'medium',
    title: 'Migration completed with warnings',
    message:
      'Migration from Claude Code to Cursor completed. 8 items migrated, 2 skipped due to incompatibility.',
    read: false,
    createdAt: new Date(now - 4 * HOUR),
    harness: 'cursor',
    actionLabel: 'View Migration',
    actionTarget: 'migration',
  },
  {
    id: 'notif-005',
    category: 'hook-failure',
    priority: 'high',
    title: 'Post-save hook timeout',
    message:
      'The post-save format hook timed out after 30 seconds. The hook may be stuck or processing a large file.',
    read: true,
    createdAt: new Date(now - 6 * HOUR),
    harness: 'claude-code',
    actionLabel: 'View Hook Logs',
    actionTarget: 'hook-testing',
  },
  {
    id: 'notif-006',
    category: 'system',
    priority: 'low',
    title: 'New harness detected',
    message:
      'Aider configuration files detected in /Users/dev/project. Aider has been added to your active harnesses.',
    read: true,
    createdAt: new Date(now - DAY),
    harness: 'aider',
    actionLabel: 'View Settings',
    actionTarget: 'settings',
  },
  {
    id: 'notif-007',
    category: 'security',
    priority: 'critical',
    title: 'Sensitive data detected in config',
    message:
      'An API key pattern was detected in .cursorrules. Consider moving it to environment variables.',
    read: false,
    createdAt: new Date(now - DAY - 2 * HOUR),
    harness: 'cursor',
    actionLabel: 'View Project Context',
    actionTarget: 'project-context',
    metadata: { file: '.cursorrules', pattern: 'sk-...' },
  },
  {
    id: 'notif-008',
    category: 'sync-conflict',
    priority: 'medium',
    title: 'Copilot instructions outdated',
    message:
      'The .github/copilot-instructions.md file has not been synced for 7 days and may be outdated.',
    read: true,
    createdAt: new Date(now - 2 * DAY),
    harness: 'copilot',
    actionLabel: 'Sync Now',
    actionTarget: 'sync-backup',
  },
  {
    id: 'notif-009',
    category: 'backup',
    priority: 'medium',
    title: 'Backup rotation warning',
    message: 'You have 18 of 20 maximum backups. Consider running rotation to free space.',
    read: false,
    createdAt: new Date(now - 3 * DAY),
    actionLabel: 'Run Rotation',
    actionTarget: 'sync-backup',
  },
  {
    id: 'notif-010',
    category: 'system',
    priority: 'low',
    title: 'Configuration update available',
    message:
      'Cursor has released new configuration options. Visit the settings page to review recommended changes.',
    read: true,
    createdAt: new Date(now - 5 * DAY),
    harness: 'cursor',
    actionLabel: 'View Settings',
    actionTarget: 'settings',
  },
  {
    id: 'notif-011',
    category: 'hook-failure',
    priority: 'high',
    title: 'Multiple hook failures detected',
    message: '3 hooks failed in the last hour. Check your hook configuration for potential issues.',
    read: false,
    createdAt: new Date(now - 30 * 60000),
    harness: 'claude-code',
    actionLabel: 'View Hooks',
    actionTarget: 'hooks',
  },
  {
    id: 'notif-012',
    category: 'migration',
    priority: 'low',
    title: 'Pre-migration backup created',
    message: 'A backup was automatically created before your migration from Cline to Continue.',
    read: true,
    createdAt: new Date(now - 7 * DAY),
    actionLabel: 'View Backups',
    actionTarget: 'sync-backup',
  },
]

// In-memory state
let notifications = [...mockNotifications]

const defaultPreferences: NotificationPreferences = {
  desktopEnabled: false,
  soundEnabled: true,
  toastDurationMs: 5000,
  toastCategories: ['hook-failure', 'sync-conflict', 'security', 'migration'],
  desktopMinPriority: 'high',
  maxHistory: 100,
}

let preferences = { ...defaultPreferences }

// ============================================
// Service Functions
// ============================================

/** Simulated async delay */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Get all notifications, optionally filtered */
export async function getNotifications(opts?: {
  category?: NotificationCategory
  priority?: NotificationPriority
  unreadOnly?: boolean
}): Promise<Notification[]> {
  await delay(150)
  let result = [...notifications]

  if (opts?.category) {
    result = result.filter((n) => n.category === opts.category)
  }
  if (opts?.priority) {
    result = result.filter((n) => n.priority === opts.priority)
  }
  if (opts?.unreadOnly) {
    result = result.filter((n) => !n.read)
  }

  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/** Get a single notification */
export async function getNotification(id: string): Promise<Notification | null> {
  await delay(80)
  return notifications.find((n) => n.id === id) ?? null
}

/** Mark a notification as read */
export async function markAsRead(id: string): Promise<boolean> {
  await delay(80)
  const notif = notifications.find((n) => n.id === id)
  if (!notif) return false
  notif.read = true
  return true
}

/** Mark all notifications as read */
export async function markAllAsRead(): Promise<number> {
  await delay(200)
  let count = 0
  for (const n of notifications) {
    if (!n.read) {
      n.read = true
      count++
    }
  }
  return count
}

/** Delete a notification */
export async function deleteNotification(id: string): Promise<boolean> {
  await delay(100)
  const idx = notifications.findIndex((n) => n.id === id)
  if (idx < 0) return false
  notifications.splice(idx, 1)
  return true
}

/** Clear all notifications */
export async function clearAllNotifications(): Promise<void> {
  await delay(200)
  notifications = []
}

/** Get unread count */
export async function getUnreadCount(): Promise<number> {
  await delay(50)
  return notifications.filter((n) => !n.read).length
}

/** Get notification stats */
export async function getNotificationStats(): Promise<NotificationStats> {
  await delay(100)

  const categoryMap = new Map<NotificationCategory, number>()
  const priorityMap = new Map<NotificationPriority, number>()
  let unread = 0

  for (const n of notifications) {
    categoryMap.set(n.category, (categoryMap.get(n.category) ?? 0) + 1)
    priorityMap.set(n.priority, (priorityMap.get(n.priority) ?? 0) + 1)
    if (!n.read) unread++
  }

  return {
    total: notifications.length,
    unread,
    byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    })),
    byPriority: Array.from(priorityMap.entries()).map(([priority, count]) => ({
      priority,
      count,
    })),
  }
}

/** Get notification preferences */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  await delay(80)
  return { ...preferences }
}

/** Update notification preferences */
export async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  await delay(150)
  preferences = { ...preferences, ...updates }
  return { ...preferences }
}

/** Request desktop notification permission (mocked) */
export async function requestDesktopPermission(): Promise<'granted' | 'denied' | 'default'> {
  await delay(300)
  // Mock: always grant
  return 'granted'
}

/** Send a desktop notification (mocked) */
export async function sendDesktopNotification(title: string, body: string): Promise<boolean> {
  await delay(100)
  // In a real implementation, this would use the Notification API
  console.log(`[Desktop Notification] ${title}: ${body}`)
  return preferences.desktopEnabled
}
