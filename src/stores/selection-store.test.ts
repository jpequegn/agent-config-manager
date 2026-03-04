/**
 * Selection Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useSelectionStore } from './selection-store'
import type { SelectedItem } from './selection-store'

describe('SelectionStore', () => {
  beforeEach(() => {
    useSelectionStore.getState().clearAllSelections()
    useSelectionStore.getState().clearClipboard()
    useSelectionStore.getState().setActiveType(null)
  })

  describe('select / deselect', () => {
    it('selects a single item (replaces existing)', () => {
      useSelectionStore.getState().select('skill', 'a')
      useSelectionStore.getState().select('skill', 'b', false)
      const ids = useSelectionStore.getState().getSelectedIds('skill')
      expect(ids).toEqual(['b'])
    })

    it('adds to selection when addToSelection is true', () => {
      useSelectionStore.getState().select('skill', 'a')
      useSelectionStore.getState().select('skill', 'b', true)
      const ids = useSelectionStore.getState().getSelectedIds('skill')
      expect(ids).toContain('a')
      expect(ids).toContain('b')
    })

    it('sets activeType on select', () => {
      useSelectionStore.getState().select('hook', 'h-1')
      expect(useSelectionStore.getState().activeType).toBe('hook')
    })

    it('deselects a single item', () => {
      useSelectionStore.getState().select('skill', 'a', false)
      useSelectionStore.getState().select('skill', 'b', true)
      useSelectionStore.getState().deselect('skill', 'a')
      expect(useSelectionStore.getState().getSelectedIds('skill')).toEqual(['b'])
    })
  })

  describe('toggleSelection', () => {
    it('selects an unselected item', () => {
      useSelectionStore.getState().toggleSelection('session', 's-1')
      expect(useSelectionStore.getState().isSelected('session', 's-1')).toBe(true)
    })

    it('deselects a selected item', () => {
      useSelectionStore.getState().select('session', 's-1')
      useSelectionStore.getState().toggleSelection('session', 's-1')
      expect(useSelectionStore.getState().isSelected('session', 's-1')).toBe(false)
    })
  })

  describe('selectMultiple', () => {
    it('adds multiple items', () => {
      useSelectionStore.getState().selectMultiple('tool', ['t-1', 't-2', 't-3'])
      expect(useSelectionStore.getState().getSelectionCount('tool')).toBe(3)
    })

    it('sets lastSelectedId to last item', () => {
      useSelectionStore.getState().selectMultiple('tool', ['t-1', 't-2'])
      const context = useSelectionStore.getState().selections['tool']
      expect(context.lastSelectedId).toBe('t-2')
    })
  })

  describe('selectRange', () => {
    const allIds = ['a', 'b', 'c', 'd', 'e']

    it('selects a range between two items', () => {
      useSelectionStore.getState().selectRange('memory', 'b', 'd', allIds)
      const ids = useSelectionStore.getState().getSelectedIds('memory')
      expect(ids).toContain('b')
      expect(ids).toContain('c')
      expect(ids).toContain('d')
      expect(ids).not.toContain('a')
      expect(ids).not.toContain('e')
    })

    it('handles reversed range (from > to)', () => {
      useSelectionStore.getState().selectRange('memory', 'd', 'b', allIds)
      const ids = useSelectionStore.getState().getSelectedIds('memory')
      expect(ids).toContain('b')
      expect(ids).toContain('c')
      expect(ids).toContain('d')
    })

    it('does nothing if fromId is not in allIds', () => {
      useSelectionStore.getState().selectRange('memory', 'z', 'd', allIds)
      expect(useSelectionStore.getState().getSelectionCount('memory')).toBe(0)
    })
  })

  describe('selectAll / clearSelection', () => {
    it('selects all items', () => {
      useSelectionStore.getState().selectAll('skill', ['s-1', 's-2', 's-3'])
      const state = useSelectionStore.getState()
      expect(state.getSelectionCount('skill')).toBe(3)
      expect(state.selections['skill'].selectAllActive).toBe(true)
    })

    it('clears selection for a type', () => {
      useSelectionStore.getState().selectAll('skill', ['s-1', 's-2'])
      useSelectionStore.getState().clearSelection('skill')
      expect(useSelectionStore.getState().getSelectionCount('skill')).toBe(0)
      expect(useSelectionStore.getState().selections['skill'].selectAllActive).toBe(false)
    })

    it('clears all selections', () => {
      useSelectionStore.getState().selectAll('skill', ['s-1'])
      useSelectionStore.getState().selectAll('hook', ['h-1'])
      useSelectionStore.getState().clearAllSelections()
      expect(useSelectionStore.getState().getSelectionCount('skill')).toBe(0)
      expect(useSelectionStore.getState().getSelectionCount('hook')).toBe(0)
      expect(useSelectionStore.getState().activeType).toBeNull()
    })
  })

  describe('isSelected / getSelectedIds / getSelectionCount', () => {
    it('checks if item is selected', () => {
      useSelectionStore.getState().select('tool', 't-1')
      expect(useSelectionStore.getState().isSelected('tool', 't-1')).toBe(true)
      expect(useSelectionStore.getState().isSelected('tool', 't-2')).toBe(false)
    })

    it('returns selected IDs as array', () => {
      useSelectionStore.getState().selectAll('hook', ['h-1', 'h-2'])
      expect(useSelectionStore.getState().getSelectedIds('hook')).toHaveLength(2)
    })

    it('returns selection count', () => {
      useSelectionStore.getState().selectAll('session', ['s-1', 's-2', 's-3'])
      expect(useSelectionStore.getState().getSelectionCount('session')).toBe(3)
    })
  })

  describe('setActiveType', () => {
    it('sets the active selection type', () => {
      useSelectionStore.getState().setActiveType('skill')
      expect(useSelectionStore.getState().activeType).toBe('skill')
    })

    it('clears the active type with null', () => {
      useSelectionStore.getState().setActiveType('skill')
      useSelectionStore.getState().setActiveType(null)
      expect(useSelectionStore.getState().activeType).toBeNull()
    })
  })

  describe('clipboard', () => {
    const items: SelectedItem[] = [
      { id: 'a', type: 'skill', displayName: 'Skill A' },
      { id: 'b', type: 'skill', displayName: 'Skill B' },
    ]

    it('copies items to clipboard', () => {
      useSelectionStore.getState().copyToClipboard(items)
      const state = useSelectionStore.getState()
      expect(state.clipboard).toHaveLength(2)
      expect(state.clipboardOperation).toBe('copy')
    })

    it('cuts items to clipboard', () => {
      useSelectionStore.getState().cutToClipboard(items)
      expect(useSelectionStore.getState().clipboardOperation).toBe('cut')
    })

    it('hasClipboardItems returns true when clipboard has items', () => {
      useSelectionStore.getState().copyToClipboard(items)
      expect(useSelectionStore.getState().hasClipboardItems()).toBe(true)
    })

    it('hasClipboardItems returns false when clipboard is empty', () => {
      expect(useSelectionStore.getState().hasClipboardItems()).toBe(false)
    })

    it('clears clipboard', () => {
      useSelectionStore.getState().copyToClipboard(items)
      useSelectionStore.getState().clearClipboard()
      expect(useSelectionStore.getState().clipboard).toHaveLength(0)
      expect(useSelectionStore.getState().clipboardOperation).toBeNull()
    })
  })

  describe('isolates selections by type', () => {
    it('selecting items of one type does not affect another', () => {
      useSelectionStore.getState().selectAll('skill', ['s-1', 's-2'])
      useSelectionStore.getState().selectAll('hook', ['h-1'])
      expect(useSelectionStore.getState().getSelectionCount('skill')).toBe(2)
      expect(useSelectionStore.getState().getSelectionCount('hook')).toBe(1)
    })
  })
})
