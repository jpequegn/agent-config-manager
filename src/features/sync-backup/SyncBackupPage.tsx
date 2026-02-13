/**
 * SyncBackupPage Component
 * Config backup management, restore, sync status, and rotation settings
 */

import { useEffect, useCallback, useState } from 'react'
import {
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  Loader2,
  Download,
  Settings2,
  CloudOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatBytes, formatRelativeTime } from '@/lib/utils'
import { useSyncBackupStore } from '@/stores/sync-backup-store'
import { HarnessIcon } from '@/components/harness/HarnessIcon'
import { getHarnessConfig, getAllHarnessTypes } from '@/components/harness'
import {
  listBackups,
  createBackup as createBackupService,
  deleteBackup as deleteBackupService,
  restoreBackup as restoreBackupService,
  getSyncStates,
  syncHarness,
  syncAll,
  getBackupStats,
  runRotation,
} from '@/services/sync-backup'
import type { Backup, BackupType, SyncStatus, HarnessSyncState } from '@/services/sync-backup'
import type { HarnessType } from '@/types'

// ============================================
// Sync status badge
// ============================================

const SYNC_CONFIG: Record<
  SyncStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  synced: { label: 'Synced', icon: CheckCircle2, className: 'text-emerald-500' },
  syncing: { label: 'Syncing', icon: Loader2, className: 'text-blue-500 animate-spin' },
  pending: { label: 'Pending', icon: Clock, className: 'text-amber-500' },
  error: { label: 'Error', icon: XCircle, className: 'text-red-500' },
  never: { label: 'Never Synced', icon: CloudOff, className: 'text-muted-foreground' },
}

function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config = SYNC_CONFIG[status]
  const Icon = config.icon
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn('h-3.5 w-3.5', config.className)} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  )
}

// ============================================
// Backup type badge
// ============================================

function BackupTypeBadge({ type }: { type: BackupType }) {
  const config: Record<BackupType, { label: string; className: string }> = {
    manual: { label: 'Manual', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    auto: { label: 'Auto', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    'pre-migration': {
      label: 'Pre-Migration',
      className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
  }
  const c = config[type]
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', c.className)}>
      {c.label}
    </span>
  )
}

// ============================================
// Sync Panel
// ============================================

function SyncPanel({
  syncStates,
  isSyncing,
  onSyncHarness,
  onSyncAll,
}: {
  syncStates: HarnessSyncState[]
  isSyncing: boolean
  onSyncHarness: (harness: HarnessType) => void
  onSyncAll: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Sync Status</h3>
        <Button variant="outline" size="sm" onClick={onSyncAll} disabled={isSyncing}>
          {isSyncing ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          Sync All
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {syncStates.map((state) => {
          const config = getHarnessConfig(state.harness)
          return (
            <div key={state.harness} className="flex items-center gap-3 rounded-lg border p-2.5">
              <HarnessIcon type={state.harness} className="h-4 w-4" />
              <span className="text-sm">{config.name}</span>
              <SyncStatusBadge status={state.status} />
              {state.pendingChanges > 0 && (
                <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                  {state.pendingChanges} pending
                </span>
              )}
              {state.lastSyncedAt && (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {formatRelativeTime(state.lastSyncedAt)}
                </span>
              )}
              {state.status !== 'never' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onSyncHarness(state.harness)}
                  disabled={isSyncing}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ============================================
// Backup List
// ============================================

function BackupList({
  backups,
  selectedId,
  now,
  onSelect,
  onDelete,
  onRestore,
}: {
  backups: Backup[]
  selectedId: string | null
  now: number
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
}) {
  if (backups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Archive className="mb-2 h-8 w-8" />
        <p className="text-sm">No backups yet</p>
        <p className="text-xs">Create your first backup to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {backups.map((backup) => {
        const isExpired = backup.expiresAt && backup.expiresAt.getTime() < now
        const totalItems =
          backup.contents.skills +
          backup.contents.hooks +
          backup.contents.settings +
          backup.contents.mcpServers +
          backup.contents.projectContextFiles

        return (
          <div
            key={backup.id}
            className={cn(
              'rounded-lg border p-3 cursor-pointer transition-colors',
              selectedId === backup.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
              isExpired && 'opacity-60'
            )}
            onClick={() => onSelect(backup.id)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{backup.name}</span>
              <BackupTypeBadge type={backup.type} />
              {backup.harness !== 'all' && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {backup.harness}
                </span>
              )}
              {isExpired && (
                <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-500">
                  Expired
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{totalItems} items</span>
              <span>{formatBytes(backup.size)}</span>
              <span>{formatRelativeTime(backup.createdAt)}</span>
            </div>
            {backup.description && (
              <p className="mt-1 text-xs text-muted-foreground">{backup.description}</p>
            )}

            {/* Actions on hover/selected */}
            {selectedId === backup.id && (
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRestore(backup.id)
                  }}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(backup.id)
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// Create Backup Dialog
// ============================================

function CreateBackupDialog({
  open,
  onClose,
  onCreate,
  isCreating,
}: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, harness: HarnessType | 'all', description: string) => void
  isCreating: boolean
}) {
  const [name, setName] = useState('Manual Backup')
  const [harness, setHarness] = useState<HarnessType | 'all'>('all')
  const [description, setDescription] = useState('')

  const handleCreate = () => {
    onCreate(name, harness, description)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Backup</DialogTitle>
          <DialogDescription>Create a new backup of your configurations</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Backup Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Backup"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Scope</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Button
                variant={harness === 'all' ? 'secondary' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setHarness('all')}
              >
                All Harnesses
              </Button>
              {getAllHarnessTypes().map((type) => {
                const config = getHarnessConfig(type)
                return (
                  <Button
                    key={type}
                    variant={harness === type ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setHarness(type)}
                  >
                    {config.shortName}
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's in this backup..."
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
            {isCreating ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4" />
            )}
            Create Backup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Page
// ============================================

export function SyncBackupPage() {
  const backups = useSyncBackupStore((s) => s.backups)
  const selectedBackupId = useSyncBackupStore((s) => s.selectedBackupId)
  const syncStates = useSyncBackupStore((s) => s.syncStates)
  const stats = useSyncBackupStore((s) => s.stats)
  const isLoadingBackups = useSyncBackupStore((s) => s.isLoadingBackups)
  const isCreatingBackup = useSyncBackupStore((s) => s.isCreatingBackup)
  const isRestoring = useSyncBackupStore((s) => s.isRestoring)
  const isSyncing = useSyncBackupStore((s) => s.isSyncing)
  const isRotating = useSyncBackupStore((s) => s.isRotating)
  const message = useSyncBackupStore((s) => s.message)

  const setBackups = useSyncBackupStore((s) => s.setBackups)
  const addBackup = useSyncBackupStore((s) => s.addBackup)
  const removeBackup = useSyncBackupStore((s) => s.removeBackup)
  const setSelectedBackupId = useSyncBackupStore((s) => s.setSelectedBackupId)
  const setSyncStates = useSyncBackupStore((s) => s.setSyncStates)
  const updateSyncState = useSyncBackupStore((s) => s.updateSyncState)
  const setStats = useSyncBackupStore((s) => s.setStats)
  const setLastRestoreResult = useSyncBackupStore((s) => s.setLastRestoreResult)
  const setIsLoadingBackups = useSyncBackupStore((s) => s.setIsLoadingBackups)
  const setIsCreatingBackup = useSyncBackupStore((s) => s.setIsCreatingBackup)
  const setIsRestoring = useSyncBackupStore((s) => s.setIsRestoring)
  const setIsSyncing = useSyncBackupStore((s) => s.setIsSyncing)
  const setIsRotating = useSyncBackupStore((s) => s.setIsRotating)
  const setMessage = useSyncBackupStore((s) => s.setMessage)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [now] = useState(() => Date.now())

  // Load data on mount
  const loadData = useCallback(async () => {
    setIsLoadingBackups(true)
    try {
      const [backupList, syncStateList, backupStats] = await Promise.all([
        listBackups(),
        getSyncStates(),
        getBackupStats(),
      ])
      setBackups(backupList)
      setSyncStates(syncStateList)
      setStats(backupStats)
    } finally {
      setIsLoadingBackups(false)
    }
  }, [setBackups, setSyncStates, setStats, setIsLoadingBackups])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handlers
  const handleCreateBackup = useCallback(
    async (name: string, harness: HarnessType | 'all', description: string) => {
      setIsCreatingBackup(true)
      try {
        const backup = await createBackupService({ name, harness, description })
        addBackup(backup)
        setShowCreateDialog(false)
        setMessage(`Backup "${backup.name}" created successfully`)
        const newStats = await getBackupStats()
        setStats(newStats)
      } finally {
        setIsCreatingBackup(false)
      }
    },
    [addBackup, setIsCreatingBackup, setMessage, setStats]
  )

  const handleDeleteBackup = useCallback(
    async (id: string) => {
      const success = await deleteBackupService(id)
      if (success) {
        removeBackup(id)
        setMessage('Backup deleted')
        const newStats = await getBackupStats()
        setStats(newStats)
      }
    },
    [removeBackup, setMessage, setStats]
  )

  const handleRestoreBackup = useCallback(
    async (id: string) => {
      setIsRestoring(true)
      try {
        const result = await restoreBackupService(id)
        setLastRestoreResult(result)
        if (result.success) {
          setMessage(
            `Restored ${result.restoredItems} items from backup (${result.skippedItems} skipped)`
          )
        } else {
          setMessage(`Restore failed: ${result.errors.join(', ')}`)
        }
      } finally {
        setIsRestoring(false)
      }
    },
    [setIsRestoring, setLastRestoreResult, setMessage]
  )

  const handleSyncHarness = useCallback(
    async (harness: HarnessType) => {
      setIsSyncing(true)
      try {
        const result = await syncHarness(harness)
        updateSyncState(result)
        setMessage(`${getHarnessConfig(harness).name} synced successfully`)
      } finally {
        setIsSyncing(false)
      }
    },
    [setIsSyncing, updateSyncState, setMessage]
  )

  const handleSyncAll = useCallback(async () => {
    setIsSyncing(true)
    try {
      const states = await syncAll()
      setSyncStates(states)
      setMessage('All harnesses synced successfully')
    } finally {
      setIsSyncing(false)
    }
  }, [setIsSyncing, setSyncStates, setMessage])

  const handleRunRotation = useCallback(async () => {
    setIsRotating(true)
    try {
      const result = await runRotation()
      setMessage(`Rotation complete: ${result.deleted} deleted, ${result.remaining} remaining`)
      const [backupList, newStats] = await Promise.all([listBackups(), getBackupStats()])
      setBackups(backupList)
      setStats(newStats)
    } finally {
      setIsRotating(false)
    }
  }, [setIsRotating, setMessage, setBackups, setStats])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Archive className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Sync & Backup</h2>
            <p className="text-sm text-muted-foreground">
              Manage configuration backups and sync status
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRunRotation} disabled={isRotating}>
            {isRotating ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Rotate
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoadingBackups}>
            {isLoadingBackups ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Backup
          </Button>
        </div>
      </div>

      {/* Message banner */}
      {message && (
        <div className="flex items-center gap-2 border-b bg-muted/50 px-6 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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

      {/* Restoring overlay */}
      {isRestoring && (
        <div className="flex items-center gap-2 border-b bg-blue-500/5 px-6 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-blue-700 dark:text-blue-300">Restoring from backup...</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Sync + Stats */}
          <div className="space-y-4">
            {/* Sync panel */}
            <SyncPanel
              syncStates={syncStates}
              isSyncing={isSyncing}
              onSyncHarness={handleSyncHarness}
              onSyncAll={handleSyncAll}
            />

            {/* Stats */}
            {stats && (
              <Card className="p-4">
                <h3 className="text-sm font-medium">Backup Stats</h3>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Total Backups</span>
                    <span className="font-medium text-foreground">{stats.totalBackups}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Size</span>
                    <span className="font-medium text-foreground">
                      {formatBytes(stats.totalSize)}
                    </span>
                  </div>
                  {stats.byType.map(({ type, count }) => (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize">{type}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Backup list */}
          <div className="col-span-2">
            <h3 className="mb-3 text-sm font-medium">Backups ({backups.length})</h3>
            {isLoadingBackups ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <BackupList
                backups={backups}
                selectedId={selectedBackupId}
                now={now}
                onSelect={setSelectedBackupId}
                onDelete={handleDeleteBackup}
                onRestore={handleRestoreBackup}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create backup dialog */}
      <CreateBackupDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateBackup}
        isCreating={isCreatingBackup}
      />
    </div>
  )
}
