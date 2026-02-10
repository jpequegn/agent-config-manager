/**
 * MarkdownRenderer Component
 * Reusable markdown renderer with GFM support, code block highlighting, and copy button
 */

import { useState, type ComponentPropsWithoutRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Props for MarkdownRenderer */
interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string
  /** Additional class names */
  className?: string
  /** Whether to render in compact mode (smaller text, tighter spacing) */
  compact?: boolean
}

/** Extract language from className (e.g. "language-typescript" -> "typescript") */
function getLanguage(className?: string): string | undefined {
  return className?.replace(/^language-/, '')
}

/** Code block with copy button and language label */
function CodeBlock({ children, language }: { children: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-md border border-border/50 bg-background">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

/** Custom components for react-markdown */
function createComponents(compact: boolean) {
  return {
    // Code blocks and inline code
    pre({ children }: ComponentPropsWithoutRef<'pre'>) {
      return <div>{children}</div>
    },

    code({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
      const language = getLanguage(className)
      const content = String(children).replace(/\n$/, '')

      // Fenced code block (has language class or is inside <pre>)
      if (language || (content.includes('\n') && !className)) {
        return <CodeBlock language={language}>{content}</CodeBlock>
      }

      // Inline code
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
          {...props}
        >
          {children}
        </code>
      )
    },

    // Headers
    h1({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
      return (
        <h1
          className={cn(
            'mb-3 mt-6 border-b pb-2 font-bold first:mt-0',
            compact ? 'text-lg' : 'text-2xl'
          )}
          {...props}
        >
          {children}
        </h1>
      )
    },
    h2({ children, ...props }: ComponentPropsWithoutRef<'h2'>) {
      return (
        <h2
          className={cn(
            'mb-2 mt-5 border-b pb-1.5 font-semibold first:mt-0',
            compact ? 'text-base' : 'text-xl'
          )}
          {...props}
        >
          {children}
        </h2>
      )
    },
    h3({ children, ...props }: ComponentPropsWithoutRef<'h3'>) {
      return (
        <h3
          className={cn('mb-2 mt-4 font-semibold first:mt-0', compact ? 'text-sm' : 'text-lg')}
          {...props}
        >
          {children}
        </h3>
      )
    },
    h4({ children, ...props }: ComponentPropsWithoutRef<'h4'>) {
      return (
        <h4 className="mb-1.5 mt-3 font-semibold text-base first:mt-0" {...props}>
          {children}
        </h4>
      )
    },

    // Paragraphs
    p({ children, ...props }: ComponentPropsWithoutRef<'p'>) {
      return (
        <p className={cn('mb-3 leading-relaxed last:mb-0', compact && 'text-sm')} {...props}>
          {children}
        </p>
      )
    },

    // Lists
    ul({ children, ...props }: ComponentPropsWithoutRef<'ul'>) {
      return (
        <ul className="mb-3 list-disc space-y-1 pl-6 last:mb-0" {...props}>
          {children}
        </ul>
      )
    },
    ol({ children, ...props }: ComponentPropsWithoutRef<'ol'>) {
      return (
        <ol className="mb-3 list-decimal space-y-1 pl-6 last:mb-0" {...props}>
          {children}
        </ol>
      )
    },
    li({ children, ...props }: ComponentPropsWithoutRef<'li'>) {
      return (
        <li className={cn('leading-relaxed', compact && 'text-sm')} {...props}>
          {children}
        </li>
      )
    },

    // Blockquote
    blockquote({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) {
      return (
        <blockquote
          className="my-3 border-l-2 border-primary/50 pl-4 italic text-muted-foreground"
          {...props}
        >
          {children}
        </blockquote>
      )
    },

    // Horizontal rule
    hr(props: ComponentPropsWithoutRef<'hr'>) {
      return <hr className="my-4 border-border" {...props} />
    },

    // Links
    a({ children, href, ...props }: ComponentPropsWithoutRef<'a'>) {
      return (
        <a
          href={href}
          className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    },

    // Strong/emphasis
    strong({ children, ...props }: ComponentPropsWithoutRef<'strong'>) {
      return (
        <strong className="font-semibold" {...props}>
          {children}
        </strong>
      )
    },

    // Images
    img({ src, alt, ...props }: ComponentPropsWithoutRef<'img'>) {
      return <img src={src} alt={alt} className="my-3 max-w-full rounded-md border" {...props} />
    },

    // Tables
    table({ children, ...props }: ComponentPropsWithoutRef<'table'>) {
      return (
        <div className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm" {...props}>
            {children}
          </table>
        </div>
      )
    },
    thead({ children, ...props }: ComponentPropsWithoutRef<'thead'>) {
      return (
        <thead className="border-b bg-muted/50" {...props}>
          {children}
        </thead>
      )
    },
    th({ children, ...props }: ComponentPropsWithoutRef<'th'>) {
      return (
        <th className="px-3 py-2 text-left font-semibold" {...props}>
          {children}
        </th>
      )
    },
    td({ children, ...props }: ComponentPropsWithoutRef<'td'>) {
      return (
        <td className="border-b px-3 py-2" {...props}>
          {children}
        </td>
      )
    },

    // Task list items (GFM)
    input({ checked, ...props }: ComponentPropsWithoutRef<'input'>) {
      return (
        <input type="checkbox" checked={checked} readOnly className="mr-2 rounded" {...props} />
      )
    },
  }
}

/**
 * Renders markdown content with GFM support, styled code blocks, tables, and more.
 */
export function MarkdownRenderer({ content, className, compact = false }: MarkdownRendererProps) {
  const components = createComponents(compact)

  return (
    <div className={cn('prose-custom text-foreground', className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  )
}
