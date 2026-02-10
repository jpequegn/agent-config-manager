/**
 * Skills Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useSkillsStore } from './skills-store'
import type { Skill, SkillSummary } from '@/types'

const mockSummary: SkillSummary = {
  id: 'skill-test-001',
  harness: 'claude-code',
  name: 'Test Skill',
  description: 'A test skill',
  category: 'development',
  status: 'enabled',
}

const mockSkill: Skill = {
  id: 'skill-test-001',
  harness: 'claude-code',
  filePath: '~/test/SKILL.md',
  metadata: {
    name: 'Test Skill',
    description: 'A test skill',
    category: 'development',
    triggers: [{ pattern: '/test', isRegex: false }],
    tags: ['test'],
  },
  content: '# Test Skill',
  status: 'enabled',
  stats: { invocationCount: 5 },
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('SkillsStore', () => {
  beforeEach(() => {
    const store = useSkillsStore.getState()
    store.setSkills([])
    store.selectSkill(null)
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setFilterHarness(null)
    store.setFilterCategory(null)
    store.setGroupBy('harness')
    store.collapseAll()
  })

  it('should start with defaults after reset', () => {
    const state = useSkillsStore.getState()
    expect(state.skills).toEqual([])
    expect(state.selectedSkill).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.searchQuery).toBe('')
    expect(state.filterHarness).toBeNull()
    expect(state.filterCategory).toBeNull()
    expect(state.groupBy).toBe('harness')
    expect(state.expandedNodes.size).toBe(0)
  })

  it('should set skills list', () => {
    useSkillsStore.getState().setSkills([mockSummary])
    expect(useSkillsStore.getState().skills).toEqual([mockSummary])
  })

  it('should select a skill', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    expect(useSkillsStore.getState().selectedSkill).toEqual(mockSkill)
  })

  it('should clear selected skill', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    useSkillsStore.getState().selectSkill(null)
    expect(useSkillsStore.getState().selectedSkill).toBeNull()
  })

  it('should set loading state', () => {
    useSkillsStore.getState().setIsLoading(true)
    expect(useSkillsStore.getState().isLoading).toBe(true)
  })

  it('should set search query', () => {
    useSkillsStore.getState().setSearchQuery('test')
    expect(useSkillsStore.getState().searchQuery).toBe('test')
  })

  it('should set group by mode', () => {
    useSkillsStore.getState().setGroupBy('category')
    expect(useSkillsStore.getState().groupBy).toBe('category')
  })

  it('should toggle tree nodes', () => {
    useSkillsStore.getState().toggleNode('claude-code')
    expect(useSkillsStore.getState().expandedNodes.has('claude-code')).toBe(true)
    useSkillsStore.getState().toggleNode('claude-code')
    expect(useSkillsStore.getState().expandedNodes.has('claude-code')).toBe(false)
  })

  it('should expand all nodes based on skills', () => {
    useSkillsStore
      .getState()
      .setSkills([mockSummary, { ...mockSummary, id: 'skill-2', harness: 'cursor' }])
    useSkillsStore.getState().expandAll()
    const expanded = useSkillsStore.getState().expandedNodes
    expect(expanded.has('claude-code')).toBe(true)
    expect(expanded.has('cursor')).toBe(true)
  })

  it('should collapse all nodes', () => {
    useSkillsStore.getState().toggleNode('claude-code')
    useSkillsStore.getState().toggleNode('cursor')
    useSkillsStore.getState().collapseAll()
    expect(useSkillsStore.getState().expandedNodes.size).toBe(0)
  })

  it('should clear all filters', () => {
    useSkillsStore.getState().setSearchQuery('test')
    useSkillsStore.getState().setFilterHarness('cursor')
    useSkillsStore.getState().setFilterCategory('development')
    useSkillsStore.getState().clearFilters()
    const state = useSkillsStore.getState()
    expect(state.searchQuery).toBe('')
    expect(state.filterHarness).toBeNull()
    expect(state.filterCategory).toBeNull()
  })
})
