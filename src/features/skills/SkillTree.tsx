/**
 * SkillTree Component
 * Tree view for browsing skills grouped by harness or category
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  ChevronRight,
  Zap,
  Loader2,
  ChevronsUpDown,
  Layers,
  Grid3x3,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSkillsStore, useSkills, useSelectedSkill, useIsSkillsLoading } from '@/stores'
import type { SkillGroupBy } from '@/stores'
import { getSkill } from '@/services/skills'
import type { HarnessType, SkillCategory, SkillSummary } from '@/types'

/** Harness display config */
const HARNESS_LABELS: Record<HarnessType, string> = {
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  copilot: 'Copilot',
  cline: 'Cline',
  continue: 'Continue',
  aider: 'Aider',
}

const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'text-orange-400',
  cursor: 'text-blue-400',
  copilot: 'text-purple-400',
  cline: 'text-green-400',
  continue: 'text-teal-400',
  aider: 'text-amber-400',
}

/** Category display config */
const CATEGORY_LABELS: Record<SkillCategory, string> = {
  core: 'Core',
  development: 'Development',
  research: 'Research',
  security: 'Security',
  testing: 'Testing',
  documentation: 'Documentation',
  deployment: 'Deployment',
  custom: 'Custom',
}

/** Status indicator colors */
const STATUS_COLORS: Record<string, string> = {
  enabled: 'bg-green-500',
  disabled: 'bg-gray-400',
  error: 'bg-red-500',
}

/** Group skills by the current groupBy mode */
function groupSkills(skills: SkillSummary[], groupBy: SkillGroupBy): Map<string, SkillSummary[]> {
  const groups = new Map<string, SkillSummary[]>()

  for (const skill of skills) {
    const key = groupBy === 'harness' ? skill.harness : skill.category
    const existing = groups.get(key) ?? []
    existing.push(skill)
    groups.set(key, existing)
  }

  return groups
}

/** Get label for a group key */
function getGroupLabel(key: string, groupBy: SkillGroupBy): string {
  if (groupBy === 'harness') {
    return HARNESS_LABELS[key as HarnessType] ?? key
  }
  return CATEGORY_LABELS[key as SkillCategory] ?? key
}

/** Single skill item in the tree */
function SkillItem({
  skill,
  isSelected,
  onSelect,
}: {
  skill: SkillSummary
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        'hover:bg-accent/50',
        isSelected && 'bg-accent text-accent-foreground'
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_COLORS[skill.status])} />
      <Zap className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{skill.name}</span>
    </button>
  )
}

/** Tree group node with expand/collapse */
function TreeGroup({
  groupKey,
  groupBy,
  skills,
  expanded,
  onToggle,
  selectedSkillId,
  onSelectSkill,
}: {
  groupKey: string
  groupBy: SkillGroupBy
  skills: SkillSummary[]
  expanded: boolean
  onToggle: () => void
  selectedSkillId: string | null
  onSelectSkill: (skill: SkillSummary) => void
}) {
  const label = getGroupLabel(groupKey, groupBy)
  const enabledCount = skills.filter((s) => s.status === 'enabled').length

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent/50"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className={cn(groupBy === 'harness' && HARNESS_COLORS[groupKey as HarnessType])}>
          {label}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {enabledCount}/{skills.length}
        </span>
      </button>

      {expanded && (
        <div className="ml-3 space-y-0.5 border-l border-border/50 pl-2">
          {skills.map((skill) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              isSelected={selectedSkillId === skill.id}
              onSelect={() => onSelectSkill(skill)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function SkillTree() {
  const skills = useSkills()
  const selectedSkill = useSelectedSkill()
  const isLoading = useIsSkillsLoading()
  const searchQuery = useSkillsStore((s) => s.searchQuery)
  const groupBy = useSkillsStore((s) => s.groupBy)
  const expandedNodes = useSkillsStore((s) => s.expandedNodes)
  const setSearchQuery = useSkillsStore((s) => s.setSearchQuery)
  const setGroupBy = useSkillsStore((s) => s.setGroupBy)
  const toggleNode = useSkillsStore((s) => s.toggleNode)
  const expandAll = useSkillsStore((s) => s.expandAll)
  const collapseAll = useSkillsStore((s) => s.collapseAll)
  const selectSkill = useSkillsStore((s) => s.selectSkill)

  // Local search for debounce
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(localSearch), 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery])

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Group skills
  const grouped = useMemo(() => groupSkills(skills, groupBy), [skills, groupBy])

  async function handleSelectSkill(summary: SkillSummary) {
    const full = await getSkill(summary.id)
    selectSkill(full)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="relative p-3">
        <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 px-3 pb-3">
        {/* Group by toggle */}
        <Button
          variant={groupBy === 'harness' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-6 gap-1 px-2 text-xs"
          onClick={() => setGroupBy('harness')}
        >
          <Layers className="h-3 w-3" />
          Harness
        </Button>
        <Button
          variant={groupBy === 'category' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-6 gap-1 px-2 text-xs"
          onClick={() => setGroupBy('category')}
        >
          <Grid3x3 className="h-3 w-3" />
          Category
        </Button>

        <div className="flex-1" />

        {/* Expand/Collapse all */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => {
            if (expandedNodes.size > 0) {
              collapseAll()
            } else {
              expandAll()
            }
          }}
        >
          <ChevronsUpDown className="h-3 w-3" />
          {expandedNodes.size > 0 ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading skills...</span>
          </div>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Zap className="h-8 w-8" />
            <span className="text-sm">No skills found</span>
          </div>
        ) : (
          <div className="space-y-1">
            {Array.from(grouped.entries()).map(([key, groupSkills]) => (
              <TreeGroup
                key={key}
                groupKey={key}
                groupBy={groupBy}
                skills={groupSkills}
                expanded={expandedNodes.has(key)}
                onToggle={() => toggleNode(key)}
                selectedSkillId={selectedSkill?.id ?? null}
                onSelectSkill={handleSelectSkill}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
