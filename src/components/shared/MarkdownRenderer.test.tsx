/**
 * MarkdownRenderer Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { MarkdownRenderer } from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('should render plain text', () => {
    render(<MarkdownRenderer content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('should render headings', () => {
    render(<MarkdownRenderer content={'# Heading 1\n\n## Heading 2\n\n### Heading 3'} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Heading 3')
  })

  it('should render bold and italic text', () => {
    render(<MarkdownRenderer content="**bold** and *italic*" />)
    expect(screen.getByText('bold')).toHaveClass('font-semibold')
    expect(screen.getByText('italic')).toBeInTheDocument()
  })

  it('should render unordered lists', () => {
    render(<MarkdownRenderer content={'- Item 1\n- Item 2\n- Item 3'} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
  })

  it('should render ordered lists', () => {
    render(<MarkdownRenderer content={'1. First\n2. Second\n3. Third'} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
  })

  it('should render fenced code blocks with language label', () => {
    render(<MarkdownRenderer content={'```typescript\nconst x = 42\n```'} />)
    expect(screen.getByText('const x = 42')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  it('should render code blocks with copy button', () => {
    render(<MarkdownRenderer content={'```js\nconsole.log("hi")\n```'} />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('should render inline code', () => {
    render(<MarkdownRenderer content="Use `npm install` to install" />)
    const code = screen.getByText('npm install')
    expect(code.tagName).toBe('CODE')
  })

  it('should render links', () => {
    render(<MarkdownRenderer content="[Click here](https://example.com)" />)
    const link = screen.getByRole('link', { name: 'Click here' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should render blockquotes', () => {
    render(<MarkdownRenderer content="> This is a quote" />)
    expect(screen.getByText('This is a quote')).toBeInTheDocument()
    const blockquote = screen.getByRole('blockquote')
    expect(blockquote).toBeInTheDocument()
  })

  it('should render tables (GFM)', () => {
    const table = '| Col A | Col B |\n|-------|-------|\n| A1 | B1 |\n| A2 | B2 |'
    render(<MarkdownRenderer content={table} />)
    expect(screen.getByText('Col A')).toBeInTheDocument()
    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('B2')).toBeInTheDocument()
  })

  it('should render task lists (GFM)', () => {
    render(<MarkdownRenderer content={'- [x] Done\n- [ ] Not done'} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
  })

  it('should render horizontal rules', () => {
    render(<MarkdownRenderer content={'Above\n\n---\n\nBelow'} />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('should apply compact mode class', () => {
    const { container } = render(<MarkdownRenderer content="# Title" compact />)
    const heading = container.querySelector('h1')
    expect(heading?.className).toContain('text-lg')
  })

  it('should apply custom className', () => {
    const { container } = render(<MarkdownRenderer content="Hello" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should render strikethrough (GFM)', () => {
    render(<MarkdownRenderer content="~~deleted~~" />)
    expect(screen.getByText('deleted')).toBeInTheDocument()
  })
})
