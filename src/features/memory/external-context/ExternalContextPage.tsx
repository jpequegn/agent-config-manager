/**
 * ExternalContextPage Component
 * External drive/context integration with detection, sync, and stats
 */

import { useEffect, useCallback } from 'react'
import { RefreshCw, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatBytes } from '@/lib/utils'
import { useExternalContextStore } from '@/stores/external-context-store'
import { detectDrives, getExternalContextStats } from '@/services/external-context'
import type { ExternalContextStats } from '@/services/external-context'
import { DriveList } from './DriveList'
import { DriveDetail } from './DriveDetail'
import { useState } from 'react'

export function ExternalContextPage() {
  const drives = useExternalContextStore((s) => s.drives)
  const selectedDriveId = useExternalContextStore((s) => s.selectedDriveId)
  const isDetecting = useExternalContextStore((s) => s.isDetecting)
  const lastMessage = useExternalContextStore((s) => s.lastMessage)
  const setDrives = useExternalContextStore((s) => s.setDrives)
  const setIsDetecting = useExternalContextStore((s) => s.setIsDetecting)
  const setLastMessage = useExternalContextStore((s) => s.setLastMessage)
  const [stats, setStats] = useState<ExternalContextStats | null>(null)

  const selectedDrive = drives.find((d) => d.id === selectedDriveId) ?? null

  const loadData = useCallback(async () => {
    setIsDetecting(true)
    try {
      const [detectedDrives, contextStats] = await Promise.all([
        detectDrives(),
        getExternalContextStats(),
      ])
      setDrives(detectedDrives)
      setStats(contextStats)
    } finally {
      setIsDetecting(false)
    }
  }, [setDrives, setIsDetecting])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">External Context</h2>
            <p className="text-sm text-muted-foreground">
              Manage external drives and context synchronization
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isDetecting}
          aria-label="Scan for external drives"
        >
          <RefreshCw className={cn('mr-2 h-3.5 w-3.5', isDetecting && 'animate-spin')} />
          {isDetecting ? 'Scanning...' : 'Scan Drives'}
        </Button>
      </div>

      {/* Operation result banner */}
      {lastMessage && (
        <div className="border-b bg-accent/30 px-6 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{lastMessage}</span>
            <button
              onClick={() => setLastMessage(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      {stats && (
        <div className="flex items-center gap-6 border-b px-6 py-3">
          <StatItem label="Drives" value={String(stats.totalDrives)} />
          <StatItem label="With PAI Context" value={String(stats.drivesWithContext)} />
          <StatItem label="Total Capacity" value={formatBytes(stats.totalCapacity)} />
          <StatItem label="Total Used" value={formatBytes(stats.totalUsed)} />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: drive list */}
        <div className="w-80 shrink-0 border-r overflow-auto">
          <DriveList />
        </div>
        {/* Right: drive detail */}
        <div className="flex-1 overflow-auto">
          {selectedDrive ? (
            <DriveDetail drive={selectedDrive} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a drive to view details and sync settings
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  )
}
