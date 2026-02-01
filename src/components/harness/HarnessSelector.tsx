/**
 * Harness Selector Component
 * Tabs for switching between different AI coding harnesses
 */

import { Plus } from 'lucide-react'
import type { HarnessType } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useHarnessStore, useActiveHarness } from '@/stores'
import { HarnessIcon } from './HarnessIcon'
import { getHarnessConfig, getAllHarnessTypes } from './harness-config'

/** Props for HarnessTab */
interface HarnessTabProps {
  type: HarnessType
  isActive: boolean
  isDetected: boolean
  onClick: () => void
}

/** Individual harness tab */
function HarnessTab({ type, isActive, isDetected, onClick }: HarnessTabProps) {
  const config = getHarnessConfig(type)

  return (
    <button
      onClick={onClick}
      disabled={!isDetected}
      className={cn(
        'group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive && [config.bgColor, config.textColor, 'shadow-sm'],
        !isActive &&
          isDetected && ['text-muted-foreground hover:text-foreground', 'hover:bg-accent'],
        !isDetected && ['cursor-not-allowed opacity-40']
      )}
      title={isDetected ? config.description : `${config.name} not detected`}
    >
      <HarnessIcon
        type={type}
        className={cn('transition-transform group-hover:scale-110', isActive && config.textColor)}
      />
      <span>{config.shortName}</span>

      {/* Active indicator */}
      {isActive && (
        <span
          className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: config.brandColor }}
        />
      )}

      {/* Detection status dot */}
      {isDetected && !isActive && (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-green-500" />
      )}
    </button>
  )
}

/** Props for HarnessSelector */
interface HarnessSelectorProps {
  /** Optional class name */
  className?: string
  /** Callback when add harness is clicked */
  onAddHarness?: () => void
}

/**
 * Harness selector tabs
 * Shows all harnesses with active one highlighted
 */
export function HarnessSelector({ className, onAddHarness }: HarnessSelectorProps) {
  const activeHarness = useActiveHarness()
  const setActiveHarness = useHarnessStore((state) => state.setActiveHarness)
  const isHarnessDetected = useHarnessStore((state) => state.isHarnessDetected)

  const allHarnesses = getAllHarnessTypes()

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Harness tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
        {allHarnesses.map((type) => (
          <HarnessTab
            key={type}
            type={type}
            isActive={activeHarness === type}
            isDetected={isHarnessDetected(type)}
            onClick={() => setActiveHarness(type)}
          />
        ))}
      </div>

      {/* Add harness button */}
      {onAddHarness && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddHarness}
          className="ml-2 gap-1 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      )}
    </div>
  )
}

export default HarnessSelector
