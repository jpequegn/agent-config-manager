/**
 * StorageHealthCard Component
 * Shows health status for a storage location
 */

import { HardDrive, Cloud, Usb, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { formatBytes, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { StorageHealth, StorageHealthStatus } from '@/services/memory'
import type { StorageLocation } from '@/types'

const LOCATION_ICONS: Record<StorageLocation, React.ComponentType<{ className?: string }>> = {
  local: HardDrive,
  external: Usb,
  cloud: Cloud,
}

const STATUS_CONFIG: Record<
  StorageHealthStatus,
  {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
  }
> = {
  healthy: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  critical: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
}

interface Props {
  health: StorageHealth
}

export function StorageHealthCard({ health }: Props) {
  const { location, status, message, usagePercent } = health
  const LocationIcon = LOCATION_ICONS[location.location]
  const statusConfig = STATUS_CONFIG[status]
  const StatusIcon = location.isConnected ? statusConfig.icon : XCircle

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LocationIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{location.name}</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
            location.isConnected ? statusConfig.bgColor : 'bg-muted',
            location.isConnected ? statusConfig.color : 'text-muted-foreground'
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {location.isConnected ? status : 'disconnected'}
        </div>
      </div>

      <div className="mb-2 text-xs text-muted-foreground">{message}</div>

      {location.isConnected && (
        <>
          {/* Usage bar */}
          <div className="mb-2 h-2 w-full rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                status === 'critical' && 'bg-red-500',
                status === 'warning' && 'bg-yellow-500',
                status === 'healthy' && 'bg-green-500'
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {formatBytes(location.usedSpace)} / {formatBytes(location.totalCapacity)}
            </span>
            <span>{formatBytes(location.availableSpace)} free</span>
          </div>

          {location.lastSyncedAt && (
            <div className="mt-2 text-[10px] text-muted-foreground">
              Last synced {formatRelativeTime(location.lastSyncedAt)}
            </div>
          )}
        </>
      )}

      {!location.isConnected && (
        <div className="text-xs text-muted-foreground">Path: {location.path}</div>
      )}
    </div>
  )
}
