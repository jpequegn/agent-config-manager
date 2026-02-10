/**
 * Skills Store
 * Manages skill browser state: list, selection, search, filters, tree expansion
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HarnessType, Skill, SkillSummary, SkillCategory } from '@/types'

/** Tree grouping mode */
export type SkillGroupBy = 'harness' | 'category'

/** Skills store state */
interface SkillsState {
  /** List of skill summaries */
  skills: SkillSummary[]
  /** Currently selected skill (full entry) */
  selectedSkill: Skill | null
  /** Whether loading is in progress */
  isLoading: boolean
  /** Search query */
  searchQuery: string
  /** Harness filter */
  filterHarness: HarnessType | null
  /** Category filter */
  filterCategory: SkillCategory | null
  /** Group by mode */
  groupBy: SkillGroupBy
  /** Expanded tree node IDs */
  expandedNodes: Set<string>
}

/** Skills store actions */
interface SkillsActions {
  setSkills: (skills: SkillSummary[]) => void
  selectSkill: (skill: Skill | null) => void
  setIsLoading: (isLoading: boolean) => void
  setSearchQuery: (query: string) => void
  setFilterHarness: (harness: HarnessType | null) => void
  setFilterCategory: (category: SkillCategory | null) => void
  setGroupBy: (groupBy: SkillGroupBy) => void
  toggleNode: (nodeId: string) => void
  expandAll: () => void
  collapseAll: () => void
  clearFilters: () => void
}

type SkillsStore = SkillsState & SkillsActions

const initialState: SkillsState = {
  skills: [],
  selectedSkill: null,
  isLoading: false,
  searchQuery: '',
  filterHarness: null,
  filterCategory: null,
  groupBy: 'harness',
  expandedNodes: new Set<string>(),
}

export const useSkillsStore = create<SkillsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setSkills: (skills) => set({ skills }, false, 'setSkills'),

      selectSkill: (skill) => set({ selectedSkill: skill }, false, 'selectSkill'),

      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),

      setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),

      setFilterHarness: (harness) => set({ filterHarness: harness }, false, 'setFilterHarness'),

      setFilterCategory: (category) =>
        set({ filterCategory: category }, false, 'setFilterCategory'),

      setGroupBy: (groupBy) => set({ groupBy }, false, 'setGroupBy'),

      toggleNode: (nodeId) =>
        set(
          (state) => {
            const next = new Set(state.expandedNodes)
            if (next.has(nodeId)) {
              next.delete(nodeId)
            } else {
              next.add(nodeId)
            }
            return { expandedNodes: next }
          },
          false,
          'toggleNode'
        ),

      expandAll: () =>
        set(
          (state) => {
            const allGroups = new Set<string>()
            for (const skill of state.skills) {
              if (state.groupBy === 'harness') {
                allGroups.add(skill.harness)
              } else {
                allGroups.add(skill.category)
              }
            }
            return { expandedNodes: allGroups }
          },
          false,
          'expandAll'
        ),

      collapseAll: () => set({ expandedNodes: new Set<string>() }, false, 'collapseAll'),

      clearFilters: () =>
        set({ searchQuery: '', filterHarness: null, filterCategory: null }, false, 'clearFilters'),
    }),
    { name: 'SkillsStore' }
  )
)

/** Selector hooks */
export const useSkills = () => useSkillsStore((s) => s.skills)
export const useSelectedSkill = () => useSkillsStore((s) => s.selectedSkill)
export const useIsSkillsLoading = () => useSkillsStore((s) => s.isLoading)
