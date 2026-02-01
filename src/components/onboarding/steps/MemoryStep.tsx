/**
 * Memory Step Component
 * Configure memory storage location
 */

import { useState } from 'react'
import { FolderOpen, HardDrive, Cloud, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MemoryStepProps {
  initialPath: string | null
  onComplete: (path: string) => void
  onBack: () => void
  onSkip: () => void
}

type StorageOption = 'local' | 'custom' | 'cloud'

interface StorageOptionConfig {
  id: StorageOption
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  available: boolean
}

const storageOptions: StorageOptionConfig[] = [
  {
    id: 'local',
    title: 'Local Storage',
    description: 'Store memory in your home directory',
    icon: HardDrive,
    path: '~/.agent-config-manager/memory',
    available: true,
  },
  {
    id: 'custom',
    title: 'Custom Location',
    description: 'Choose your own storage path',
    icon: FolderOpen,
    available: true,
  },
  {
    id: 'cloud',
    title: 'Cloud Sync',
    description: 'Sync across devices (coming soon)',
    icon: Cloud,
    available: false,
  },
]

export function MemoryStep({ initialPath, onComplete, onBack, onSkip }: MemoryStepProps) {
  const [selectedOption, setSelectedOption] = useState<StorageOption>(
    initialPath && initialPath !== '~/.agent-config-manager/memory' ? 'custom' : 'local'
  )
  const [customPath, setCustomPath] = useState(initialPath || '~/.agent-config-manager/memory')

  const handleContinue = () => {
    const path = selectedOption === 'local' ? '~/.agent-config-manager/memory' : customPath
    onComplete(path)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Memory Storage</h2>
        <p className="mt-2 text-muted-foreground">
          Choose where to store shared context and memory across your harnesses
        </p>
      </div>

      {/* Storage options */}
      <div className="grid gap-3 sm:grid-cols-3">
        {storageOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedOption === option.id

          return (
            <Card
              key={option.id}
              className={cn(
                'cursor-pointer transition-all',
                isSelected &&
                  'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background',
                !option.available && 'cursor-not-allowed opacity-50'
              )}
              onClick={() => option.available && setSelectedOption(option.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={cn('h-5 w-5', isSelected && 'text-primary')} />
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">{option.description}</CardDescription>
                {option.path && isSelected && (
                  <p className="mt-2 text-xs font-mono text-muted-foreground">{option.path}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Custom path input */}
      {selectedOption === 'custom' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Path</label>
          <Input
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="Enter storage path..."
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Enter an absolute path or use ~ for your home directory
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
        <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">What is Memory Storage?</p>
          <p className="mt-1">
            Memory storage holds shared context, conversation history, and learned preferences that
            can be accessed by all your AI coding assistants. This enables them to better understand
            your codebase and preferences.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          Skip for Now
        </Button>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  )
}

export default MemoryStep
