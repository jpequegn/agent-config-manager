/**
 * Migration Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useMigrationStore } from './migration-store'

describe('MigrationStore', () => {
  beforeEach(() => {
    useMigrationStore.getState().reset()
  })

  it('should start with initial state', () => {
    const state = useMigrationStore.getState()
    expect(state.currentStep).toBe('select')
    expect(state.sourceHarness).toBeNull()
    expect(state.targetHarness).toBeNull()
    expect(state.plan).toBeNull()
    expect(state.result).toBeNull()
    expect(state.isAnalyzing).toBe(false)
    expect(state.isExecuting).toBe(false)
  })

  it('should set source harness', () => {
    useMigrationStore.getState().setSourceHarness('claude-code')
    expect(useMigrationStore.getState().sourceHarness).toBe('claude-code')
  })

  it('should set target harness', () => {
    useMigrationStore.getState().setTargetHarness('cursor')
    expect(useMigrationStore.getState().targetHarness).toBe('cursor')
  })

  it('should set step', () => {
    useMigrationStore.getState().setStep('analyze')
    expect(useMigrationStore.getState().currentStep).toBe('analyze')
  })

  it('should set analyzing state', () => {
    useMigrationStore.getState().setIsAnalyzing(true)
    expect(useMigrationStore.getState().isAnalyzing).toBe(true)
  })

  it('should set executing state', () => {
    useMigrationStore.getState().setIsExecuting(true)
    expect(useMigrationStore.getState().isExecuting).toBe(true)
  })

  it('should set message', () => {
    useMigrationStore.getState().setMessage('Test message')
    expect(useMigrationStore.getState().message).toBe('Test message')
  })

  it('should toggle item selection in plan', () => {
    useMigrationStore.getState().setPlan({
      id: 'test-plan',
      source: 'claude-code',
      target: 'cursor',
      items: [
        {
          id: 'item-1',
          type: 'skill',
          name: 'Test Skill',
          description: 'desc',
          sourceHarness: 'claude-code',
          targetHarness: 'cursor',
          status: 'pending',
          compatibility: 'full',
          warnings: [],
          sourceContent: 'source',
          targetContent: 'target',
          selected: true,
        },
      ],
      compatibility: {
        source: 'claude-code',
        target: 'cursor',
        level: 'full',
        score: 70,
        summary: 'Good',
        warnings: [],
        unsupportedFeatures: [],
      },
      createdAt: new Date(),
    })

    useMigrationStore.getState().toggleItemSelection('item-1')
    expect(useMigrationStore.getState().plan!.items[0].selected).toBe(false)

    useMigrationStore.getState().toggleItemSelection('item-1')
    expect(useMigrationStore.getState().plan!.items[0].selected).toBe(true)
  })

  it('should select all items', () => {
    useMigrationStore.getState().setPlan({
      id: 'test-plan',
      source: 'claude-code',
      target: 'cursor',
      items: [
        {
          id: 'item-1',
          type: 'skill',
          name: 'A',
          description: '',
          sourceHarness: 'claude-code',
          targetHarness: 'cursor',
          status: 'pending',
          compatibility: 'full',
          warnings: [],
          sourceContent: '',
          targetContent: '',
          selected: false,
        },
        {
          id: 'item-2',
          type: 'hook',
          name: 'B',
          description: '',
          sourceHarness: 'claude-code',
          targetHarness: 'cursor',
          status: 'pending',
          compatibility: 'partial',
          warnings: [],
          sourceContent: '',
          targetContent: '',
          selected: false,
        },
      ],
      compatibility: {
        source: 'claude-code',
        target: 'cursor',
        level: 'full',
        score: 70,
        summary: '',
        warnings: [],
        unsupportedFeatures: [],
      },
      createdAt: new Date(),
    })

    useMigrationStore.getState().selectAllItems()
    const items = useMigrationStore.getState().plan!.items
    expect(items.every((i) => i.selected)).toBe(true)
  })

  it('should deselect all items', () => {
    useMigrationStore.getState().setPlan({
      id: 'test-plan',
      source: 'claude-code',
      target: 'cursor',
      items: [
        {
          id: 'item-1',
          type: 'skill',
          name: 'A',
          description: '',
          sourceHarness: 'claude-code',
          targetHarness: 'cursor',
          status: 'pending',
          compatibility: 'full',
          warnings: [],
          sourceContent: '',
          targetContent: '',
          selected: true,
        },
      ],
      compatibility: {
        source: 'claude-code',
        target: 'cursor',
        level: 'full',
        score: 70,
        summary: '',
        warnings: [],
        unsupportedFeatures: [],
      },
      createdAt: new Date(),
    })

    useMigrationStore.getState().deselectAllItems()
    const items = useMigrationStore.getState().plan!.items
    expect(items.every((i) => !i.selected)).toBe(true)
  })

  it('should reset to initial state', () => {
    useMigrationStore.getState().setSourceHarness('claude-code')
    useMigrationStore.getState().setTargetHarness('cursor')
    useMigrationStore.getState().setStep('analyze')
    useMigrationStore.getState().setMessage('test')

    useMigrationStore.getState().reset()

    const state = useMigrationStore.getState()
    expect(state.currentStep).toBe('select')
    expect(state.sourceHarness).toBeNull()
    expect(state.targetHarness).toBeNull()
    expect(state.message).toBeNull()
  })
})
