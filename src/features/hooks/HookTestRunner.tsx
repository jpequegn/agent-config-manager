/**
 * HookTestRunner Component
 * Allows running a test execution of a hook with sample input
 */

import { useState, useCallback } from 'react'
import { Play, Loader2, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { runHookTest } from '@/services/hooks'
import { useHookLogsStore } from '@/stores/hook-logs-store'

const SAMPLE_INPUTS = [
  {
    label: 'Edit .env',
    value: JSON.stringify(
      { tool: 'Edit', args: { file_path: '.env', content: 'SECRET=abc' } },
      null,
      2
    ),
  },
  {
    label: 'Write file',
    value: JSON.stringify(
      { tool: 'Write', args: { file_path: 'src/index.ts', content: 'export {}' } },
      null,
      2
    ),
  },
  {
    label: 'Bash command',
    value: JSON.stringify({ tool: 'Bash', args: { command: 'rm -rf /' } }, null, 2),
  },
  {
    label: 'Read file',
    value: JSON.stringify({ tool: 'Read', args: { file_path: 'package.json' } }, null, 2),
  },
]

interface Props {
  hookId: string
}

export function HookTestRunner({ hookId }: Props) {
  const [sampleInput, setSampleInput] = useState(SAMPLE_INPUTS[0].value)
  const isTesting = useHookLogsStore((s) => s.isTesting)
  const lastTestResult = useHookLogsStore((s) => s.lastTestResult)
  const setIsTesting = useHookLogsStore((s) => s.setIsTesting)
  const setLastTestResult = useHookLogsStore((s) => s.setLastTestResult)

  const handleRun = useCallback(async () => {
    setIsTesting(true)
    setLastTestResult(null)
    try {
      const result = await runHookTest(hookId, sampleInput)
      setLastTestResult(result)
    } finally {
      setIsTesting(false)
    }
  }, [hookId, sampleInput, setIsTesting, setLastTestResult])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Test Runner</h4>
        <div className="flex gap-1">
          {SAMPLE_INPUTS.map((s) => (
            <button
              key={s.label}
              onClick={() => setSampleInput(s.value)}
              className={cn(
                'rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
                sampleInput === s.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={sampleInput}
        onChange={(e) => setSampleInput(e.target.value)}
        className="h-24 w-full rounded-md border bg-background px-3 py-2 font-mono text-xs"
        placeholder="Enter sample JSON input..."
        aria-label="Sample hook input"
      />

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleRun} disabled={isTesting}>
          {isTesting ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="mr-2 h-3.5 w-3.5" />
          )}
          {isTesting ? 'Running...' : 'Run Test'}
        </Button>

        {lastTestResult && (
          <div className="flex items-center gap-2 text-sm">
            {lastTestResult.result === 'allow' && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {lastTestResult.result === 'block' && (
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
            )}
            {lastTestResult.result === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
            <span className="font-medium capitalize">{lastTestResult.result}</span>
            <span className="text-muted-foreground">in {lastTestResult.duration}ms</span>
            <span className="text-muted-foreground">(exit {lastTestResult.exitCode})</span>
          </div>
        )}
      </div>

      {lastTestResult && (
        <pre className="max-h-32 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs">
          {lastTestResult.output}
        </pre>
      )}
    </div>
  )
}
