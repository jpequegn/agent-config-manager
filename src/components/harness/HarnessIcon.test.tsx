/**
 * HarnessIcon Tests
 */

import { describe, it, expect } from 'vitest'
import { render } from '@/test/utils'
import { HarnessIcon } from './HarnessIcon'
import type { HarnessType } from '@/types'

describe('HarnessIcon', () => {
  const harnessTypes: HarnessType[] = [
    'claude-code',
    'cursor',
    'copilot',
    'cline',
    'continue',
    'aider',
  ]

  it.each(harnessTypes)('renders icon for %s harness', (type) => {
    const { container } = render(<HarnessIcon type={type} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<HarnessIcon type="claude-code" className="custom-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('custom-class')
  })

  it('has default size classes', () => {
    const { container } = render(<HarnessIcon type="cursor" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('h-4', 'w-4')
  })

  it('renders fallback icon for invalid type', () => {
    // @ts-expect-error - Testing invalid type handling
    const { container } = render(<HarnessIcon type="invalid-type" />)
    const svg = container.querySelector('svg')
    // Should render fallback (Sparkles) instead of crashing
    expect(svg).toBeInTheDocument()
  })
})
