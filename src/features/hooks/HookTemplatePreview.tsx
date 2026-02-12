/**
 * HookTemplatePreview Component
 * Shows template details and script preview with a "Use Template" button
 */

import { Shield, FileText, Bell, Wrench, FileCode, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { HookTemplate } from '@/types'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  security: Shield,
  logging: FileText,
  notifications: Bell,
  utility: Wrench,
}

const CATEGORY_COLORS: Record<string, string> = {
  security: 'text-red-500',
  logging: 'text-blue-500',
  notifications: 'text-purple-500',
  utility: 'text-green-500',
}

interface Props {
  template: HookTemplate
  onUseTemplate: (template: HookTemplate) => void
}

export function HookTemplatePreview({ template, onUseTemplate }: Props) {
  const Icon = CATEGORY_ICONS[template.category] ?? Wrench
  const color = CATEGORY_COLORS[template.category] ?? 'text-muted-foreground'

  return (
    <div className="rounded-lg border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Icon className={cn('h-5 w-5', color)} />
          <div>
            <h4 className="text-sm font-semibold">{template.name}</h4>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => onUseTemplate(template)}>
          Use Template
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Config summary */}
      <div className="flex items-center gap-4 border-b px-4 py-2 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Trigger:</span> {template.config.trigger}
        </div>
        {template.config.toolMatcher && (
          <div>
            <span className="font-medium">Matcher:</span>{' '}
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
              {template.config.toolMatcher}
            </span>
          </div>
        )}
        <div>
          <span className="font-medium">Timeout:</span> {template.config.timeout ?? 5000}ms
        </div>
        <div>
          <span className="font-medium">Language:</span> {template.scriptLanguage}
        </div>
      </div>

      {/* Script preview */}
      <div className="px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <FileCode className="h-3.5 w-3.5" />
          <span>Script Preview</span>
        </div>
        <pre className="max-h-64 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed">
          {template.scriptTemplate}
        </pre>
      </div>
    </div>
  )
}
