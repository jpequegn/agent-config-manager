/**
 * Notifications Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationsStore } from './notifications-store'
import type { Notification } from '@/services/notifications'

const mockNotif: Notification = {
  id: 'n-1',
  category: 'hook-failure',
  priority: 'high',
  title: 'Test Notification',
  message: 'Test message',
  read: false,
  createdAt: new Date(),
}

const mockNotif2: Notification = {
  id: 'n-2',
  category: 'sync-conflict',
  priority: 'medium',
  title: 'Another Notification',
  message: 'Another message',
  read: true,
  createdAt: new Date(),
}

describe('NotificationsStore', () => {
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

  it('should start with initial state', () => {
    const state = useNotificationsStore.getState()
    expect(state.notifications).toEqual([])
    expect(state.unreadCount).toBe(0)
    expect(state.filterCategory).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.message).toBeNull()
  })

  it('should set notifications', () => {
    useNotificationsStore.getState().setNotifications([mockNotif, mockNotif2])
    expect(useNotificationsStore.getState().notifications).toHaveLength(2)
  })

  it('should mark a notification as read', () => {
    useNotificationsStore.getState().setNotifications([mockNotif])
    useNotificationsStore.getState().setUnreadCount(1)
    useNotificationsStore.getState().markRead('n-1')
    expect(useNotificationsStore.getState().notifications[0].read).toBe(true)
    expect(useNotificationsStore.getState().unreadCount).toBe(0)
  })

  it('should not decrement unread count for already-read notifications', () => {
    useNotificationsStore.getState().setNotifications([mockNotif2])
    useNotificationsStore.getState().setUnreadCount(0)
    useNotificationsStore.getState().markRead('n-2')
    expect(useNotificationsStore.getState().unreadCount).toBe(0)
  })

  it('should mark all as read', () => {
    useNotificationsStore.getState().setNotifications([mockNotif, mockNotif2])
    useNotificationsStore.getState().setUnreadCount(1)
    useNotificationsStore.getState().markAllRead()
    const notifs = useNotificationsStore.getState().notifications
    expect(notifs.every((n) => n.read)).toBe(true)
    expect(useNotificationsStore.getState().unreadCount).toBe(0)
  })

  it('should remove a notification', () => {
    useNotificationsStore.getState().setNotifications([mockNotif, mockNotif2])
    useNotificationsStore.getState().setUnreadCount(1)
    useNotificationsStore.getState().removeNotification('n-1')
    expect(useNotificationsStore.getState().notifications).toHaveLength(1)
    expect(useNotificationsStore.getState().unreadCount).toBe(0)
  })

  it('should not decrement unread when removing a read notification', () => {
    useNotificationsStore.getState().setNotifications([mockNotif2])
    useNotificationsStore.getState().setUnreadCount(0)
    useNotificationsStore.getState().removeNotification('n-2')
    expect(useNotificationsStore.getState().unreadCount).toBe(0)
  })

  it('should clear all', () => {
    useNotificationsStore.getState().setNotifications([mockNotif, mockNotif2])
    useNotificationsStore.getState().setUnreadCount(1)
    useNotificationsStore.getState().clearAll()
    expect(useNotificationsStore.getState().notifications).toHaveLength(0)
    expect(useNotificationsStore.getState().unreadCount).toBe(0)
  })

  it('should set filter category', () => {
    useNotificationsStore.getState().setFilterCategory('hook-failure')
    expect(useNotificationsStore.getState().filterCategory).toBe('hook-failure')
  })

  it('should set filter priority', () => {
    useNotificationsStore.getState().setFilterPriority('critical')
    expect(useNotificationsStore.getState().filterPriority).toBe('critical')
  })

  it('should set filter unread only', () => {
    useNotificationsStore.getState().setFilterUnreadOnly(true)
    expect(useNotificationsStore.getState().filterUnreadOnly).toBe(true)
  })

  it('should set loading flags', () => {
    useNotificationsStore.getState().setIsLoading(true)
    expect(useNotificationsStore.getState().isLoading).toBe(true)

    useNotificationsStore.getState().setIsUpdatingPreferences(true)
    expect(useNotificationsStore.getState().isUpdatingPreferences).toBe(true)
  })

  it('should set and clear message', () => {
    useNotificationsStore.getState().setMessage('Test')
    expect(useNotificationsStore.getState().message).toBe('Test')

    useNotificationsStore.getState().setMessage(null)
    expect(useNotificationsStore.getState().message).toBeNull()
  })

  it('should set preferences', () => {
    useNotificationsStore.getState().setPreferences({
      desktopEnabled: true,
      soundEnabled: false,
      toastDurationMs: 3000,
      toastCategories: ['hook-failure'],
      desktopMinPriority: 'high',
      maxHistory: 50,
    })
    expect(useNotificationsStore.getState().preferences!.desktopEnabled).toBe(true)
    expect(useNotificationsStore.getState().preferences!.soundEnabled).toBe(false)
  })

  it('should set stats', () => {
    useNotificationsStore.getState().setStats({
      total: 10,
      unread: 3,
      byCategory: [{ category: 'hook-failure', count: 5 }],
      byPriority: [{ priority: 'high', count: 4 }],
    })
    expect(useNotificationsStore.getState().stats!.total).toBe(10)
    expect(useNotificationsStore.getState().stats!.unread).toBe(3)
  })
})
