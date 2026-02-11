/**
 * HookEditor Component
 * Configuration form + Monaco script editor for creating/editing hooks
 */

import { useState, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Save, FileCode, AlertCircle } from 'lucide-react'
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
  getHook,
  saveHook,
  getHooksGroupedByTrigger,
  getMonacoLanguage,
  validateHookConfig,
} from '@/services/hooks'
import { useHooksStore } from '@/stores/hooks-store'
import type { HookTrigger, CreateHookOptions, HarnessType } from '@/types'

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

const LANGUAGES: { value: 'bash' | 'python' | 'node'; label: string }[] = [
  { value: 'bash', label: 'Bash' },
  { value: 'python', label: 'Python' },
  { value: 'node', label: 'Node.js' },
]

const DEFAULT_SCRIPTS: Record<string, string> = {
  bash: '#!/bin/bash\n\n# Hook script\n# Exit 0 to allow, exit 2 to block\n\nexit 0\n',
  python:
    '#!/usr/bin/env python3\n\nimport sys\nimport json\n\n# Read input from stdin\ninput_data = json.loads(sys.stdin.read())\n\n# Process hook logic here\n\nsys.exit(0)  # 0 = allow, 2 = block\n',
  node: '#!/usr/bin/env node\n\nconst input = JSON.parse(require("fs").readFileSync("/dev/stdin", "utf-8"));\n\n// Process hook logic here\n\nprocess.exit(0); // 0 = allow, 2 = block\n',
}

interface Props {
  hookId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HookEditor({ hookId, open, onOpenChange }: Props) {
  const setHookGroups = useHooksStore((s) => s.setHookGroups)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState<HookTrigger>('PreToolUse')
  const [toolMatcher, setToolMatcher] = useState('')
  const [toolMatcherIsRegex, setToolMatcherIsRegex] = useState(false)
  const [timeout, setTimeout_] = useState(5000)
  const [harness, setHarness] = useState<HarnessType>('claude-code')
  const [language, setLanguage] = useState<'bash' | 'python' | 'node'>('bash')
  const [scriptContent, setScriptContent] = useState(DEFAULT_SCRIPTS.bash)
  const [errors, setErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Load existing hook data
  useEffect(() => {
    if (!open) return
    if (hookId) {
      getHook(hookId).then((hook) => {
        if (hook) {
          setName(hook.name)
          setDescription(hook.description ?? '')
          setTrigger(hook.config.trigger)
          setToolMatcher(hook.config.toolMatcher ?? '')
          setToolMatcherIsRegex(hook.config.toolMatcherIsRegex ?? false)
          setTimeout_(hook.config.timeout ?? 5000)
          setHarness(hook.harness)
          setLanguage(hook.scriptLanguage === 'unknown' ? 'bash' : hook.scriptLanguage)
          setScriptContent(
            hook.scriptContent ?? DEFAULT_SCRIPTS[hook.scriptLanguage] ?? DEFAULT_SCRIPTS.bash
          )
        }
      })
    } else {
      // Reset for new hook
      setName('')
      setDescription('')
      setTrigger('PreToolUse')
      setToolMatcher('')
      setToolMatcherIsRegex(false)
      setTimeout_(5000)
      setHarness('claude-code')
      setLanguage('bash')
      setScriptContent(DEFAULT_SCRIPTS.bash)
    }
    setErrors([])
  }, [hookId, open])

  const handleLanguageChange = useCallback(
    (lang: 'bash' | 'python' | 'node') => {
      setLanguage(lang)
      // Only replace with default if content is still a default template
      const currentIsDefault = Object.values(DEFAULT_SCRIPTS).some((s) => s === scriptContent)
      if (currentIsDefault) {
        setScriptContent(DEFAULT_SCRIPTS[lang])
      }
    },
    [scriptContent]
  )

  const handleSave = useCallback(async () => {
    const options: CreateHookOptions = {
      name,
      description: description || undefined,
      config: {
        trigger,
        toolMatcher: toolMatcher || undefined,
        toolMatcherIsRegex: toolMatcherIsRegex || undefined,
        timeout,
      },
      scriptContent,
      scriptLanguage: language,
      harness,
    }

    const validation = validateHookConfig(options)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSaving(true)
    try {
      await saveHook(options, hookId ?? undefined)
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
    toolMatcherIsRegex,
    timeout,
    scriptContent,
    language,
    harness,
    hookId,
    setHookGroups,
    onOpenChange,
  ])

  const monacoLanguage = getMonacoLanguage(language)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{hookId ? 'Edit Hook' : 'Create Hook'}</DialogTitle>
          <DialogDescription>Configure the hook trigger, options, and script</DialogDescription>
        </DialogHeader>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2">
            {errors.map((err) => (
              <div key={err} className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {err}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left: Configuration form */}
          <div className="w-72 shrink-0 space-y-4 overflow-auto pr-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-xs font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My hook"
                aria-label="Hook name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this hook does"
                aria-label="Hook description"
              />
            </div>

            {/* Trigger */}
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

            {/* Tool matcher (only for tool-related triggers) */}
            {(trigger === 'PreToolUse' || trigger === 'PostToolUse') && (
              <div>
                <label className="mb-1 block text-xs font-medium">Tool Matcher</label>
                <Input
                  value={toolMatcher}
                  onChange={(e) => setToolMatcher(e.target.value)}
                  placeholder="Edit|Write or *"
                  aria-label="Tool matcher pattern"
                />
                <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={toolMatcherIsRegex}
                    onChange={(e) => setToolMatcherIsRegex(e.target.checked)}
                    className="h-3 w-3 rounded"
                  />
                  Regex pattern
                </label>
              </div>
            )}

            {/* Timeout */}
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

            {/* Harness */}
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

            {/* Language */}
            <div>
              <label className="mb-1 block text-xs font-medium">Script Language</label>
              <div className="flex gap-1">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => handleLanguageChange(l.value)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      language === l.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Monaco editor */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileCode className="h-3.5 w-3.5" />
                <span>
                  {language === 'python'
                    ? 'script.py'
                    : language === 'node'
                      ? 'script.js'
                      : 'script.sh'}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{monacoLanguage}</span>
              </div>
            </div>
            <div className="flex-1 min-h-[300px]">
              <Editor
                height="100%"
                language={monacoLanguage}
                value={scriptContent}
                onChange={(value) => setScriptContent(value ?? '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  tabSize: 2,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : hookId ? 'Save Changes' : 'Create Hook'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
