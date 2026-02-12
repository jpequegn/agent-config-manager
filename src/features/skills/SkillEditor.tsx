/**
 * SkillEditor Component
 * Dialog for editing skill metadata and markdown content
 */

import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SKILL_CATEGORIES, validateSkillContent, saveSkill } from '@/services/skills'
import type { Skill, SkillCategory } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: Skill | null
  onSaved: (skill: Skill) => void
}

export function SkillEditor({ open, onOpenChange, skill, onSaved }: Props) {
  if (!open || !skill) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Skill</DialogTitle>
          <DialogDescription>Update skill metadata and content</DialogDescription>
        </DialogHeader>
        <SkillEditorForm skill={skill} onSaved={onSaved} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function SkillEditorForm({
  skill,
  onSaved,
  onCancel,
}: {
  skill: Skill
  onSaved: (skill: Skill) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(skill.metadata.name)
  const [description, setDescription] = useState(skill.metadata.description)
  const [category, setCategory] = useState<SkillCategory>(skill.metadata.category)
  const [content, setContent] = useState(skill.content)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  async function handleSave() {
    setIsSaving(true)
    setErrors([])
    setWarnings([])

    try {
      const validation = await validateSkillContent(name, content, category)
      setWarnings(validation.warnings)

      if (!validation.valid) {
        setErrors(validation.errors)
        return
      }

      const updated = await saveSkill(
        {
          name,
          description,
          category,
          content,
          harness: skill.harness,
          triggers: skill.metadata.triggers,
        },
        skill.id
      )
      onSaved(updated)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      {/* Metadata fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="skill-name" className="mb-1 block text-xs font-medium">
            Name
          </label>
          <Input
            id="skill-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Skill name"
          />
        </div>
        <div>
          <label htmlFor="skill-category" className="mb-1 block text-xs font-medium">
            Category
          </label>
          <select
            id="skill-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as SkillCategory)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SKILL_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="skill-description" className="mb-1 block text-xs font-medium">
          Description
        </label>
        <Input
          id="skill-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the skill"
        />
      </div>

      {/* Content editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <label htmlFor="skill-content" className="mb-1 block text-xs font-medium">
          Content (Markdown)
        </label>
        <textarea
          id="skill-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 min-h-[200px] resize-none rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="# Skill Name&#10;&#10;Skill content in markdown..."
        />
      </div>

      {/* Validation messages */}
      {errors.length > 0 && (
        <div className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
