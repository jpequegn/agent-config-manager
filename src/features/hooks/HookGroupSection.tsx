/**
 * HookGroupSection Component
 * A group of hooks organized by trigger type
 */

import { HookCard } from './HookCard'
import type { HookTrigger, HookSummary } from '@/types'

const TRIGGER_LABELS: Record<HookTrigger, string> = {
  PreToolUse: 'Pre Tool Use',
  PostToolUse: 'Post Tool Use',
  Notification: 'Notification',
  Stop: 'Stop',
  SessionStart: 'Session Start',
  SessionEnd: 'Session End',
  PreCommit: 'Pre Commit',
  PostCommit: 'Post Commit',
}

const TRIGGER_DESCRIPTIONS: Record<HookTrigger, string> = {
  PreToolUse: 'Runs before a tool is executed. Can block the action.',
  PostToolUse: 'Runs after a tool executes successfully.',
  Notification: 'Runs when a notification is sent.',
  Stop: 'Runs when the agent stops.',
  SessionStart: 'Runs when a new session begins.',
  SessionEnd: 'Runs when a session ends.',
  PreCommit: 'Runs before a git commit.',
  PostCommit: 'Runs after a git commit.',
}

interface Props {
  trigger: HookTrigger
  hooks: HookSummary[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleStatus: (id: string) => void
  onEdit: (id: string) => void
}

export function HookGroupSection({
  trigger,
  hooks,
  selectedIds,
  onToggleSelect,
  onToggleStatus,
  onEdit,
}: Props) {
  const enabledCount = hooks.filter((h) => h.status === 'enabled').length

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{TRIGGER_LABELS[trigger]}</h3>
          <p className="text-xs text-muted-foreground">{TRIGGER_DESCRIPTIONS[trigger]}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {enabledCount}/{hooks.length} enabled
        </span>
      </div>
      <div className="space-y-2">
        {hooks.map((hook) => (
          <HookCard
            key={hook.id}
            hook={hook}
            isSelected={selectedIds.has(hook.id)}
            onToggleSelect={() => onToggleSelect(hook.id)}
            onToggleStatus={() => onToggleStatus(hook.id)}
            onEdit={() => onEdit(hook.id)}
          />
        ))}
      </div>
    </div>
  )
}
