/**
 * Detection Step Component
 * Auto-detects installed AI coding harnesses
 */

import { useEffect, useState, useCallback } from 'react'
import { Loader2, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HarnessIcon } from '@/components/harness/HarnessIcon'
import { getHarnessConfig, getAllHarnessTypes } from '@/components/harness'
import type { DetectionResult } from '@/types'
import { cn } from '@/lib/utils'

interface DetectionStepProps {
  onComplete: (results: DetectionResult[]) => void
  onSkip: () => void
}

/** Simulated detection for demo (replace with actual detection service) */
async function simulateDetection(): Promise<DetectionResult[]> {
  // Simulate scanning delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const harnesses = getAllHarnessTypes()
  const results: DetectionResult[] = harnesses.map((type) => {
    // Simulate some harnesses being detected
    const detected = ['claude-code', 'cursor', 'continue'].includes(type)
    return {
      type,
      detected,
      status: detected ? 'detected' : 'disabled',
      configPaths: detected
        ? {
            settings: `~/.${type}/settings.json`,
            projectConfig: type === 'claude-code' ? 'CLAUDE.md' : undefined,
          }
        : {},
    }
  })

  return results
}

export function DetectionStep({ onComplete, onSkip }: DetectionStepProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<DetectionResult[]>([])
  const [hasScanned, setHasScanned] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startScan = useCallback(async () => {
    setIsScanning(true)
    setResults([])
    setError(null)

    try {
      // TODO: Replace with actual detection service
      const detectionResults = await simulateDetection()
      setResults(detectionResults)
      setHasScanned(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect harnesses')
      setHasScanned(true)
    } finally {
      setIsScanning(false)
    }
  }, [])

  // Auto-start scan on mount
  useEffect(() => {
    if (!hasScanned) {
      startScan()
    }
  }, [hasScanned, startScan])

  const detectedCount = results.filter((r) => r.detected).length
  const totalCount = results.length

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Detecting AI Harnesses</h2>
        <p className="mt-2 text-muted-foreground">
          Scanning your system for installed AI coding assistants
        </p>
      </div>

      {/* Scanning animation */}
      {isScanning && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/20" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Scanning...</p>
        </div>
      )}

      {/* Error state */}
      {!isScanning && hasScanned && error && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center">
            <p className="font-medium text-destructive">Detection Failed</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={startScan}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="ghost" onClick={onSkip}>
              Skip
            </Button>
          </div>
        </div>
      )}

      {/* Results grid */}
      {!isScanning && hasScanned && !error && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => {
              const config = getHarnessConfig(result.type)
              return (
                <Card
                  key={result.type}
                  className={cn(
                    'transition-all',
                    result.detected
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-muted bg-muted/30 opacity-60'
                  )}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <HarnessIcon
                      type={result.type}
                      className={cn(
                        'h-6 w-6',
                        result.detected ? config.textColor : 'text-muted-foreground'
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{config.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.detected ? 'Detected' : 'Not found'}
                      </p>
                    </div>
                    {result.detected ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-lg font-medium">
              Found {detectedCount} of {totalCount} harnesses
            </p>
            <p className="text-sm text-muted-foreground">
              {detectedCount > 0
                ? "We'll help you configure the detected harnesses"
                : 'No harnesses detected. You can install them later.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={startScan}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scan Again
            </Button>
            {detectedCount > 0 ? (
              <Button onClick={() => onComplete(results)}>Continue</Button>
            ) : (
              <Button variant="ghost" onClick={onSkip}>
                Skip
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default DetectionStep
