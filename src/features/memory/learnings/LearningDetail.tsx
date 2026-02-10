/**
 * LearningDetail Component
 * Shows the full content and metadata of a selected learning
 */

import { BookOpen, Calendar, Clock, Tag, Folder } from 'lucide-react'
import { cn, formatBytes, formatRelativeTime } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/shared'
import { useSelectedLearning } from '@/stores'
import type { LearningCategory } from '@/types'

/** Category colors */
const CATEGORY_COLORS: Record<LearningCategory, string> = {
  debugging: 'bg-red-500/20 text-red-400',
  architecture: 'bg-blue-500/20 text-blue-400',
  patterns: 'bg-purple-500/20 text-purple-400',
  decisions: 'bg-amber-500/20 text-amber-400',
  preferences: 'bg-green-500/20 text-green-400',
  errors: 'bg-orange-500/20 text-orange-400',
  solutions: 'bg-teal-500/20 text-teal-400',
  other: 'bg-gray-500/20 text-gray-400',
}

export function LearningDetail() {
  const learning = useSelectedLearning()

  if (!learning) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <BookOpen className="h-12 w-12" />
        <p className="text-sm">Select a learning to view its content</p>
      </div>
    )
  }

  const category = learning.metadata.category ?? 'other'

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold leading-snug">{learning.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              CATEGORY_COLORS[category]
            )}
          >
            {category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {learning.createdAt.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Accessed {formatRelativeTime(learning.lastAccessedAt)}
          </span>
          <span>{formatBytes(learning.size)}</span>
          {learning.metadata.project && (
            <span className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              {learning.metadata.project}
            </span>
          )}
        </div>

        {/* Tags */}
        {learning.metadata.tags && learning.metadata.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {learning.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <MarkdownRenderer content={learning.content} />
      </div>
    </div>
  )
}
