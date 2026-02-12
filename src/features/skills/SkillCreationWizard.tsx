/**
 * SkillCreationWizard Component
 * Multi-step wizard for creating new skills
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Wand2, Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { SKILL_CATEGORIES, validateSkillContent, saveSkill } from '@/services/skills'
import type { HarnessType, SkillCategory, SkillTrigger, Skill } from '@/types'

const HARNESS_OPTIONS: { value: HarnessType; label: string }[] = [
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'cline', label: 'Cline' },
  { value: 'continue', label: 'Continue' },
  { value: 'aider', label: 'Aider' },
]

const SKILL_TEMPLATES = [
  {
    id: 'slash-command',
    name: 'Slash Command',
    description: 'A skill triggered by a slash command',
    category: 'development' as SkillCategory,
    content:
      '# {{name}}\n\n{{description}}\n\n## Usage\n\nRun `/{{trigger}}` to invoke this skill.\n\n## Behavior\n\n1. Step one\n2. Step two\n3. Step three',
    trigger: '/my-command',
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review code for quality and best practices',
    category: 'development' as SkillCategory,
    content:
      '# Code Review\n\nReview code changes for quality, security, and best practices.\n\n## Checks\n\n- Code style consistency\n- Security vulnerabilities\n- Performance considerations\n- Test coverage',
    trigger: '/review',
  },
  {
    id: 'documentation',
    name: 'Documentation Generator',
    description: 'Auto-generate documentation from code',
    category: 'documentation' as SkillCategory,
    content:
      '# Documentation Generator\n\nAutomatically generate documentation from source code.\n\n## Supported Formats\n\n- JSDoc / TSDoc\n- README.md\n- API reference',
    trigger: '/docs',
  },
  {
    id: 'testing',
    name: 'Test Generator',
    description: 'Generate test cases for functions and components',
    category: 'testing' as SkillCategory,
    content:
      '# Test Generator\n\nGenerate comprehensive test cases.\n\n## Features\n\n- Unit test generation\n- Edge case detection\n- Mock setup assistance',
    trigger: '/gen-tests',
  },
]

const WIZARD_STEPS = ['Template', 'Configure', 'Content', 'Review'] as const

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (skill: Skill) => void
}

export function SkillCreationWizard({ open, onOpenChange, onCreated }: Props) {
  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SkillCategory>('development')
  const [harness, setHarness] = useState<HarnessType>('claude-code')
  const [triggerPattern, setTriggerPattern] = useState('')
  const [content, setContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  function handleTemplateSelect(templateId: string | null) {
    setSelectedTemplate(templateId)
    if (templateId) {
      const template = SKILL_TEMPLATES.find((t) => t.id === templateId)
      if (template) {
        setCategory(template.category)
        setTriggerPattern(template.trigger)
        setContent(template.content)
      }
    } else {
      setContent('# New Skill\n\nDescribe what this skill does.\n\n## Usage\n\n## Behavior\n')
    }
    setStep(1)
  }

  function handleBack() {
    setErrors([])
    setWarnings([])
    setStep((s) => Math.max(0, s - 1))
  }

  function handleNext() {
    setErrors([])
    setWarnings([])
    setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))
  }

  async function handleCreate() {
    setIsCreating(true)
    setErrors([])
    setWarnings([])

    try {
      const validation = await validateSkillContent(name, content, category)
      setWarnings(validation.warnings)

      if (!validation.valid) {
        setErrors(validation.errors)
        return
      }

      const triggers: SkillTrigger[] = triggerPattern.trim()
        ? [{ pattern: triggerPattern.trim(), isRegex: false, description: 'Primary trigger' }]
        : []

      const skill = await saveSkill({
        name,
        description,
        category,
        content,
        harness,
        triggers,
      })

      onCreated(skill)
      resetForm()
    } finally {
      setIsCreating(false)
    }
  }

  function resetForm() {
    setStep(0)
    setSelectedTemplate(null)
    setName('')
    setDescription('')
    setCategory('development')
    setHarness('claude-code')
    setTriggerPattern('')
    setContent('')
    setErrors([])
    setWarnings([])
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Create Skill
          </DialogTitle>
          <DialogDescription>
            Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-1">
          {WIZARD_STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs',
                  i === step ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
              {i < WIZARD_STEPS.length - 1 && (
                <div className={cn('h-px flex-1', i < step ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-auto py-2">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Choose a template to get started, or start from scratch.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SKILL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={cn(
                      'rounded-md border p-3 text-left transition-colors hover:bg-accent/50',
                      selectedTemplate === template.id && 'border-primary bg-accent/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{template.name}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleTemplateSelect(null)}
                className="w-full rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground transition-colors hover:bg-accent/50"
              >
                Start from scratch
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="wizard-name" className="mb-1 block text-xs font-medium">
                  Skill Name
                </label>
                <Input
                  id="wizard-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Skill"
                />
              </div>
              <div>
                <label htmlFor="wizard-description" className="mb-1 block text-xs font-medium">
                  Description
                </label>
                <Input
                  id="wizard-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what this skill does"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="wizard-category" className="mb-1 block text-xs font-medium">
                    Category
                  </label>
                  <select
                    id="wizard-category"
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
                <div>
                  <label htmlFor="wizard-harness" className="mb-1 block text-xs font-medium">
                    Target Harness
                  </label>
                  <select
                    id="wizard-harness"
                    value={harness}
                    onChange={(e) => setHarness(e.target.value as HarnessType)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {HARNESS_OPTIONS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="wizard-trigger" className="mb-1 block text-xs font-medium">
                  Trigger Pattern (optional)
                </label>
                <Input
                  id="wizard-trigger"
                  value={triggerPattern}
                  onChange={(e) => setTriggerPattern(e.target.value)}
                  placeholder="/my-command or 'natural language trigger'"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Slash command or natural language phrase that activates this skill
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2">
              <label htmlFor="wizard-content" className="text-xs font-medium">
                Skill Content (Markdown)
              </label>
              <textarea
                id="wizard-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[280px] resize-none rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="# Skill Name&#10;&#10;Describe what this skill does..."
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Review Skill</h3>
              <div className="space-y-2 rounded-md border p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{name || '(not set)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium max-w-[60%] text-right truncate">
                    {description || '(not set)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harness</span>
                  <span className="font-medium">{harness}</span>
                </div>
                {triggerPattern && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trigger</span>
                    <span className="font-mono text-xs">{triggerPattern}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Content length</span>
                  <span className="font-medium">{content.length} chars</span>
                </div>
              </div>

              {/* Content preview */}
              <div>
                <span className="text-xs font-medium text-muted-foreground">Content preview</span>
                <pre className="mt-1 max-h-[150px] overflow-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
                  {content.slice(0, 500)}
                  {content.length > 500 && '...'}
                </pre>
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
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            {step < WIZARD_STEPS.length - 1 ? (
              <Button size="sm" onClick={handleNext} className="gap-1.5">
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleCreate} disabled={isCreating} className="gap-1.5">
                <Wand2 className="h-3.5 w-3.5" />
                {isCreating ? 'Creating...' : 'Create Skill'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
