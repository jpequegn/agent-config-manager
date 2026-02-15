/**
 * Notifications Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  getNotificationStats,
  getNotificationPreferences,
  updateNotificationPreferences,
  requestDesktopPermission,
  sendDesktopNotification,
} from './service'

describe('Notifications Service', () => {
  describe('getNotifications', () => {
    it('should return notifications sorted by date (newest first)', async () => {
      const notifications = await getNotifications()
      expect(notifications.length).toBeGreaterThan(0)
      for (let i = 1; i < notifications.length; i++) {
        expect(notifications[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
          notifications[i].createdAt.getTime()
        )
      }
    })

    it('should include all notification fields', async () => {
      const notifications = await getNotifications()
      for (const n of notifications) {
        expect(n.id).toBeTruthy()
        expect(n.category).toBeTruthy()
        expect(n.priority).toBeTruthy()
        expect(n.title).toBeTruthy()
        expect(n.message).toBeTruthy()
        expect(typeof n.read).toBe('boolean')
      }
    })

    it('should filter by category', async () => {
      const notifications = await getNotifications({ category: 'hook-failure' })
      for (const n of notifications) {
        expect(n.category).toBe('hook-failure')
      }
    })

    it('should filter by priority', async () => {
      const notifications = await getNotifications({ priority: 'critical' })
      for (const n of notifications) {
        expect(n.priority).toBe('critical')
      }
    })

    it('should filter unread only', async () => {
      const notifications = await getNotifications({ unreadOnly: true })
      for (const n of notifications) {
        expect(n.read).toBe(false)
      }
    })
  })

  describe('getNotification', () => {
    it('should return a specific notification', async () => {
      const notif = await getNotification('notif-001')
      expect(notif).not.toBeNull()
      expect(notif!.id).toBe('notif-001')
      expect(notif!.title).toBe('Pre-commit hook failed')
    })

    it('should return null for unknown ID', async () => {
      const notif = await getNotification('nonexistent')
      expect(notif).toBeNull()
    })
  })

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const result = await markAsRead('notif-001')
      expect(result).toBe(true)
      const notif = await getNotification('notif-001')
      expect(notif!.read).toBe(true)
    })

    it('should return false for unknown ID', async () => {
      const result = await markAsRead('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const count = await markAllAsRead()
      expect(typeof count).toBe('number')
      const unread = await getUnreadCount()
      expect(unread).toBe(0)
    })
  })

  describe('deleteNotification', () => {
    it('should delete an existing notification', async () => {
      const before = await getNotifications()
      const countBefore = before.length
      const result = await deleteNotification('notif-010')
      expect(result).toBe(true)
      const after = await getNotifications()
      expect(after.length).toBe(countBefore - 1)
    })

    it('should return false for unknown ID', async () => {
      const result = await deleteNotification('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('getUnreadCount', () => {
    it('should return a number', async () => {
      const count = await getUnreadCount()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getNotificationStats', () => {
    it('should return aggregate stats', async () => {
      const stats = await getNotificationStats()
      expect(stats.total).toBeGreaterThan(0)
      expect(typeof stats.unread).toBe('number')
      expect(stats.byCategory.length).toBeGreaterThan(0)
      expect(stats.byPriority.length).toBeGreaterThan(0)
    })
  })

  describe('getNotificationPreferences', () => {
    it('should return preferences', async () => {
      const prefs = await getNotificationPreferences()
      expect(typeof prefs.desktopEnabled).toBe('boolean')
      expect(typeof prefs.soundEnabled).toBe('boolean')
      expect(prefs.toastDurationMs).toBeGreaterThanOrEqual(0)
      expect(prefs.toastCategories.length).toBeGreaterThan(0)
      expect(prefs.maxHistory).toBeGreaterThan(0)
    })
  })

  describe('updateNotificationPreferences', () => {
    it('should update preferences', async () => {
      const prefs = await updateNotificationPreferences({ desktopEnabled: true })
      expect(prefs.desktopEnabled).toBe(true)
    })

    it('should preserve other preferences when updating one', async () => {
      const before = await getNotificationPreferences()
      const after = await updateNotificationPreferences({ soundEnabled: false })
      expect(after.soundEnabled).toBe(false)
      expect(after.maxHistory).toBe(before.maxHistory)
    })
  })

  describe('requestDesktopPermission', () => {
    it('should return a permission status', async () => {
      const result = await requestDesktopPermission()
      expect(['granted', 'denied', 'default']).toContain(result)
    })
  })

  describe('sendDesktopNotification', () => {
    it('should return a boolean', async () => {
      const result = await sendDesktopNotification('Test', 'Test body')
      expect(typeof result).toBe('boolean')
    })
  })

  describe('clearAllNotifications', () => {
    it('should clear all notifications', async () => {
      await clearAllNotifications()
      const notifications = await getNotifications()
      expect(notifications.length).toBe(0)
    })
  })
})
