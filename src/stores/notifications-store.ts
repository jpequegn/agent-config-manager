/**
 * Notifications Store
 * Manages notification list, unread count, filters, and preferences
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  Notification,
  NotificationCategory,
  NotificationPriority,
  NotificationPreferences,
  NotificationStats,
} from '@/services/notifications'

/** Store state */
interface NotificationsState {
  /** All notifications */
  notifications: Notification[]
  /** Unread count */
  unreadCount: number
  /** Stats */
  stats: NotificationStats | null
  /** Preferences */
  preferences: NotificationPreferences | null
  /** Filter: category */
  filterCategory: NotificationCategory | null
  /** Filter: priority */
  filterPriority: NotificationPriority | null
  /** Filter: unread only */
  filterUnreadOnly: boolean
  /** Loading states */
  isLoading: boolean
  isUpdatingPreferences: boolean
  /** Status message */
  message: string | null
}

/** Store actions */
interface NotificationsActions {
  setNotifications: (notifications: Notification[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  setUnreadCount: (count: number) => void
  setStats: (stats: NotificationStats | null) => void
  setPreferences: (prefs: NotificationPreferences) => void
  setFilterCategory: (category: NotificationCategory | null) => void
  setFilterPriority: (priority: NotificationPriority | null) => void
  setFilterUnreadOnly: (unreadOnly: boolean) => void
  setIsLoading: (v: boolean) => void
  setIsUpdatingPreferences: (v: boolean) => void
  setMessage: (msg: string | null) => void
}

type NotificationsStore = NotificationsState & NotificationsActions

const initialState: NotificationsState = {
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
}

export const useNotificationsStore = create<NotificationsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setNotifications: (notifications) => set({ notifications }, false, 'setNotifications'),

      markRead: (id) =>
        set(
          (s) => ({
            notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            unreadCount: Math.max(
              0,
              s.unreadCount - (s.notifications.find((n) => n.id === id && !n.read) ? 1 : 0)
            ),
          }),
          false,
          'markRead'
        ),

      markAllRead: () =>
        set(
          (s) => ({
            notifications: s.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }),
          false,
          'markAllRead'
        ),

      removeNotification: (id) =>
        set(
          (s) => {
            const notif = s.notifications.find((n) => n.id === id)
            return {
              notifications: s.notifications.filter((n) => n.id !== id),
              unreadCount: notif && !notif.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
            }
          },
          false,
          'removeNotification'
        ),

      clearAll: () => set({ notifications: [], unreadCount: 0 }, false, 'clearAll'),

      setUnreadCount: (count) => set({ unreadCount: count }, false, 'setUnreadCount'),

      setStats: (stats) => set({ stats }, false, 'setStats'),

      setPreferences: (preferences) => set({ preferences }, false, 'setPreferences'),

      setFilterCategory: (filterCategory) => set({ filterCategory }, false, 'setFilterCategory'),

      setFilterPriority: (filterPriority) => set({ filterPriority }, false, 'setFilterPriority'),

      setFilterUnreadOnly: (filterUnreadOnly) =>
        set({ filterUnreadOnly }, false, 'setFilterUnreadOnly'),

      setIsLoading: (v) => set({ isLoading: v }, false, 'setIsLoading'),

      setIsUpdatingPreferences: (v) =>
        set({ isUpdatingPreferences: v }, false, 'setIsUpdatingPreferences'),

      setMessage: (msg) => set({ message: msg }, false, 'setMessage'),
    }),
    { name: 'NotificationsStore' }
  )
)

/** Selector hooks */
export const useNotifications = () => useNotificationsStore((s) => s.notifications)
export const useUnreadCount = () => useNotificationsStore((s) => s.unreadCount)
export const useNotificationStats = () => useNotificationsStore((s) => s.stats)
export const useIsNotificationsLoading = () => useNotificationsStore((s) => s.isLoading)
