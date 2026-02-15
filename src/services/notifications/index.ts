/**
 * Notifications Service
 * Exports notification management functions and types
 */

export type {
  NotificationCategory,
  NotificationPriority,
  Notification,
  NotificationPreferences,
  NotificationStats,
} from './service'

export {
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
