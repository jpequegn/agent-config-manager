/**
 * Harness Icon Component
 * Displays the appropriate icon for each harness type
 */

import { Sparkles, MousePointer2, Github, Terminal, Blocks, MessageSquareCode } from 'lucide-react'
import type { HarnessType } from '@/types'
import { cn } from '@/lib/utils'

/** Props for HarnessIcon */
interface HarnessIconProps {
  /** Harness type */
  type: HarnessType
  /** Icon size class */
  className?: string
}

/** Icon mapping for each harness */
const iconMap: Record<HarnessType, React.ComponentType<{ className?: string }>> = {
  'claude-code': Sparkles,
  cursor: MousePointer2,
  copilot: Github,
  cline: Terminal,
  continue: Blocks,
  aider: MessageSquareCode,
}

/**
 * Render the icon for a harness type
 */
export function HarnessIcon({ type, className }: HarnessIconProps) {
  const Icon = iconMap[type]
  if (!Icon) {
    // Fallback for invalid harness type
    return <Sparkles className={cn('h-4 w-4', className)} />
  }
  return <Icon className={cn('h-4 w-4', className)} />
}

export default HarnessIcon
