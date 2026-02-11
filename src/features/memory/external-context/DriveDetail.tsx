/**
 * DriveDetail Component
 * Shows drive details, sync controls, and sync targets
 */

import { useState, useCallback } from 'react'
import {
  RefreshCw,
  Play,
  Settings2,
  CheckCircle,
  AlertCircle,
  WifiOff,
  FolderPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatBytes, formatRelativeTime } from '@/lib/utils'
import { useExternalContextStore } from '@/stores/external-context-store'
import {
  getSyncConfig,
  triggerSync,
  toggleSyncTarget,
  updateSyncConfig,
  initializeDriveContext,
} from '@/services/external-context'
import type { ExternalDrive, SyncTarget, SyncMode } from '@/services/external-context'
import { useEffect } from 'react'

const TARGET_LABELS: Record<SyncTarget['type'], string> = {
  sessions: 'Sessions',
  learnings: 'Learnings',
  'project-context': 'Project Context',
  backups: 'Full Backups',
}

interface Props {
  drive: ExternalDrive
}

export function DriveDetail({ drive }: Props) {
  const syncConfigs = useExternalContextStore((s) => s.syncConfigs)
  const syncStatuses = useExternalContextStore((s) => s.syncStatuses)
  const setSyncConfig = useExternalContextStore((s) => s.setSyncConfig)
  const setSyncStatus = useExternalContextStore((s) => s.setSyncStatus)
  const setLastMessage = useExternalContextStore((s) => s.setLastMessage)
  const [isInitializing, setIsInitializing] = useState(false)

  const config = syncConfigs.get(drive.id) ?? null
  const syncStatus = syncStatuses.get(drive.id) ?? 'idle'

  // Load sync config on mount
  useEffect(() => {
    async function loadConfig() {
      const cfg = await getSyncConfig(drive.id)
      if (cfg) setSyncConfig(drive.id, cfg)
    }
    loadConfig()
  }, [drive.id, setSyncConfig])

  const handleSync = useCallback(async () => {
    setSyncStatus(drive.id, 'syncing')
    try {
      const result = await triggerSync(drive.id)
      if (result.success) {
        setSyncStatus(drive.id, 'completed')
        setLastMessage(
          `Synced ${result.filesTransferred} files (${formatBytes(result.bytesTransferred)}) in ${(result.durationMs / 1000).toFixed(1)}s`
        )
      } else {
        setSyncStatus(drive.id, 'error')
        setLastMessage(`Sync failed: ${result.error}`)
      }
    } catch {
      setSyncStatus(drive.id, 'error')
      setLastMessage('Sync failed unexpectedly')
    }
  }, [drive.id, setSyncStatus, setLastMessage])

  const handleToggleTarget = useCallback(
    async (targetType: SyncTarget['type']) => {
      const updated = await toggleSyncTarget(drive.id, targetType)
      if (updated) setSyncConfig(drive.id, updated)
    },
    [drive.id, setSyncConfig]
  )

  const handleModeChange = useCallback(
    async (mode: SyncMode) => {
      const updated = await updateSyncConfig(drive.id, { mode })
      setSyncConfig(drive.id, updated)
    },
    [drive.id, setSyncConfig]
  )

  const handleInitialize = useCallback(async () => {
    setIsInitializing(true)
    try {
      const result = await initializeDriveContext(drive.id)
      if (result.success) {
        setLastMessage(`Initialized PAI context at ${result.path}`)
      } else {
        setLastMessage('Failed to initialize PAI context')
      }
    } finally {
      setIsInitializing(false)
    }
  }, [drive.id, setLastMessage])

  // Disconnected state
  if (!drive.storage.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <WifiOff className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">{drive.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">This drive is currently disconnected</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{drive.mountPath}</p>
        </div>
        {drive.hasPaiContext && (
          <div className="rounded-lg border bg-accent/30 px-4 py-3 text-sm">
            <p className="font-medium">PAI context data exists on this drive</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reconnect the drive to resume syncing
            </p>
          </div>
        )}
      </div>
    )
  }

  // No PAI context - offer to initialize
  if (!drive.hasPaiContext) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <FolderPlus className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">{drive.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">No PAI context found on this drive</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatBytes(drive.storage.availableSpace)} available
          </p>
        </div>
        <Button onClick={handleInitialize} disabled={isInitializing}>
          <FolderPlus className="mr-2 h-4 w-4" />
          {isInitializing ? 'Initializing...' : 'Initialize PAI Context'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Drive header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{drive.name}</h3>
          <p className="text-sm text-muted-foreground">{drive.paiContextPath}</p>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatusBadge status={syncStatus} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="mr-2 h-3.5 w-3.5" />
            )}
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Storage stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Used" value={formatBytes(drive.storage.usedSpace)} />
        <StatCard label="Available" value={formatBytes(drive.storage.availableSpace)} />
        <StatCard
          label="Last Synced"
          value={
            drive.storage.lastSyncedAt ? formatRelativeTime(drive.storage.lastSyncedAt) : 'Never'
          }
        />
      </div>

      {/* Sync mode */}
      {config && (
        <>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sync Mode</span>
            </div>
            <div className="flex gap-2">
              {(['manual', 'auto'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={cn(
                    'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    config.mode === mode
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-accent/50'
                  )}
                >
                  {mode === 'manual' ? 'Manual' : `Auto (every ${config.intervalMinutes}m)`}
                </button>
              ))}
            </div>
          </div>

          {/* Sync targets */}
          <div>
            <div className="mb-3 text-sm font-medium">Sync Targets</div>
            <div className="space-y-2">
              {config.syncTargets.map((target) => (
                <SyncTargetRow
                  key={target.type}
                  target={target}
                  onToggle={() => handleToggleTarget(target.type)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SyncStatusBadge({ status }: { status: string }) {
  const config = {
    idle: { label: 'Idle', color: 'text-muted-foreground', bg: 'bg-muted' },
    syncing: { label: 'Syncing', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    completed: { label: 'Synced', color: 'text-green-500', bg: 'bg-green-500/10' },
    error: { label: 'Error', color: 'text-red-500', bg: 'bg-red-500/10' },
  }[status] ?? { label: status, color: 'text-muted-foreground', bg: 'bg-muted' }

  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', config.color, config.bg)}
    >
      {config.label}
    </span>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}

function SyncTargetRow({ target, onToggle }: { target: SyncTarget; onToggle: () => void }) {
  const diffBytes = target.sourceSize - target.destSize
  const isSynced = diffBytes === 0 && target.lastSynced !== null

  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          role="switch"
          aria-checked={target.enabled}
          onClick={onToggle}
          className={cn(
            'relative h-5 w-9 rounded-full transition-colors',
            target.enabled ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
              target.enabled && 'translate-x-4'
            )}
          />
        </button>
        <div>
          <div className="text-sm font-medium">{TARGET_LABELS[target.type]}</div>
          <div className="text-[10px] text-muted-foreground">
            Local: {formatBytes(target.sourceSize)}
            {target.destSize > 0 && <> &middot; External: {formatBytes(target.destSize)}</>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {target.enabled && isSynced && <CheckCircle className="h-4 w-4 text-green-500" />}
        {target.enabled && !isSynced && diffBytes > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-yellow-500">
            <AlertCircle className="h-3 w-3" />
            {formatBytes(diffBytes)} behind
          </span>
        )}
        {target.lastSynced && (
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(target.lastSynced)}
          </span>
        )}
      </div>
    </div>
  )
}
