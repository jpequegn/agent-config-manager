/**
 * Sync Backup Store
 * Manages backup list, sync states, and UI state
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  Backup,
  HarnessSyncState,
  RotationConfig,
  BackupStats,
  RestoreResult,
} from '@/services/sync-backup'

/** Store state */
interface SyncBackupState {
  /** All backups */
  backups: Backup[]
  /** Selected backup ID */
  selectedBackupId: string | null
  /** Sync states per harness */
  syncStates: HarnessSyncState[]
  /** Rotation config */
  rotationConfig: RotationConfig | null
  /** Backup stats */
  stats: BackupStats | null
  /** Last restore result */
  lastRestoreResult: RestoreResult | null
  /** Loading states */
  isLoadingBackups: boolean
  isCreatingBackup: boolean
  isRestoring: boolean
  isSyncing: boolean
  isRotating: boolean
  /** Status message */
  message: string | null
}

/** Store actions */
interface SyncBackupActions {
  setBackups: (backups: Backup[]) => void
  addBackup: (backup: Backup) => void
  removeBackup: (id: string) => void
  setSelectedBackupId: (id: string | null) => void
  setSyncStates: (states: HarnessSyncState[]) => void
  updateSyncState: (state: HarnessSyncState) => void
  setRotationConfig: (config: RotationConfig) => void
  setStats: (stats: BackupStats | null) => void
  setLastRestoreResult: (result: RestoreResult | null) => void
  setIsLoadingBackups: (v: boolean) => void
  setIsCreatingBackup: (v: boolean) => void
  setIsRestoring: (v: boolean) => void
  setIsSyncing: (v: boolean) => void
  setIsRotating: (v: boolean) => void
  setMessage: (msg: string | null) => void
}

type SyncBackupStore = SyncBackupState & SyncBackupActions

const initialState: SyncBackupState = {
  backups: [],
  selectedBackupId: null,
  syncStates: [],
  rotationConfig: null,
  stats: null,
  lastRestoreResult: null,
  isLoadingBackups: false,
  isCreatingBackup: false,
  isRestoring: false,
  isSyncing: false,
  isRotating: false,
  message: null,
}

export const useSyncBackupStore = create<SyncBackupStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setBackups: (backups) => set({ backups }, false, 'setBackups'),

      addBackup: (backup) => set((s) => ({ backups: [backup, ...s.backups] }), false, 'addBackup'),

      removeBackup: (id) =>
        set(
          (s) => ({
            backups: s.backups.filter((b) => b.id !== id),
            selectedBackupId: s.selectedBackupId === id ? null : s.selectedBackupId,
          }),
          false,
          'removeBackup'
        ),

      setSelectedBackupId: (id) => set({ selectedBackupId: id }, false, 'setSelectedBackupId'),

      setSyncStates: (states) => set({ syncStates: states }, false, 'setSyncStates'),

      updateSyncState: (state) =>
        set(
          (s) => ({
            syncStates: s.syncStates.map((ss) => (ss.harness === state.harness ? state : ss)),
          }),
          false,
          'updateSyncState'
        ),

      setRotationConfig: (config) => set({ rotationConfig: config }, false, 'setRotationConfig'),

      setStats: (stats) => set({ stats }, false, 'setStats'),

      setLastRestoreResult: (result) =>
        set({ lastRestoreResult: result }, false, 'setLastRestoreResult'),

      setIsLoadingBackups: (v) => set({ isLoadingBackups: v }, false, 'setIsLoadingBackups'),

      setIsCreatingBackup: (v) => set({ isCreatingBackup: v }, false, 'setIsCreatingBackup'),

      setIsRestoring: (v) => set({ isRestoring: v }, false, 'setIsRestoring'),

      setIsSyncing: (v) => set({ isSyncing: v }, false, 'setIsSyncing'),

      setIsRotating: (v) => set({ isRotating: v }, false, 'setIsRotating'),

      setMessage: (msg) => set({ message: msg }, false, 'setMessage'),
    }),
    { name: 'SyncBackupStore' }
  )
)

/** Selector hooks */
export const useBackups = () => useSyncBackupStore((s) => s.backups)
export const useSelectedBackupId = () => useSyncBackupStore((s) => s.selectedBackupId)
export const useSyncStates = () => useSyncBackupStore((s) => s.syncStates)
export const useIsLoadingBackups = () => useSyncBackupStore((s) => s.isLoadingBackups)
export const useIsSyncing = () => useSyncBackupStore((s) => s.isSyncing)
