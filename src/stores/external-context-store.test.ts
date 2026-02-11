/**
 * External Context Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useExternalContextStore } from './external-context-store'
import type { ExternalDrive, SyncConfig } from '@/services/external-context'

const mockDrive: ExternalDrive = {
  id: 'test-drive',
  name: 'Test Drive',
  mountPath: '/Volumes/Test',
  storage: {
    location: 'external',
    name: 'Test Drive',
    path: '/Volumes/Test',
    totalCapacity: 1024,
    usedSpace: 512,
    availableSpace: 512,
    isConnected: true,
  },
  hasPaiContext: true,
  paiContextPath: '/Volumes/Test/pai-context',
  driveType: 'usb',
}

const mockConfig: SyncConfig = {
  driveId: 'test-drive',
  mode: 'manual',
  direction: 'push',
  intervalMinutes: 30,
  syncTargets: [],
}

describe('External Context Store', () => {
  beforeEach(() => {
    const store = useExternalContextStore.getState()
    store.setDrives([])
    store.selectDrive(null)
    store.setIsDetecting(false)
    store.setLastMessage(null)
  })

  it('should set drives', () => {
    useExternalContextStore.getState().setDrives([mockDrive])
    const state = useExternalContextStore.getState()
    expect(state.drives).toHaveLength(1)
    expect(state.drives[0].id).toBe('test-drive')
    expect(state.lastDetectedAt).not.toBeNull()
  })

  it('should select a drive', () => {
    useExternalContextStore.getState().selectDrive('test-drive')
    expect(useExternalContextStore.getState().selectedDriveId).toBe('test-drive')
  })

  it('should deselect a drive', () => {
    useExternalContextStore.getState().selectDrive('test-drive')
    useExternalContextStore.getState().selectDrive(null)
    expect(useExternalContextStore.getState().selectedDriveId).toBeNull()
  })

  it('should set sync config', () => {
    useExternalContextStore.getState().setSyncConfig('test-drive', mockConfig)
    const configs = useExternalContextStore.getState().syncConfigs
    expect(configs.get('test-drive')).toEqual(mockConfig)
  })

  it('should set sync status', () => {
    useExternalContextStore.getState().setSyncStatus('test-drive', 'syncing')
    const statuses = useExternalContextStore.getState().syncStatuses
    expect(statuses.get('test-drive')).toBe('syncing')
  })

  it('should set detecting state', () => {
    useExternalContextStore.getState().setIsDetecting(true)
    expect(useExternalContextStore.getState().isDetecting).toBe(true)
  })

  it('should set last message', () => {
    useExternalContextStore.getState().setLastMessage('Sync complete')
    expect(useExternalContextStore.getState().lastMessage).toBe('Sync complete')
  })
})
