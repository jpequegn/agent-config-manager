/**
 * SkillsPage Component
 * Main page for the skills browser with tree navigation and detail view
 */

import { useEffect, useState } from 'react'
import { RefreshCw, Zap, Plus, Wand2, Trash2, MoreVertical, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSkillsStore, useSkills, useSelectedSkill } from '@/stores'
import {
  listSkills,
  toggleSkillStatus,
  duplicateSkill,
  duplicateSkillToHarness,
  deleteSkill,
} from '@/services/skills'
import { SkillTree } from './SkillTree'
import { SkillDetail } from './SkillDetail'
import { SkillEditor } from './SkillEditor'
import { SkillCreationWizard } from './SkillCreationWizard'
import type { Skill, HarnessType } from '@/types'

const HARNESS_OPTIONS: { value: HarnessType; label: string }[] = [
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'cline', label: 'Cline' },
  { value: 'continue', label: 'Continue' },
  { value: 'aider', label: 'Aider' },
]

export function SkillsPage() {
  const skills = useSkills()
  const selectedSkill = useSelectedSkill()
  const setSkills = useSkillsStore((s) => s.setSkills)
  const setIsLoading = useSkillsStore((s) => s.setIsLoading)
  const selectSkill = useSkillsStore((s) => s.selectSkill)
  const searchQuery = useSkillsStore((s) => s.searchQuery)
  const filterHarness = useSkillsStore((s) => s.filterHarness)
  const filterCategory = useSkillsStore((s) => s.filterCategory)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  /** Load skills with current filters */
  async function handleLoad() {
    setIsLoading(true)
    try {
      const results = await listSkills({
        harness: filterHarness ?? undefined,
        category: filterCategory ?? undefined,
        searchText: searchQuery || undefined,
      })
      setSkills(results)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load on mount and when filters change
  useEffect(() => {
    handleLoad()
  }, [searchQuery, filterHarness, filterCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear message after a delay
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [message])

  const enabledCount = skills.filter((s) => s.status === 'enabled').length

  function handleEdit(skill: Skill) {
    setEditingSkill(skill)
    setEditorOpen(true)
  }

  async function handleToggleStatus(skill: Skill) {
    const updated = await toggleSkillStatus(skill.id)
    selectSkill(updated)
    setMessage(`Skill ${updated.status === 'enabled' ? 'enabled' : 'disabled'}`)
    handleLoad()
  }

  async function handleDuplicate(skill: Skill) {
    const copy = await duplicateSkill(skill.id)
    selectSkill(copy)
    setMessage(`Duplicated "${skill.metadata.name}"`)
    handleLoad()
  }

  async function handleDuplicateToHarness(skill: Skill, targetHarness: HarnessType) {
    const copy = await duplicateSkillToHarness(skill.id, targetHarness)
    selectSkill(copy)
    setMessage(`Duplicated to ${targetHarness}`)
    handleLoad()
  }

  async function handleDelete(skill: Skill) {
    const result = await deleteSkill(skill.id)
    if (result.success) {
      selectSkill(null)
      setMessage('Skill deleted')
      handleLoad()
    }
  }

  function handleSkillSaved(skill: Skill) {
    selectSkill(skill)
    setEditorOpen(false)
    setEditingSkill(null)
    setMessage('Skill saved')
    handleLoad()
  }

  function handleSkillCreated(skill: Skill) {
    selectSkill(skill)
    setWizardOpen(false)
    setMessage('Skill created')
    handleLoad()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">Skills</h1>
            <p className="text-sm text-muted-foreground">Browse and manage agent skills</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="text-xs text-green-400" role="status">
              {message}
            </span>
          )}
          <span
            className="text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
            aria-label={`${enabledCount} enabled out of ${skills.length} total skills`}
          >
            {enabledCount} enabled / {skills.length} total
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWizardOpen(true)}
            className="gap-2"
            aria-label="Create new skill"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Skill
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="More actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setWizardOpen(true)}>
                <Wand2 className="mr-2 h-4 w-4" />
                Creation Wizard
              </DropdownMenuItem>
              {selectedSkill && (
                <>
                  <DropdownMenuItem onClick={() => handleDuplicate(selectedSkill)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Selected
                  </DropdownMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate to Harness...
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left">
                      {HARNESS_OPTIONS.filter((h) => h.value !== selectedSkill.harness).map((h) => (
                        <DropdownMenuItem
                          key={h.value}
                          onClick={() => handleDuplicateToHarness(selectedSkill, h.value)}
                        >
                          {h.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenuItem
                    onClick={() => handleDelete(selectedSkill)}
                    className="text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={handleLoad}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Skill tree */}
        <div className="w-80 shrink-0 border-r">
          <h2 className="sr-only">Skill List</h2>
          <SkillTree />
        </div>

        {/* Right panel - Skill detail */}
        <div className="flex-1">
          <h2 className="sr-only">Skill Details</h2>
          <SkillDetail
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      {/* Dialogs */}
      <SkillEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        skill={editingSkill}
        onSaved={handleSkillSaved}
      />
      <SkillCreationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCreated={handleSkillCreated}
      />
    </div>
  )
}
