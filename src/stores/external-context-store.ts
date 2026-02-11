/**
 * External Context Store
 * Manages external drive detection, sync, and connection state
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ExternalDrive, SyncConfig, SyncStatus } from '@/services/external-context'

interface ExternalContextState {
  /** Detected drives */
  drives: ExternalDrive[]
  /** Currently selected drive ID */
  selectedDriveId: string | null
  /** Sync configs keyed by drive ID */
  syncConfigs: Map<string, SyncConfig>
  /** Sync status keyed by drive ID */
  syncStatuses: Map<string, SyncStatus>
  /** Whether detection is in progress */
  isDetecting: boolean
  /** Last detection timestamp */
  lastDetectedAt: Date | null
  /** Last operation message */
  lastMessage: string | null

  // Actions
  setDrives: (drives: ExternalDrive[]) => void
  selectDrive: (driveId: string | null) => void
  setSyncConfig: (driveId: string, config: SyncConfig) => void
  setSyncStatus: (driveId: string, status: SyncStatus) => void
  setIsDetecting: (detecting: boolean) => void
  setLastMessage: (message: string | null) => void
}

export const useExternalContextStore = create<ExternalContextState>()(
  devtools(
    (set, get) => ({
      drives: [],
      selectedDriveId: null,
      syncConfigs: new Map(),
      syncStatuses: new Map(),
      isDetecting: false,
      lastDetectedAt: null,
      lastMessage: null,

      setDrives: (drives) => set({ drives, lastDetectedAt: new Date() }, false, 'setDrives'),

      selectDrive: (selectedDriveId) => set({ selectedDriveId }, false, 'selectDrive'),

      setSyncConfig: (driveId, config) => {
        const configs = new Map(get().syncConfigs)
        configs.set(driveId, config)
        set({ syncConfigs: configs }, false, 'setSyncConfig')
      },

      setSyncStatus: (driveId, status) => {
        const statuses = new Map(get().syncStatuses)
        statuses.set(driveId, status)
        set({ syncStatuses: statuses }, false, 'setSyncStatus')
      },

      setIsDetecting: (isDetecting) => set({ isDetecting }, false, 'setIsDetecting'),

      setLastMessage: (lastMessage) => set({ lastMessage }, false, 'setLastMessage'),
    }),
    { name: 'external-context-store' }
  )
)

// Selector hooks
export const useExternalDrives = () => useExternalContextStore((s) => s.drives)
export const useSelectedDriveId = () => useExternalContextStore((s) => s.selectedDriveId)
export const useIsDetectingDrives = () => useExternalContextStore((s) => s.isDetecting)
export const useSyncConfigs = () => useExternalContextStore((s) => s.syncConfigs)
