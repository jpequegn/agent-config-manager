/**
 * DriveList Component
 * Lists detected external drives with connection status
 */

import { Usb, Wifi, WifiOff, HardDrive, MemoryStick } from 'lucide-react'
import { cn, formatBytes, formatRelativeTime } from '@/lib/utils'
import { useExternalContextStore } from '@/stores/external-context-store'
import type { ExternalDrive } from '@/services/external-context'

const DRIVE_TYPE_ICONS: Record<
  ExternalDrive['driveType'],
  React.ComponentType<{ className?: string }>
> = {
  usb: Usb,
  thunderbolt: HardDrive,
  network: Wifi,
  'sd-card': MemoryStick,
}

export function DriveList() {
  const drives = useExternalContextStore((s) => s.drives)
  const selectedDriveId = useExternalContextStore((s) => s.selectedDriveId)
  const selectDrive = useExternalContextStore((s) => s.selectDrive)

  const connected = drives.filter((d) => d.storage.isConnected)
  const disconnected = drives.filter((d) => !d.storage.isConnected)

  return (
    <div className="flex flex-col">
      {/* Connected drives */}
      {connected.length > 0 && (
        <>
          <div className="border-b px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Connected ({connected.length})
            </span>
          </div>
          {connected.map((drive) => (
            <DriveRow
              key={drive.id}
              drive={drive}
              isSelected={selectedDriveId === drive.id}
              onSelect={() => selectDrive(drive.id)}
            />
          ))}
        </>
      )}

      {/* Disconnected drives */}
      {disconnected.length > 0 && (
        <>
          <div className="border-b px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Disconnected ({disconnected.length})
            </span>
          </div>
          {disconnected.map((drive) => (
            <DriveRow
              key={drive.id}
              drive={drive}
              isSelected={selectedDriveId === drive.id}
              onSelect={() => selectDrive(drive.id)}
            />
          ))}
        </>
      )}

      {drives.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No external drives detected
        </div>
      )}
    </div>
  )
}

function DriveRow({
  drive,
  isSelected,
  onSelect,
}: {
  drive: ExternalDrive
  isSelected: boolean
  onSelect: () => void
}) {
  const DriveIcon = DRIVE_TYPE_ICONS[drive.driveType]
  const isConnected = drive.storage.isConnected
  const usagePercent = (drive.storage.usedSpace / drive.storage.totalCapacity) * 100

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-accent/50',
        isSelected && 'bg-accent/30'
      )}
    >
      <div className={cn('mt-0.5', isConnected ? 'text-foreground' : 'text-muted-foreground')}>
        <DriveIcon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn('text-sm font-medium truncate', !isConnected && 'text-muted-foreground')}
          >
            {drive.name}
          </span>
          {drive.hasPaiContext && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              PAI
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground truncate">{drive.mountPath}</div>
        {isConnected ? (
          <>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full',
                  usagePercent >= 90
                    ? 'bg-red-500'
                    : usagePercent >= 75
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                )}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{formatBytes(drive.storage.usedSpace)} used</span>
              <span>{formatBytes(drive.storage.totalCapacity)}</span>
            </div>
            {drive.storage.lastSyncedAt && (
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                Synced {formatRelativeTime(drive.storage.lastSyncedAt)}
              </div>
            )}
          </>
        ) : (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <WifiOff className="h-3 w-3" />
            Disconnected
          </div>
        )}
      </div>
    </button>
  )
}
