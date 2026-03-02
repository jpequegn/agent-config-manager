/**
 * VirtualList Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { VirtualList } from './VirtualList'

// Mock useVirtualizer to return deterministic items without needing DOM measurements
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: Math.min(count, 5) }, (_, i) => ({
        key: i,
        index: i,
        start: i * 50,
      })),
    getTotalSize: () => count * 50,
    measureElement: () => {},
  }),
}))

describe('VirtualList', () => {
  const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape']

  it('renders visible items', () => {
    render(<VirtualList items={items} estimateSize={50} renderItem={(item) => <div>{item}</div>} />)
    // Should render the first 5 (capped by mock) visible items
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('renders empty list without crashing', () => {
    const { container } = render(
      <VirtualList items={[]} estimateSize={50} renderItem={(item: string) => <div>{item}</div>} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies custom className to scroll container', () => {
    const { container } = render(
      <VirtualList
        items={items}
        estimateSize={50}
        renderItem={(item) => <div>{item}</div>}
        className="custom-scroll"
      />
    )
    expect(container.firstChild).toHaveClass('custom-scroll')
  })

  it('passes item and index to renderItem', () => {
    const renderItem = vi.fn((item: string, index: number) => <div data-index={index}>{item}</div>)

    render(<VirtualList items={['A', 'B', 'C']} estimateSize={50} renderItem={renderItem} />)

    expect(renderItem).toHaveBeenCalledWith('A', 0)
    expect(renderItem).toHaveBeenCalledWith('B', 1)
    expect(renderItem).toHaveBeenCalledWith('C', 2)
  })

  it('sets inline overflow auto style on scroll container', () => {
    const { container } = render(
      <VirtualList items={items} estimateSize={50} renderItem={(item) => <div>{item}</div>} />
    )
    const scrollEl = container.firstChild as HTMLElement
    expect(scrollEl.style.overflow).toBe('auto')
  })
})
