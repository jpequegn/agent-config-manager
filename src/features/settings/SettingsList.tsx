/**
 * SettingsList Component
 * Shows settings for the active category with values and types
 */

import { AlertTriangle, Beaker, Clock } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useSettingsStore, useSettingsList, useSelectedSettingKey } from '@/stores'
import type { SettingEntry } from '@/services/settings'
import type { SettingValueType } from '@/types'

/** Type badge colors */
const TYPE_COLORS: Record<SettingValueType, string> = {
  string: 'bg-blue-500/20 text-blue-400',
  number: 'bg-green-500/20 text-green-400',
  boolean: 'bg-amber-500/20 text-amber-400',
  select: 'bg-purple-500/20 text-purple-400',
  multiselect: 'bg-pink-500/20 text-pink-400',
  path: 'bg-teal-500/20 text-teal-400',
  json: 'bg-orange-500/20 text-orange-400',
}

export function SettingsList() {
  const settings = useSettingsList()
  const selectedKey = useSelectedSettingKey()
  const selectKey = useSettingsStore((s) => s.selectKey)
  const activeCategory = useSettingsStore((s) => s.activeCategory)

  // Filter by active category (service already filtered, but for display grouping)
  const displayed = activeCategory
    ? settings.filter((e) => e.definition.category === activeCategory)
    : settings

  if (displayed.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">No settings found</p>
      </div>
    )
  }

  // Group by category when showing all
  const grouped = !activeCategory
    ? groupByCategory(displayed)
    : [{ category: activeCategory, entries: displayed }]

  return (
    <div className="h-full overflow-auto">
      {grouped.map((group) => (
        <div key={group.category}>
          {!activeCategory && (
            <div className="sticky top-0 border-b bg-muted/50 px-6 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
            </div>
          )}
          <div className="divide-y">
            {group.entries.map((entry) => (
              <SettingRow
                key={entry.definition.key}
                entry={entry}
                isSelected={selectedKey === entry.definition.key}
                onClick={() =>
                  selectKey(selectedKey === entry.definition.key ? null : entry.definition.key)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Individual setting row */
function SettingRow({
  entry,
  isSelected,
  onClick,
}: {
  entry: SettingEntry
  isSelected: boolean
  onClick: () => void
}) {
  const { definition: def, current } = entry

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-1 px-6 py-3 text-left transition-colors hover:bg-accent/30',
        isSelected && 'bg-accent/20'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{def.name}</span>
        <span
          className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', TYPE_COLORS[def.type])}
        >
          {def.type}
        </span>
        {current.isModified && (
          <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            modified
          </span>
        )}
        {def.experimental && (
          <Beaker className="h-3 w-3 text-amber-400" aria-label="Experimental" />
        )}
        {def.deprecated && (
          <AlertTriangle className="h-3 w-3 text-amber-400" aria-label="Deprecated" />
        )}
      </div>

      <p className="text-xs text-muted-foreground">{def.description}</p>

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="font-mono">{def.key}</span>
        <span>scope: {def.scope}</span>
        {current.isModified && current.modifiedAt && (
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {formatRelativeTime(current.modifiedAt)}
          </span>
        )}
      </div>

      {/* Value display */}
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Value:</span>
        <ValueDisplay value={current.value} type={def.type} />
        {current.isModified && (
          <>
            <span className="text-[10px] text-muted-foreground">Default:</span>
            <ValueDisplay value={def.defaultValue} type={def.type} dimmed />
          </>
        )}
      </div>
    </button>
  )
}

/** Renders a setting value appropriately */
function ValueDisplay({
  value,
  type,
  dimmed,
}: {
  value: unknown
  type: SettingValueType
  dimmed?: boolean
}) {
  const base = cn(
    'rounded px-1.5 py-0.5 font-mono text-[11px]',
    dimmed ? 'bg-muted/50 text-muted-foreground line-through' : 'bg-muted text-foreground'
  )

  if (type === 'boolean') {
    return (
      <span className={cn(base, !dimmed && (value ? 'text-green-400' : 'text-red-400'))}>
        {String(value)}
      </span>
    )
  }

  return (
    <span className={base}>
      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
    </span>
  )
}

/** Group entries by category */
function groupByCategory(entries: SettingEntry[]) {
  const map = new Map<string, SettingEntry[]>()
  for (const entry of entries) {
    const cat = entry.definition.category
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(entry)
  }
  return Array.from(map.entries()).map(([category, entries]) => ({ category, entries }))
}
