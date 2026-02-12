/**
 * HookCreationWizard Component
 * Step-by-step wizard for creating hooks: Template → Configure → Script → Review
 */

import { useState, useCallback, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Check, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  listTemplates,
  saveHook,
  getHooksGroupedByTrigger,
  validateHookConfig,
} from '@/services/hooks'
import { useHooksStore } from '@/stores/hooks-store'
import type { HookTrigger, HookTemplate, HarnessType } from '@/types'

type WizardStep = 'template' | 'configure' | 'script' | 'review'

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'template', label: 'Template' },
  { id: 'configure', label: 'Configure' },
  { id: 'script', label: 'Script' },
  { id: 'review', label: 'Review' },
]

const TRIGGERS: { value: HookTrigger; label: string }[] = [
  { value: 'PreToolUse', label: 'Pre Tool Use' },
  { value: 'PostToolUse', label: 'Post Tool Use' },
  { value: 'Notification', label: 'Notification' },
  { value: 'Stop', label: 'Stop' },
  { value: 'SessionStart', label: 'Session Start' },
  { value: 'SessionEnd', label: 'Session End' },
  { value: 'PreCommit', label: 'Pre Commit' },
  { value: 'PostCommit', label: 'Post Commit' },
]

const HARNESSES: { value: HarnessType; label: string }[] = [
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'copilot', label: 'GitHub Copilot' },
  { value: 'cline', label: 'Cline' },
  { value: 'continue', label: 'Continue' },
  { value: 'aider', label: 'Aider' },
]

const DEFAULT_SCRIPTS: Record<string, string> = {
  bash: '#!/bin/bash\n\n# Hook script\n# Exit 0 to allow, exit 2 to block\n\nexit 0\n',
  python:
    '#!/usr/bin/env python3\n\nimport sys\nimport json\n\ninput_data = json.loads(sys.stdin.read())\n\n# Process hook logic here\n\nsys.exit(0)  # 0 = allow, 2 = block\n',
  node: '#!/usr/bin/env node\n\nconst input = JSON.parse(require("fs").readFileSync("/dev/stdin", "utf-8"));\n\n// Process hook logic here\n\nprocess.exit(0); // 0 = allow, 2 = block\n',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HookCreationWizard({ open, onOpenChange }: Props) {
  const setHookGroups = useHooksStore((s) => s.setHookGroups)

  const [step, setStep] = useState<WizardStep>('template')
  const [templates, setTemplates] = useState<HookTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<HookTemplate | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState<HookTrigger>('PreToolUse')
  const [toolMatcher, setToolMatcher] = useState('')
  const [timeout, setTimeout_] = useState(5000)
  const [harness, setHarness] = useState<HarnessType>('claude-code')
  const [language, setLanguage] = useState<'bash' | 'python' | 'node'>('bash')
  const [scriptContent, setScriptContent] = useState(DEFAULT_SCRIPTS.bash)
  const [errors, setErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      listTemplates().then(setTemplates)
      // Reset
      setStep('template')
      setSelectedTemplate(null)
      setName('')
      setDescription('')
      setTrigger('PreToolUse')
      setToolMatcher('')
      setTimeout_(5000)
      setHarness('claude-code')
      setLanguage('bash')
      setScriptContent(DEFAULT_SCRIPTS.bash)
      setErrors([])
    }
  }, [open])

  const applyTemplate = useCallback((tpl: HookTemplate | null) => {
    setSelectedTemplate(tpl)
    if (tpl) {
      setName(tpl.name)
      setDescription(tpl.description)
      setTrigger(tpl.config.trigger)
      setToolMatcher(tpl.config.toolMatcher ?? '')
      setTimeout_(tpl.config.timeout ?? 5000)
      setLanguage(tpl.scriptLanguage)
      setScriptContent(tpl.scriptTemplate)
    }
  }, [])

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  const goNext = useCallback(() => {
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1].id)
    }
  }, [stepIndex])

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1].id)
    }
  }, [stepIndex])

  const handleCreate = useCallback(async () => {
    const validation = validateHookConfig({
      name,
      config: { trigger },
      scriptContent,
      harness,
    })
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSaving(true)
    try {
      await saveHook({
        name,
        description: description || undefined,
        config: {
          trigger,
          toolMatcher: toolMatcher || undefined,
          timeout,
        },
        scriptContent,
        scriptLanguage: language,
        harness,
      })
      const groups = await getHooksGroupedByTrigger()
      setHookGroups(groups)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }, [
    name,
    description,
    trigger,
    toolMatcher,
    timeout,
    scriptContent,
    language,
    harness,
    setHookGroups,
    onOpenChange,
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <Wand2 className="mr-2 inline-block h-5 w-5" />
            Hook Creation Wizard
          </DialogTitle>
          <DialogDescription>Create a new hook step by step</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              {i > 0 && <ChevronRight className="mx-1 h-3.5 w-3.5 text-muted-foreground" />}
              <button
                onClick={() => i <= stepIndex && setStep(s.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  step === s.id
                    ? 'bg-primary text-primary-foreground'
                    : i < stepIndex
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {i < stepIndex && <Check className="mr-1 inline-block h-3 w-3" />}
                {s.label}
              </button>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-auto py-4">
          {/* Step 1: Template */}
          {step === 'template' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Start from a template or create from scratch.
              </p>
              <button
                onClick={() => {
                  applyTemplate(null)
                  goNext()
                }}
                className={cn(
                  'w-full rounded-lg border-2 border-dashed p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/30',
                  !selectedTemplate && 'border-primary'
                )}
              >
                <div className="text-sm font-medium">Start from scratch</div>
                <div className="text-xs text-muted-foreground">
                  Create a new hook with blank configuration
                </div>
              </button>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      applyTemplate(tpl)
                      goNext()
                    }}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/30',
                      selectedTemplate?.id === tpl.id && 'border-primary bg-accent/30'
                    )}
                  >
                    <div className="text-sm font-medium">{tpl.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {tpl.description}
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tpl.category}
                      </span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tpl.scriptLanguage}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 'configure' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My hook"
                  aria-label="Hook name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What this hook does"
                  aria-label="Hook description"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Trigger</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as HookTrigger)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  aria-label="Trigger type"
                >
                  {TRIGGERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {(trigger === 'PreToolUse' || trigger === 'PostToolUse') && (
                <div>
                  <label className="mb-1 block text-xs font-medium">Tool Matcher</label>
                  <Input
                    value={toolMatcher}
                    onChange={(e) => setToolMatcher(e.target.value)}
                    placeholder="Edit|Write or *"
                    aria-label="Tool matcher pattern"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium">Timeout (ms)</label>
                <Input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout_(Number(e.target.value))}
                  min={0}
                  aria-label="Timeout in milliseconds"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Harness</label>
                <select
                  value={harness}
                  onChange={(e) => setHarness(e.target.value as HarnessType)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  aria-label="Target harness"
                >
                  {HARNESSES.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Script */}
          {step === 'script' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium">Script Language</label>
                <div className="flex gap-1">
                  {(['bash', 'python', 'node'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLanguage(l)
                        const currentIsDefault = Object.values(DEFAULT_SCRIPTS).some(
                          (s) => s === scriptContent
                        )
                        if (currentIsDefault) setScriptContent(DEFAULT_SCRIPTS[l])
                      }}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                        language === l
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {l === 'node' ? 'Node.js' : l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Script Content</label>
                <textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  className="h-60 w-full rounded-md border bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Script content"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              {errors.length > 0 && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2">
                  {errors.map((err) => (
                    <p key={err} className="text-sm text-red-500">
                      {err}
                    </p>
                  ))}
                </div>
              )}
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="text-sm font-medium">{name || '(not set)'}</p>
                </div>
                {description && (
                  <div>
                    <span className="text-xs text-muted-foreground">Description</span>
                    <p className="text-sm">{description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Trigger</span>
                    <p className="text-sm">{trigger}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Harness</span>
                    <p className="text-sm">{harness}</p>
                  </div>
                  {toolMatcher && (
                    <div>
                      <span className="text-xs text-muted-foreground">Tool Matcher</span>
                      <p className="text-sm font-mono">{toolMatcher}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-muted-foreground">Timeout</span>
                    <p className="text-sm">{timeout}ms</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Language</span>
                    <p className="text-sm">{language}</p>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Script Preview</span>
                <pre className="mt-1 max-h-40 overflow-auto rounded-lg border bg-muted/50 p-3 text-xs font-mono">
                  {scriptContent}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step === 'review' ? (
              <Button onClick={handleCreate} disabled={isSaving}>
                <Check className="mr-2 h-4 w-4" />
                {isSaving ? 'Creating...' : 'Create Hook'}
              </Button>
            ) : (
              <Button onClick={goNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
