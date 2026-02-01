/**
 * Complete Step Component
 * Final step showing setup summary
 */

import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HarnessIcon } from '@/components/harness/HarnessIcon'
import { getHarnessConfig } from '@/components/harness'
import type { DetectionResult } from '@/types'
import { cn } from '@/lib/utils'

interface CompleteStepProps {
  detectionResults: DetectionResult[]
  memoryPath: string | null
  onFinish: () => void
}

export function CompleteStep({ detectionResults, memoryPath, onFinish }: CompleteStepProps) {
  const detectedHarnesses = detectionResults.filter((r) => r.detected)

  return (
    <div className="space-y-6">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-500" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold">Setup Complete!</h2>
        <p className="mt-2 text-muted-foreground">
          Your AI coding assistants are ready to be managed
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="divide-y p-0">
          {/* Detected harnesses */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Detected Harnesses ({detectedHarnesses.length})
            </h3>
            {detectedHarnesses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {detectedHarnesses.map((result) => {
                  const config = getHarnessConfig(result.type)
                  return (
                    <div
                      key={result.type}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-3 py-1',
                        config.bgColor
                      )}
                    >
                      <HarnessIcon type={result.type} className={cn('h-4 w-4', config.textColor)} />
                      <span className={cn('text-sm font-medium', config.textColor)}>
                        {config.shortName}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No harnesses detected. You can add them later.
              </p>
            )}
          </div>

          {/* Memory path */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Memory Storage</h3>
            {memoryPath ? (
              <p className="text-sm font-mono">{memoryPath}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Not configured</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* What's next */}
      <div className="rounded-lg bg-muted/50 p-4">
        <h3 className="font-medium mb-2">What&apos;s Next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Explore and manage your harness configurations
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Create shared skills and prompts across tools
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Set up hooks for automated workflows
          </li>
        </ul>
      </div>

      {/* Finish button */}
      <div className="flex justify-center">
        <Button size="lg" onClick={onFinish}>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default CompleteStep
