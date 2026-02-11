/**
 * SettingsTree Component
 * Category navigation tree with search for settings
 */

import { useState, useEffect } from 'react'
import { Search, X, Settings2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSettingsStore, useSettingsList } from '@/stores'
import { SETTING_CATEGORIES } from '@/services/settings'
import type { SettingCategory } from '@/types'

export function SettingsTree() {
  const settings = useSettingsList()
  const searchQuery = useSettingsStore((s) => s.searchQuery)
  const setSearchQuery = useSettingsStore((s) => s.setSearchQuery)
  const activeCategory = useSettingsStore((s) => s.activeCategory)
  const setActiveCategory = useSettingsStore((s) => s.setActiveCategory)
  const modifiedOnly = useSettingsStore((s) => s.modifiedOnly)
  const setModifiedOnly = useSettingsStore((s) => s.setModifiedOnly)

  // Debounced local search state
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery])

  // Count settings per category from current list
  const categoryCounts = new Map<SettingCategory, number>()
  const categoryModifiedCounts = new Map<SettingCategory, number>()
  for (const entry of settings) {
    const cat = entry.definition.category
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
    if (entry.current.isModified) {
      categoryModifiedCounts.set(cat, (categoryModifiedCounts.get(cat) ?? 0) + 1)
    }
  }

  const hasFilters = searchQuery || activeCategory || modifiedOnly

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Search */}
      <div className="border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => setModifiedOnly(!modifiedOnly)}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
              modifiedOnly ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            Modified only
          </button>
          {hasFilters && (
            <button
              onClick={() => {
                useSettingsStore.getState().clearFilters()
                setLocalSearch('')
              }}
              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-auto py-2">
        {/* All settings entry */}
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-accent/50',
            !activeCategory && 'bg-accent/30 font-medium'
          )}
        >
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">All Settings</span>
          <span className="text-xs text-muted-foreground">{settings.length}</span>
        </button>

        {/* Category entries */}
        {SETTING_CATEGORIES.map((cat) => {
          const count = categoryCounts.get(cat.value) ?? 0
          const modCount = categoryModifiedCounts.get(cat.value) ?? 0
          if (count === 0 && searchQuery) return null
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(activeCategory === cat.value ? null : cat.value)}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-accent/50',
                activeCategory === cat.value && 'bg-accent/30 font-medium'
              )}
            >
              <span className="h-4 w-4" />
              <span className="flex-1">{cat.label}</span>
              {modCount > 0 && (
                <span className="rounded-full bg-primary/20 px-1.5 text-[10px] font-medium text-primary">
                  {modCount}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
