/**
 * LearningsList Component
 * Filterable list of learnings organized by category
 */

import { Search, BookOpen, Loader2, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import {
  useLearningsStore,
  useLearnings,
  useSelectedLearning,
  useIsLearningsLoading,
} from '@/stores'
import { getLearning } from '@/services/learnings'
import { LEARNING_CATEGORIES } from '@/services/learnings'
import type { LearningCategory, MemoryEntrySummary } from '@/types'

/** Category colors */
const CATEGORY_COLORS: Record<LearningCategory, string> = {
  debugging: 'bg-red-500/20 text-red-400',
  architecture: 'bg-blue-500/20 text-blue-400',
  patterns: 'bg-purple-500/20 text-purple-400',
  decisions: 'bg-amber-500/20 text-amber-400',
  preferences: 'bg-green-500/20 text-green-400',
  errors: 'bg-orange-500/20 text-orange-400',
  solutions: 'bg-teal-500/20 text-teal-400',
  other: 'bg-gray-500/20 text-gray-400',
}

export function LearningsList() {
  const learnings = useLearnings()
  const selectedLearning = useSelectedLearning()
  const isLoading = useIsLearningsLoading()
  const searchQuery = useLearningsStore((s) => s.searchQuery)
  const filterCategory = useLearningsStore((s) => s.filterCategory)
  const setSearchQuery = useLearningsStore((s) => s.setSearchQuery)
  const setFilterCategory = useLearningsStore((s) => s.setFilterCategory)
  const selectLearning = useLearningsStore((s) => s.selectLearning)

  async function handleSelect(summary: MemoryEntrySummary) {
    const full = await getLearning(summary.id)
    selectLearning(full)
  }

  // Group by category for tree view
  const grouped = new Map<LearningCategory, MemoryEntrySummary[]>()
  for (const l of learnings) {
    const cat = l.category ?? 'other'
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(l)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="relative p-3">
        <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search learnings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
        <Button
          variant={filterCategory === null ? 'secondary' : 'ghost'}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setFilterCategory(null)}
        >
          All
        </Button>
        {LEARNING_CATEGORIES.map(({ value, label }) => (
          <Button
            key={value}
            variant={filterCategory === value ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setFilterCategory(filterCategory === value ? null : value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Learnings list grouped by category */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading learnings...</span>
          </div>
        ) : learnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <BookOpen className="h-8 w-8" />
            <span className="text-sm">No learnings found</span>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <div className="mb-1.5 flex items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {LEARNING_CATEGORIES.find((c) => c.value === category)?.label ?? category}
                  </span>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <div className="space-y-1">
                  {items.map((learning) => (
                    <button
                      key={learning.id}
                      onClick={() => handleSelect(learning)}
                      className={cn(
                        'flex w-full flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors',
                        'hover:bg-accent/50',
                        selectedLearning?.id === learning.id
                          ? 'border-primary bg-accent'
                          : 'border-transparent'
                      )}
                    >
                      <span className="text-sm font-medium leading-snug">{learning.title}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                            CATEGORY_COLORS[learning.category ?? 'other']
                          )}
                        >
                          {learning.category ?? 'other'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(learning.createdAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
