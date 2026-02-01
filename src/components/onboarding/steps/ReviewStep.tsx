/**
 * Review Step Component
 * Review and configure detected harnesses
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight, Settings, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HarnessIcon } from '@/components/harness/HarnessIcon'
import { getHarnessConfig } from '@/components/harness'
import type { DetectionResult } from '@/types'
import { cn } from '@/lib/utils'

interface ReviewStepProps {
  detectionResults: DetectionResult[]
  onComplete: () => void
  onBack: () => void
}

export function ReviewStep({ detectionResults, onComplete, onBack }: ReviewStepProps) {
  const [expandedHarness, setExpandedHarness] = useState<string | null>(null)

  const detectedHarnesses = detectionResults.filter((r) => r.detected)

  const toggleExpand = (type: string) => {
    setExpandedHarness(expandedHarness === type ? null : type)
  }

  if (detectedHarnesses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No Harnesses Detected</h2>
          <p className="mt-2 text-muted-foreground">
            No AI coding assistants were found on your system. You can install them later and re-run
            the setup.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onComplete}>Continue Anyway</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Review Detected Harnesses</h2>
        <p className="mt-2 text-muted-foreground">
          Click on a harness to view its configuration details
        </p>
      </div>

      {/* Harness list */}
      <div className="space-y-3">
        {detectedHarnesses.map((result) => {
          const config = getHarnessConfig(result.type)
          const isExpanded = expandedHarness === result.type

          return (
            <Card key={result.type} className="overflow-hidden">
              <CardHeader
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/50',
                  isExpanded && 'bg-muted/50'
                )}
                onClick={() => toggleExpand(result.type)}
              >
                <CardTitle className="flex items-center gap-3 text-base">
                  <HarnessIcon type={result.type} className={cn('h-5 w-5', config.textColor)} />
                  <span className="flex-1">{config.name}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t bg-muted/20 pt-4">
                  <div className="space-y-3">
                    {/* Config paths */}
                    {result.configPaths.settings && (
                      <div className="flex items-start gap-2">
                        <Settings className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Settings</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {result.configPaths.settings}
                          </p>
                        </div>
                      </div>
                    )}

                    {result.configPaths.projectConfig && (
                      <div className="flex items-start gap-2">
                        <FolderOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Project Config</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {result.configPaths.projectConfig}
                          </p>
                        </div>
                      </div>
                    )}

                    {result.configPaths.skills && (
                      <div className="flex items-start gap-2">
                        <FolderOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Skills/Commands</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {result.configPaths.skills}
                          </p>
                        </div>
                      </div>
                    )}

                    {result.configPaths.memory && (
                      <div className="flex items-start gap-2">
                        <FolderOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Memory</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {result.configPaths.memory}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      {config.description}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete}>Continue</Button>
      </div>
    </div>
  )
}

export default ReviewStep
