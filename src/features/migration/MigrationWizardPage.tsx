/**
 * MigrationWizardPage Component
 * 5-step wizard for cross-harness configuration migration
 * Steps: Select → Analyze → Preview → Execute → Result
 */

import { useCallback } from 'react'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  XCircle,
  Shield,
  RotateCcw,
  Loader2,
  ArrowLeftRight,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, formatBytes } from '@/lib/utils'
import { useMigrationStore } from '@/stores/migration-store'
import { getHarnessConfig, getAllHarnessTypes } from '@/components/harness'
import { HarnessIcon } from '@/components/harness/HarnessIcon'
import {
  checkCompatibility,
  analyzeMigration,
  createBackup,
  executeMigration,
  rollbackMigration,
  MIGRATION_STEPS,
} from '@/services/migration'
import type { MigrationStep, MigrationItem, CompatibilityLevel } from '@/services/migration'

// ============================================
// Step indicator
// ============================================

function StepIndicator({ currentStep }: { currentStep: MigrationStep }) {
  const currentIndex = MIGRATION_STEPS.findIndex((s) => s.step === currentStep)

  return (
    <div className="flex items-center gap-2">
      {MIGRATION_STEPS.map(({ step, label }, i) => {
        const isActive = i === currentIndex
        const isDone = i < currentIndex
        return (
          <div key={step} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-6 bg-border" />}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  isActive && 'bg-primary text-primary-foreground',
                  isDone && 'bg-primary/20 text-primary',
                  !isActive && !isDone && 'bg-muted text-muted-foreground'
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs',
                  isActive && 'font-medium text-foreground',
                  !isActive && 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// Compatibility badge
// ============================================

function CompatibilityBadge({ level }: { level: CompatibilityLevel }) {
  const config: Record<CompatibilityLevel, { label: string; className: string }> = {
    full: { label: 'Full', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    partial: { label: 'Partial', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    minimal: {
      label: 'Minimal',
      className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    none: { label: 'None', className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  }
  const c = config[level]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        c.className
      )}
    >
      {c.label}
    </span>
  )
}

// ============================================
// Step 1: Select Harnesses
// ============================================

function StepSelect() {
  const sourceHarness = useMigrationStore((s) => s.sourceHarness)
  const targetHarness = useMigrationStore((s) => s.targetHarness)
  const setSourceHarness = useMigrationStore((s) => s.setSourceHarness)
  const setTargetHarness = useMigrationStore((s) => s.setTargetHarness)

  const allHarnesses = getAllHarnessTypes()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        {/* Source */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Source Harness</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Select the harness to migrate configurations from
          </p>
          <div className="space-y-2">
            {allHarnesses.map((type) => {
              const config = getHarnessConfig(type)
              const isSelected = sourceHarness === type
              const isDisabled = targetHarness === type
              return (
                <button
                  key={type}
                  onClick={() => setSourceHarness(type)}
                  disabled={isDisabled}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    isSelected && 'border-primary bg-primary/5',
                    !isSelected && !isDisabled && 'hover:bg-muted/50',
                    isDisabled && 'cursor-not-allowed opacity-40'
                  )}
                >
                  <HarnessIcon type={type} className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">{config.name}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </div>
                  {isSelected && <Check className="ml-auto h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Target */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Target Harness</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Select the harness to migrate configurations to
          </p>
          <div className="space-y-2">
            {allHarnesses.map((type) => {
              const config = getHarnessConfig(type)
              const isSelected = targetHarness === type
              const isDisabled = sourceHarness === type
              return (
                <button
                  key={type}
                  onClick={() => setTargetHarness(type)}
                  disabled={isDisabled}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    isSelected && 'border-primary bg-primary/5',
                    !isSelected && !isDisabled && 'hover:bg-muted/50',
                    isDisabled && 'cursor-not-allowed opacity-40'
                  )}
                >
                  <HarnessIcon type={type} className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">{config.name}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </div>
                  {isSelected && <Check className="ml-auto h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Step 2: Analyze Compatibility
// ============================================

function StepAnalyze() {
  const compatibility = useMigrationStore((s) => s.compatibility)
  const sourceHarness = useMigrationStore((s) => s.sourceHarness)
  const targetHarness = useMigrationStore((s) => s.targetHarness)

  if (!compatibility || !sourceHarness || !targetHarness) return null

  const sourceConfig = getHarnessConfig(sourceHarness)
  const targetConfig = getHarnessConfig(targetHarness)

  return (
    <div className="space-y-6">
      {/* Migration direction */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <HarnessIcon type={sourceHarness} className="h-5 w-5" />
          <span className="font-medium">{sourceConfig.name}</span>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <HarnessIcon type={targetHarness} className="h-5 w-5" />
          <span className="font-medium">{targetConfig.name}</span>
        </div>
      </div>

      {/* Compatibility score */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Compatibility Score</h3>
            <p className="mt-1 text-2xl font-bold">{compatibility.score}%</p>
          </div>
          <CompatibilityBadge level={compatibility.level} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{compatibility.summary}</p>
      </Card>

      {/* Warnings */}
      {compatibility.warnings.length > 0 && (
        <Card className="border-amber-500/20 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400">Warnings</h4>
              <ul className="mt-1 space-y-1">
                {compatibility.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Unsupported features */}
      {compatibility.unsupportedFeatures.length > 0 && (
        <Card className="border-red-500/20 p-4">
          <div className="flex items-start gap-2">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                Unsupported in {targetConfig.name}
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {compatibility.unsupportedFeatures.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-600 dark:text-red-400"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Step 3: Preview Changes
// ============================================

function MigrationItemRow({
  item,
  onToggle,
}: {
  item: MigrationItem
  onToggle: (id: string) => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        item.selected ? 'border-border' : 'border-transparent bg-muted/30 opacity-60'
      )}
    >
      <input
        type="checkbox"
        checked={item.selected}
        onChange={() => onToggle(item.id)}
        className="h-4 w-4 rounded border-input"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{item.name}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {item.type}
          </span>
          <CompatibilityBadge level={item.compatibility} />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
        {item.warnings.length > 0 && (
          <div className="mt-1 flex items-start gap-1">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              {item.warnings[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function DiffView({ item }: { item: MigrationItem }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">Source</h4>
        <pre className="rounded-md bg-muted/50 p-3 text-xs whitespace-pre-wrap">
          {item.sourceContent}
        </pre>
      </div>
      <div>
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">Target</h4>
        <pre className="rounded-md bg-muted/50 p-3 text-xs whitespace-pre-wrap">
          {item.targetContent}
        </pre>
      </div>
    </div>
  )
}

function StepPreview() {
  const plan = useMigrationStore((s) => s.plan)
  const toggleItemSelection = useMigrationStore((s) => s.toggleItemSelection)
  const selectAllItems = useMigrationStore((s) => s.selectAllItems)
  const deselectAllItems = useMigrationStore((s) => s.deselectAllItems)

  if (!plan) return null

  const selectedCount = plan.items.filter((i) => i.selected).length
  const totalCount = plan.items.length

  // Group items by type
  const grouped = plan.items.reduce<Record<string, MigrationItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {})

  // Show diff for first selected item
  const firstSelected = plan.items.find((i) => i.selected)

  return (
    <div className="space-y-4">
      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedCount} of {totalCount} items selected
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAllItems}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAllItems}>
            Deselect All
          </Button>
        </div>
      </div>

      {/* Item groups */}
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            {type}s ({items.length})
          </h3>
          <div className="space-y-1.5">
            {items.map((item) => (
              <MigrationItemRow key={item.id} item={item} onToggle={toggleItemSelection} />
            ))}
          </div>
        </div>
      ))}

      {/* Diff preview */}
      {firstSelected && (
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            Diff Preview — {firstSelected.name}
          </h3>
          <DiffView item={firstSelected} />
        </div>
      )}
    </div>
  )
}

// ============================================
// Step 4: Execute
// ============================================

function StepExecute() {
  const isExecuting = useMigrationStore((s) => s.isExecuting)
  const backup = useMigrationStore((s) => s.backup)
  const plan = useMigrationStore((s) => s.plan)

  const selectedCount = plan?.items.filter((i) => i.selected).length ?? 0

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {isExecuting ? (
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h3 className="mt-4 text-lg font-medium">Migrating configurations...</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Transferring {selectedCount} items. Please wait.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-lg font-medium">Ready to Migrate</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedCount} items will be migrated
          </p>
          {backup && (
            <Card className="mx-auto mt-4 max-w-sm p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                <div className="text-left">
                  <h4 className="text-sm font-medium">Backup Created</h4>
                  <p className="text-xs text-muted-foreground">
                    {backup.itemCount} items backed up ({formatBytes(backup.size)})
                  </p>
                  <p className="text-[10px] text-muted-foreground">ID: {backup.id}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Step 5: Results
// ============================================

function StepResult() {
  const result = useMigrationStore((s) => s.result)
  const isRollingBack = useMigrationStore((s) => s.isRollingBack)

  if (!result) return null

  const sourceConfig = getHarnessConfig(result.source)
  const targetConfig = getHarnessConfig(result.target)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="text-center">
        {result.failedItems === 0 ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        ) : (
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
        )}
        <h3 className="mt-3 text-lg font-medium">
          Migration {result.failedItems === 0 ? 'Complete' : 'Completed with Issues'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {sourceConfig.name} → {targetConfig.name} in {(result.duration / 1000).toFixed(1)}s
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {result.migratedItems}
          </div>
          <div className="text-xs text-muted-foreground">Migrated</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {result.warningItems}
          </div>
          <div className="text-xs text-muted-foreground">Warnings</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {result.failedItems}
          </div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-muted-foreground">{result.skippedItems}</div>
          <div className="text-xs text-muted-foreground">Skipped</div>
        </Card>
      </div>

      {/* Item results */}
      <div className="space-y-1.5">
        {result.items
          .filter((i) => i.status !== 'skipped')
          .map((item) => {
            const statusConfig: Record<string, { icon: typeof Check; className: string }> = {
              migrated: { icon: CheckCircle2, className: 'text-emerald-500' },
              warning: { icon: AlertTriangle, className: 'text-amber-500' },
              failed: { icon: XCircle, className: 'text-red-500' },
              pending: { icon: Info, className: 'text-muted-foreground' },
            }
            const sc = statusConfig[item.status] ?? statusConfig.pending
            const StatusIcon = sc.icon
            return (
              <div key={item.id} className="flex items-center gap-2 rounded-lg border p-2.5">
                <StatusIcon className={cn('h-4 w-4 shrink-0', sc.className)} />
                <span className="text-sm">{item.name}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {item.type}
                </span>
                <span className={cn('ml-auto text-xs', sc.className)}>{item.status}</span>
              </div>
            )
          })}
      </div>

      {/* Rollback */}
      {isRollingBack && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Rolling back migration...
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Wizard Page
// ============================================

export function MigrationWizardPage() {
  const currentStep = useMigrationStore((s) => s.currentStep)
  const sourceHarness = useMigrationStore((s) => s.sourceHarness)
  const targetHarness = useMigrationStore((s) => s.targetHarness)
  const plan = useMigrationStore((s) => s.plan)
  const result = useMigrationStore((s) => s.result)
  const isAnalyzing = useMigrationStore((s) => s.isAnalyzing)
  const isExecuting = useMigrationStore((s) => s.isExecuting)
  const isRollingBack = useMigrationStore((s) => s.isRollingBack)
  const message = useMigrationStore((s) => s.message)

  const setStep = useMigrationStore((s) => s.setStep)
  const setCompatibility = useMigrationStore((s) => s.setCompatibility)
  const setPlan = useMigrationStore((s) => s.setPlan)
  const setBackup = useMigrationStore((s) => s.setBackup)
  const setResult = useMigrationStore((s) => s.setResult)
  const setIsAnalyzing = useMigrationStore((s) => s.setIsAnalyzing)
  const setIsExecuting = useMigrationStore((s) => s.setIsExecuting)
  const setIsRollingBack = useMigrationStore((s) => s.setIsRollingBack)
  const setMessage = useMigrationStore((s) => s.setMessage)
  const reset = useMigrationStore((s) => s.reset)

  const selectedItemCount = plan?.items.filter((i) => i.selected).length ?? 0

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 'select':
        return sourceHarness !== null && targetHarness !== null
      case 'analyze':
        return plan !== null
      case 'preview':
        return selectedItemCount > 0
      case 'execute':
        return result !== null
      case 'result':
        return false
    }
  }

  const handleNext = useCallback(async () => {
    if (currentStep === 'select' && sourceHarness && targetHarness) {
      // Move to analyze and run analysis
      setStep('analyze')
      setIsAnalyzing(true)
      try {
        const compat = await checkCompatibility(sourceHarness, targetHarness)
        setCompatibility(compat)
        const migrationPlan = await analyzeMigration(sourceHarness, targetHarness)
        setPlan(migrationPlan)
      } finally {
        setIsAnalyzing(false)
      }
    } else if (currentStep === 'analyze') {
      setStep('preview')
    } else if (currentStep === 'preview' && plan) {
      // Move to execute, create backup, and run
      setStep('execute')
      setIsExecuting(true)
      try {
        const backup = await createBackup(plan)
        setBackup(backup)
        const migrationResult = await executeMigration(plan, backup)
        setResult(migrationResult)
        setStep('result')
      } finally {
        setIsExecuting(false)
      }
    }
  }, [
    currentStep,
    sourceHarness,
    targetHarness,
    plan,
    setStep,
    setIsAnalyzing,
    setCompatibility,
    setPlan,
    setBackup,
    setIsExecuting,
    setResult,
  ])

  const handleBack = useCallback(() => {
    const steps: MigrationStep[] = ['select', 'analyze', 'preview', 'execute', 'result']
    const idx = steps.indexOf(currentStep)
    if (idx > 0) {
      setStep(steps[idx - 1])
    }
  }, [currentStep, setStep])

  const handleRollback = useCallback(async () => {
    if (!result) return
    setIsRollingBack(true)
    try {
      const rollbackResult = await rollbackMigration(result)
      setMessage(rollbackResult.message)
    } finally {
      setIsRollingBack(false)
    }
  }, [result, setIsRollingBack, setMessage])

  const isLoading = isAnalyzing || isExecuting

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Migration Wizard</h2>
            <p className="text-sm text-muted-foreground">
              Transfer configurations between harnesses
            </p>
          </div>
        </div>
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Message banner */}
      {message && (
        <div className="flex items-center gap-2 border-b bg-emerald-500/10 px-6 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-emerald-700 dark:text-emerald-300">{message}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 px-2 text-xs"
            onClick={() => setMessage(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading overlay for analysis */}
      {isAnalyzing && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Analyzing compatibility...</p>
          </div>
        </div>
      )}

      {/* Step content */}
      {!isAnalyzing && (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {currentStep === 'select' && <StepSelect />}
          {currentStep === 'analyze' && <StepAnalyze />}
          {currentStep === 'preview' && <StepPreview />}
          {currentStep === 'execute' && <StepExecute />}
          {currentStep === 'result' && <StepResult />}
        </div>
      )}

      {/* Footer navigation */}
      <div className="flex items-center justify-between border-t px-6 py-3">
        <div>
          {currentStep !== 'select' && currentStep !== 'result' && !isLoading && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          )}
          {currentStep === 'result' && (
            <Button variant="outline" onClick={reset}>
              Start New Migration
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentStep === 'result' && result && !message && (
            <Button variant="destructive" onClick={handleRollback} disabled={isRollingBack}>
              {isRollingBack ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-1.5 h-4 w-4" />
              )}
              Rollback
            </Button>
          )}
          {currentStep !== 'result' && currentStep !== 'execute' && (
            <Button onClick={handleNext} disabled={!canAdvance() || isLoading}>
              {currentStep === 'preview' ? (
                <>
                  <Shield className="mr-1.5 h-4 w-4" />
                  Execute Migration
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
