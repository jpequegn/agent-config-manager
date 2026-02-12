/**
 * HookTemplateCard Component
 * Displays a single template in the gallery with name, description, and language badge
 */

import { Shield, FileText, Bell, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HookTemplate } from '@/types'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  security: Shield,
  logging: FileText,
  notifications: Bell,
  utility: Wrench,
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  security: { bg: 'bg-red-500/10', text: 'text-red-500' },
  logging: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  notifications: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  utility: { bg: 'bg-green-500/10', text: 'text-green-500' },
}

const LANG_LABELS: Record<string, string> = {
  bash: 'Bash',
  python: 'Python',
  node: 'Node.js',
}

interface Props {
  template: HookTemplate
  isSelected: boolean
  onSelect: () => void
}

export function HookTemplateCard({ template, isSelected, onSelect }: Props) {
  const Icon = CATEGORY_ICONS[template.category] ?? Wrench
  const colors = CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS.utility

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-56 shrink-0 flex-col rounded-lg border p-3 text-left transition-colors hover:bg-accent/50',
        isSelected && 'border-primary bg-accent/30'
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className={cn('rounded-md p-1.5', colors.bg)}>
          <Icon className={cn('h-3.5 w-3.5', colors.text)} />
        </div>
        <span className="text-sm font-medium truncate">{template.name}</span>
      </div>
      <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{template.description}</p>
      <div className="mt-auto flex items-center gap-2">
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {template.config.trigger}
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          {LANG_LABELS[template.scriptLanguage] ?? template.scriptLanguage}
        </span>
      </div>
    </button>
  )
}
