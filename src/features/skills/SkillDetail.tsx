/**
 * SkillDetail Component
 * Shows the full content and metadata of a selected skill
 */

import { Zap, Calendar, Clock, Tag, Folder, Activity, AlertCircle } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/shared'
import { useSelectedSkill } from '@/stores'
import type { HarnessType, SkillCategory } from '@/types'

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

export function SkillDetail() {
  const skill = useSelectedSkill()

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
            <Activity className="h-3 w-3" />
            {skill.stats.invocationCount} uses
          </span>
          {skill.stats.lastUsed && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last used {formatRelativeTime(skill.stats.lastUsed)}
            </span>
          )}
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

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <MarkdownRenderer content={skill.content} />
      </div>
    </div>
  )
}
