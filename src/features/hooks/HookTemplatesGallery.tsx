/**
 * HookTemplatesGallery Component
 * Displays hook templates organized by category with horizontal scroll and preview
 */

import { useEffect, useState, useCallback } from 'react'
import { LayoutGrid } from 'lucide-react'
import { getTemplatesByCategory } from '@/services/hooks'
import type { TemplateCategory } from '@/services/hooks'
import { HookTemplateCard } from './HookTemplateCard'
import { HookTemplatePreview } from './HookTemplatePreview'
import type { HookTemplate } from '@/types'

interface Props {
  onUseTemplate: (template: HookTemplate) => void
}

export function HookTemplatesGallery({ onUseTemplate }: Props) {
  const [groups, setGroups] = useState<{ category: TemplateCategory; templates: HookTemplate[] }[]>(
    []
  )
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getTemplatesByCategory().then((data) => {
      setGroups(data)
      setIsLoading(false)
    })
  }, [])

  const selectedTemplate = groups
    .flatMap((g) => g.templates)
    .find((t) => t.id === selectedTemplateId)

  const handleSelect = useCallback((id: string) => {
    setSelectedTemplateId((prev) => (prev === id ? null : id))
  }, [])

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">Loading templates...</div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Templates</h3>
        <span className="text-xs text-muted-foreground">
          ({groups.reduce((acc, g) => acc + g.templates.length, 0)} available)
        </span>
      </div>

      {groups.map(({ category, templates }) => (
        <div key={category.id}>
          <div className="mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {category.label}
            </h4>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {templates.map((tpl) => (
              <HookTemplateCard
                key={tpl.id}
                template={tpl}
                isSelected={selectedTemplateId === tpl.id}
                onSelect={() => handleSelect(tpl.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {selectedTemplate && (
        <HookTemplatePreview template={selectedTemplate} onUseTemplate={onUseTemplate} />
      )}
    </div>
  )
}
