/**
 * Harness Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useHarnessStore } from './harness-store'
import type { HarnessConfig, DetectionResult } from '@/types'

const mockConfig: HarnessConfig = {
  id: 'claude-code-1',
  type: 'claude-code',
  name: 'Claude Code',
  status: 'active',
  configPaths: { settings: '/home/user/.claude/settings.json' },
  stats: { skillCount: 5, hookCount: 2, sessionCount: 10, memorySize: 1024 },
  version: '1.0.0',
}

const mockResult: DetectionResult = {
  type: 'claude-code',
  detected: true,
  status: 'active',
  configPaths: { settings: '/home/user/.claude/settings.json' },
  version: '1.0.0',
}

describe('HarnessStore', () => {
  beforeEach(() => {
    useHarnessStore.setState({
      activeHarness: null,
      detectedHarnesses: new Map(),
      detectionResults: [],
      isDetecting: false,
      lastDetectedAt: null,
      detectionError: null,
    })
  })

  it('starts with initial state', () => {
    const state = useHarnessStore.getState()
    expect(state.activeHarness).toBeNull()
    expect(state.detectedHarnesses.size).toBe(0)
    expect(state.detectionResults).toEqual([])
    expect(state.isDetecting).toBe(false)
    expect(state.lastDetectedAt).toBeNull()
    expect(state.detectionError).toBeNull()
  })

  it('sets active harness', () => {
    useHarnessStore.getState().setActiveHarness('claude-code')
    expect(useHarnessStore.getState().activeHarness).toBe('claude-code')
  })

  it('clears active harness with null', () => {
    useHarnessStore.getState().setActiveHarness('claude-code')
    useHarnessStore.getState().setActiveHarness(null)
    expect(useHarnessStore.getState().activeHarness).toBeNull()
  })

  it('sets detected harnesses and updates timestamp', () => {
    const map = new Map([['claude-code' as const, mockConfig]])
    useHarnessStore.getState().setDetectedHarnesses(map)
    const state = useHarnessStore.getState()
    expect(state.detectedHarnesses.size).toBe(1)
    expect(state.lastDetectedAt).toBeInstanceOf(Date)
    expect(state.detectionError).toBeNull()
  })

  it('updates a single harness config', () => {
    const map = new Map([['claude-code' as const, mockConfig]])
    useHarnessStore.getState().setDetectedHarnesses(map)

    const updatedConfig: HarnessConfig = { ...mockConfig, version: '2.0.0' }
    useHarnessStore.getState().updateHarnessConfig('claude-code', updatedConfig)

    expect(useHarnessStore.getState().detectedHarnesses.get('claude-code')?.version).toBe('2.0.0')
  })

  it('sets detection results', () => {
    useHarnessStore.getState().setDetectionResults([mockResult])
    expect(useHarnessStore.getState().detectionResults).toHaveLength(1)
    expect(useHarnessStore.getState().detectionResults[0].type).toBe('claude-code')
  })

  it('sets isDetecting flag', () => {
    useHarnessStore.getState().setIsDetecting(true)
    expect(useHarnessStore.getState().isDetecting).toBe(true)
    useHarnessStore.getState().setIsDetecting(false)
    expect(useHarnessStore.getState().isDetecting).toBe(false)
  })

  it('sets detection error', () => {
    useHarnessStore.getState().setDetectionError('Failed to scan')
    expect(useHarnessStore.getState().detectionError).toBe('Failed to scan')
  })

  it('clears detection error', () => {
    useHarnessStore.getState().setDetectionError('error')
    useHarnessStore.getState().setDetectionError(null)
    expect(useHarnessStore.getState().detectionError).toBeNull()
  })

  it('clears all harness data', () => {
    const map = new Map([['claude-code' as const, mockConfig]])
    useHarnessStore.getState().setDetectedHarnesses(map)
    useHarnessStore.getState().setDetectionResults([mockResult])

    useHarnessStore.getState().clearHarnesses()

    const state = useHarnessStore.getState()
    expect(state.detectedHarnesses.size).toBe(0)
    expect(state.detectionResults).toEqual([])
    expect(state.lastDetectedAt).toBeNull()
    expect(state.detectionError).toBeNull()
  })

  it('gets harness config by type', () => {
    const map = new Map([['claude-code' as const, mockConfig]])
    useHarnessStore.getState().setDetectedHarnesses(map)

    const config = useHarnessStore.getState().getHarnessConfig('claude-code')
    expect(config).toEqual(mockConfig)
  })

  it('returns undefined for undetected harness config', () => {
    const config = useHarnessStore.getState().getHarnessConfig('cursor')
    expect(config).toBeUndefined()
  })

  it('checks if harness is detected', () => {
    const map = new Map([['claude-code' as const, mockConfig]])
    useHarnessStore.getState().setDetectedHarnesses(map)

    expect(useHarnessStore.getState().isHarnessDetected('claude-code')).toBe(true)
    expect(useHarnessStore.getState().isHarnessDetected('cursor')).toBe(false)
  })
})
