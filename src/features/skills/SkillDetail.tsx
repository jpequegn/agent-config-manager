/**
 * SkillDetail Component
 * Shows the full content and metadata of a selected skill with tabbed interface
 */

import {
  Zap,
  Calendar,
  Clock,
  Tag,
  Folder,
  Activity,
  AlertCircle,
  Copy,
  Pencil,
  Power,
  BarChart3,
  History,
  FileCode,
  FileText,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from '@/components/shared'
import { useSelectedSkill, useActiveSkillTab, useSkillsStore } from '@/stores'
import type { HarnessType, SkillCategory } from '@/types'
import type { SkillDetailTab } from '@/stores'

/** Harness badge colors */
const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-teal-500/20 text-teal-400',
  aider: 'bg-amber-500/20 text-amber-400',
}

/** Category colors */
const CATEGORY_COLORS: Record<SkillCategory, string> = {
  core: 'bg-gray-500/20 text-gray-400',
  development: 'bg-blue-500/20 text-blue-400',
  research: 'bg-purple-500/20 text-purple-400',
  security: 'bg-red-500/20 text-red-400',
  testing: 'bg-green-500/20 text-green-400',
  documentation: 'bg-amber-500/20 text-amber-400',
  deployment: 'bg-teal-500/20 text-teal-400',
  custom: 'bg-pink-500/20 text-pink-400',
}

/** Status badge */
const STATUS_STYLES: Record<string, string> = {
  enabled: 'bg-green-500/20 text-green-400',
  disabled: 'bg-gray-500/20 text-gray-400',
  error: 'bg-red-500/20 text-red-400',
}

/** Tab configuration */
const TABS: { id: SkillDetailTab; label: string; icon: typeof FileText }[] = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'schema', label: 'Schema', icon: FileCode },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
]

export function SkillDetail() {
  const skill = useSelectedSkill()
  const activeTab = useActiveSkillTab()
  const setActiveTab = useSkillsStore((s) => s.setActiveTab)

  if (!skill) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <Zap className="h-12 w-12" />
        <p className="text-sm">Select a skill to view its details</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold leading-snug">{skill.metadata.name}</h2>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  STATUS_STYLES[skill.status]
                )}
              >
                {skill.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{skill.metadata.description}</p>
          </div>

          {/* Action buttons */}
          <div className="ml-4 flex shrink-0 items-center gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5" aria-label="Edit skill">
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" aria-label="Copy skill">
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              aria-label={skill.status === 'enabled' ? 'Disable skill' : 'Enable skill'}
            >
              <Power className="h-3.5 w-3.5" aria-hidden="true" />
              {skill.status === 'enabled' ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              HARNESS_COLORS[skill.harness]
            )}
          >
            {skill.harness}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              CATEGORY_COLORS[skill.metadata.category]
            )}
          >
            {skill.metadata.category}
          </span>
          {skill.metadata.version && <span>v{skill.metadata.version}</span>}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Updated {formatRelativeTime(skill.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            {skill.filePath}
          </span>
        </div>

        {/* Tags */}
        {skill.metadata.tags && skill.metadata.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {skill.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Error */}
        {skill.error && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {skill.error}
          </div>
        )}

        {/* Triggers */}
        {skill.metadata.triggers.length > 0 && (
          <div className="mt-3">
            <span className="text-xs font-medium text-muted-foreground">Triggers</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {skill.metadata.triggers.map((trigger, i) => (
                <span
                  key={i}
                  className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {trigger.pattern}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b px-6" role="tablist" aria-label="Skill detail tabs">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'content' && (
          <div id="tabpanel-content" role="tabpanel" aria-labelledby="tab-content" className="p-6">
            <MarkdownRenderer content={skill.content} />
          </div>
        )}

        {activeTab === 'schema' && (
          <div id="tabpanel-schema" role="tabpanel" aria-labelledby="tab-schema" className="p-6">
            {skill.schema ? (
              <pre className="overflow-auto rounded-md bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
                {JSON.stringify(skill.schema, null, 2)}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <FileCode className="h-8 w-8" />
                <p className="text-sm">No schema defined for this skill</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div id="tabpanel-stats" role="tabpanel" aria-labelledby="tab-stats" className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Total Invocations"
                value={skill.stats.invocationCount.toString()}
                icon={Activity}
              />
              <StatCard
                label="Last Used"
                value={skill.stats.lastUsed ? formatRelativeTime(skill.stats.lastUsed) : 'Never'}
                icon={Clock}
              />
              <StatCard
                label="Avg Execution Time"
                value={
                  skill.stats.avgExecutionTime
                    ? `${(skill.stats.avgExecutionTime / 1000).toFixed(1)}s`
                    : 'N/A'
                }
                icon={BarChart3}
              />
              <StatCard
                label="Success Rate"
                value={
                  skill.stats.successRate != null
                    ? `${(skill.stats.successRate * 100).toFixed(0)}%`
                    : 'N/A'
                }
                icon={Activity}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div id="tabpanel-history" role="tabpanel" aria-labelledby="tab-history" className="p-6">
            {skill.history && skill.history.length > 0 ? (
              <div className="space-y-3">
                {skill.history.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-md border px-4 py-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                      {i === 0 ? '●' : '○'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium">v{entry.version}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(entry.date)}
                        </span>
                        {entry.author && (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {entry.author}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{entry.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <History className="h-8 w-8" />
                <p className="text-sm">No version history available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Stat card sub-component */
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Activity
}) {
  return (
    <div className="rounded-md border px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}
