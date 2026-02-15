/**
 * NotificationsPage Component
 * Notification history, filtering, preferences, and management
 */

import { useEffect, useCallback } from 'react'
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  ArrowRight,
  Filter,
  Settings2,
  Webhook,
  CloudOff,
  Archive,
  ArrowLeftRight,
  Monitor,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useNotificationsStore } from '@/stores/notifications-store'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  getNotificationStats,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/notifications'
import type {
  Notification,
  NotificationCategory,
  NotificationPriority,
  NotificationPreferences,
} from '@/services/notifications'
import { useState } from 'react'

// ============================================
// Category config
// ============================================

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { label: string; icon: typeof Bell; className: string }
> = {
  'hook-failure': { label: 'Hook Failure', icon: Webhook, className: 'text-red-500' },
  'sync-conflict': { label: 'Sync Conflict', icon: CloudOff, className: 'text-amber-500' },
  backup: { label: 'Backup', icon: Archive, className: 'text-blue-500' },
  migration: { label: 'Migration', icon: ArrowLeftRight, className: 'text-violet-500' },
  system: { label: 'System', icon: Monitor, className: 'text-muted-foreground' },
  security: { label: 'Security', icon: ShieldAlert, className: 'text-red-600' },
}

const PRIORITY_CONFIG: Record<
  NotificationPriority,
  { label: string; icon: typeof Info; className: string; badgeClass: string }
> = {
  low: {
    label: 'Low',
    icon: Info,
    className: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground',
  },
  medium: {
    label: 'Medium',
    icon: Info,
    className: 'text-blue-500',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  high: {
    label: 'High',
    icon: AlertTriangle,
    className: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  critical: {
    label: 'Critical',
    icon: AlertCircle,
    className: 'text-red-500',
    badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
}

const ALL_CATEGORIES: NotificationCategory[] = [
  'hook-failure',
  'sync-conflict',
  'backup',
  'migration',
  'system',
  'security',
]

const ALL_PRIORITIES: NotificationPriority[] = ['critical', 'high', 'medium', 'low']

// ============================================
// Sub-components
// ============================================

function CategoryBadge({ category }: { category: NotificationCategory }) {
  const config = CATEGORY_CONFIG[category]
  const Icon = config.icon
  return (
    <div className="flex items-center gap-1">
      <Icon className={cn('h-3 w-3', config.className)} />
      <span className="text-[10px] text-muted-foreground">{config.label}</span>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: NotificationPriority }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', config.badgeClass)}>
      {config.label}
    </span>
  )
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        !notification.read ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <div className="mt-1.5 shrink-0">
          {!notification.read ? (
            <div className="h-2 w-2 rounded-full bg-primary" />
          ) : (
            <div className="h-2 w-2" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', !notification.read && 'text-foreground')}>
              {notification.title}
            </span>
            <PriorityBadge priority={notification.priority} />
            <CategoryBadge category={notification.category} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{notification.message}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {notification.harness && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {notification.harness}
              </span>
            )}
            {notification.actionLabel && (
              <button className="flex items-center gap-0.5 text-[10px] text-primary hover:underline">
                {notification.actionLabel}
                <ArrowRight className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onMarkRead(notification.id)}
              title="Mark as read"
            >
              <CheckCheck className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(notification.id)}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function PreferencesDialog({
  open,
  onClose,
  preferences,
  onUpdate,
  isUpdating,
}: {
  open: boolean
  onClose: () => void
  preferences: NotificationPreferences | null
  onUpdate: (updates: Partial<NotificationPreferences>) => void
  isUpdating: boolean
}) {
  if (!preferences) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>Configure how you receive notifications</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Desktop Notifications</p>
              <p className="text-xs text-muted-foreground">
                Show system notifications for important events
              </p>
            </div>
            <Button
              variant={preferences.desktopEnabled ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ desktopEnabled: !preferences.desktopEnabled })}
              disabled={isUpdating}
            >
              {preferences.desktopEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sound</p>
              <p className="text-xs text-muted-foreground">Play a sound for new notifications</p>
            </div>
            <Button
              variant={preferences.soundEnabled ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ soundEnabled: !preferences.soundEnabled })}
              disabled={isUpdating}
            >
              {preferences.soundEnabled ? 'On' : 'Off'}
            </Button>
          </div>

          <div>
            <p className="text-sm font-medium">Toast Duration</p>
            <p className="text-xs text-muted-foreground">
              How long toast notifications stay visible
            </p>
            <div className="mt-1.5 flex gap-1.5">
              {[3000, 5000, 8000, 0].map((ms) => (
                <Button
                  key={ms}
                  variant={preferences.toastDurationMs === ms ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onUpdate({ toastDurationMs: ms })}
                  disabled={isUpdating}
                >
                  {ms === 0 ? 'Persistent' : `${ms / 1000}s`}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Desktop Priority Threshold</p>
            <p className="text-xs text-muted-foreground">
              Minimum priority for desktop notifications
            </p>
            <div className="mt-1.5 flex gap-1.5">
              {ALL_PRIORITIES.map((p) => (
                <Button
                  key={p}
                  variant={preferences.desktopMinPriority === p ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => onUpdate({ desktopMinPriority: p })}
                  disabled={isUpdating}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Page
// ============================================

export function NotificationsPage() {
  const notifications = useNotificationsStore((s) => s.notifications)
  const unreadCount = useNotificationsStore((s) => s.unreadCount)
  const stats = useNotificationsStore((s) => s.stats)
  const preferences = useNotificationsStore((s) => s.preferences)
  const filterCategory = useNotificationsStore((s) => s.filterCategory)
  const filterPriority = useNotificationsStore((s) => s.filterPriority)
  const filterUnreadOnly = useNotificationsStore((s) => s.filterUnreadOnly)
  const isLoading = useNotificationsStore((s) => s.isLoading)
  const isUpdatingPreferences = useNotificationsStore((s) => s.isUpdatingPreferences)
  const message = useNotificationsStore((s) => s.message)

  const setNotifications = useNotificationsStore((s) => s.setNotifications)
  const storeMarkRead = useNotificationsStore((s) => s.markRead)
  const storeMarkAllRead = useNotificationsStore((s) => s.markAllRead)
  const removeNotification = useNotificationsStore((s) => s.removeNotification)
  const storeClearAll = useNotificationsStore((s) => s.clearAll)
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount)
  const setStats = useNotificationsStore((s) => s.setStats)
  const setPreferences = useNotificationsStore((s) => s.setPreferences)
  const setFilterCategory = useNotificationsStore((s) => s.setFilterCategory)
  const setFilterPriority = useNotificationsStore((s) => s.setFilterPriority)
  const setFilterUnreadOnly = useNotificationsStore((s) => s.setFilterUnreadOnly)
  const setIsLoading = useNotificationsStore((s) => s.setIsLoading)
  const setIsUpdatingPreferences = useNotificationsStore((s) => s.setIsUpdatingPreferences)
  const setMessage = useNotificationsStore((s) => s.setMessage)

  const [showPreferences, setShowPreferences] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [notifList, count, notifStats, prefs] = await Promise.all([
        getNotifications({
          category: filterCategory ?? undefined,
          priority: filterPriority ?? undefined,
          unreadOnly: filterUnreadOnly,
        }),
        getUnreadCount(),
        getNotificationStats(),
        getNotificationPreferences(),
      ])
      setNotifications(notifList)
      setUnreadCount(count)
      setStats(notifStats)
      setPreferences(prefs)
    } finally {
      setIsLoading(false)
    }
  }, [
    filterCategory,
    filterPriority,
    filterUnreadOnly,
    setNotifications,
    setUnreadCount,
    setStats,
    setPreferences,
    setIsLoading,
  ])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handlers
  const handleMarkRead = useCallback(
    async (id: string) => {
      await markAsRead(id)
      storeMarkRead(id)
    },
    [storeMarkRead]
  )

  const handleMarkAllRead = useCallback(async () => {
    const count = await markAllAsRead()
    storeMarkAllRead()
    setMessage(`Marked ${count} notifications as read`)
  }, [storeMarkAllRead, setMessage])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteNotification(id)
      removeNotification(id)
    },
    [removeNotification]
  )

  const handleClearAll = useCallback(async () => {
    await clearAllNotifications()
    storeClearAll()
    setMessage('All notifications cleared')
  }, [storeClearAll, setMessage])

  const handleUpdatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      setIsUpdatingPreferences(true)
      try {
        const updated = await updateNotificationPreferences(updates)
        setPreferences(updated)
        setMessage('Preferences updated')
      } finally {
        setIsUpdatingPreferences(false)
      }
    },
    [setPreferences, setIsUpdatingPreferences, setMessage]
  )

  // Filtered notifications (already filtered from service, but we show count)
  const filteredNotifications = notifications

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              Alerts, events, and system notifications
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)}>
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Preferences
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Message banner */}
      {message && (
        <div className="flex items-center gap-2 border-b bg-muted/50 px-6 py-2">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{message}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 px-2 text-xs"
            onClick={() => setMessage(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Left: Filters + Stats */}
          <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Filters</h3>
              </div>

              {/* Category filter */}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Category</p>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={filterCategory === null ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-6 text-[10px]"
                    onClick={() => setFilterCategory(null)}
                  >
                    All
                  </Button>
                  {ALL_CATEGORIES.map((cat) => {
                    const config = CATEGORY_CONFIG[cat]
                    return (
                      <Button
                        key={cat}
                        variant={filterCategory === cat ? 'secondary' : 'outline'}
                        size="sm"
                        className="h-6 text-[10px]"
                        onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                      >
                        {config.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Priority filter */}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Priority</p>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={filterPriority === null ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-6 text-[10px]"
                    onClick={() => setFilterPriority(null)}
                  >
                    All
                  </Button>
                  {ALL_PRIORITIES.map((p) => (
                    <Button
                      key={p}
                      variant={filterPriority === p ? 'secondary' : 'outline'}
                      size="sm"
                      className="h-6 text-[10px] capitalize"
                      onClick={() => setFilterPriority(filterPriority === p ? null : p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Unread only toggle */}
              <div className="mt-3">
                <Button
                  variant={filterUnreadOnly ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-7 text-xs w-full"
                  onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                >
                  {filterUnreadOnly ? 'Showing Unread Only' : 'Show All'}
                </Button>
              </div>
            </Card>

            {/* Stats */}
            {stats && (
              <Card className="p-4">
                <h3 className="text-sm font-medium">Summary</h3>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-medium text-foreground">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unread</span>
                    <span className="font-medium text-foreground">{stats.unread}</span>
                  </div>
                  <div className="mt-2 border-t pt-2">
                    <p className="text-[10px] font-medium text-foreground mb-1">By Category</p>
                    {stats.byCategory.map(({ category, count }) => (
                      <div key={category} className="flex justify-between">
                        <span>{CATEGORY_CONFIG[category].label}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 border-t pt-2">
                    <p className="text-[10px] font-medium text-foreground mb-1">By Priority</p>
                    {stats.byPriority.map(({ priority, count }) => (
                      <div key={priority} className="flex justify-between capitalize">
                        <span>{priority}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Notification list */}
          <div className="col-span-3">
            <h3 className="mb-3 text-sm font-medium">
              Notifications ({filteredNotifications.length})
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="mb-2 h-8 w-8" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs">
                  {filterCategory || filterPriority || filterUnreadOnly
                    ? 'Try adjusting your filters'
                    : "You're all caught up!"}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preferences dialog */}
      <PreferencesDialog
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
        preferences={preferences}
        onUpdate={handleUpdatePreferences}
        isUpdating={isUpdatingPreferences}
      />
    </div>
  )
}
