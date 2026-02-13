/**
 * Unified Search Service
 * Searches across all content types with grouping, ranking, and recent search tracking
 */

import type { HarnessType } from '@/types'
import { listSkills } from '@/services/skills'
import { listHookSummaries } from '@/services/hooks'
import { listSettings } from '@/services/settings'
import { scanProjects } from '@/services/project-context'
import { listTools } from '@/services/tools'
import { listSessions } from '@/services/sessions'
import { listLearnings } from '@/services/learnings'

/** Search result content types */
export type SearchResultType =
  | 'skill'
  | 'hook'
  | 'setting'
  | 'project'
  | 'tool'
  | 'session'
  | 'learning'

/** Individual search result */
export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  description: string
  harness?: HarnessType
  /** Extra metadata shown in result */
  meta?: string
  /** Relevance score (higher = better match) */
  score: number
}

/** Grouped search results */
export interface SearchResultGroup {
  type: SearchResultType
  label: string
  results: SearchResult[]
}

/** Search scope */
export type SearchScope = 'all' | 'current-harness'

/** Search options */
export interface SearchOptions {
  query: string
  scope?: SearchScope
  activeHarness?: HarnessType | null
  maxResultsPerGroup?: number
}

/** Display labels for result types */
const TYPE_LABELS: Record<SearchResultType, string> = {
  skill: 'Skills',
  hook: 'Hooks',
  setting: 'Settings',
  project: 'Projects',
  tool: 'Tools',
  session: 'Sessions',
  learning: 'Learnings',
}

/** Recent searches storage (in-memory) */
let recentSearches: string[] = []
const MAX_RECENT_SEARCHES = 8

/**
 * Calculate relevance score for a match.
 * Higher score = better match.
 */
function scoreMatch(query: string, title: string, description: string): number {
  const q = query.toLowerCase()
  const t = title.toLowerCase()
  const d = description.toLowerCase()

  let score = 0

  // Exact title match
  if (t === q) return 100

  // Title starts with query
  if (t.startsWith(q)) score += 80

  // Title contains query
  if (t.includes(q)) score += 60

  // Description contains query
  if (d.includes(q)) score += 30

  // Word-level matching in title
  const queryWords = q.split(/\s+/)
  const titleWords = t.split(/[\s._-]+/)
  for (const qw of queryWords) {
    if (titleWords.some((tw) => tw.startsWith(qw))) score += 20
  }

  return score
}

/**
 * Search across all content types.
 */
export async function searchAll(options: SearchOptions): Promise<SearchResultGroup[]> {
  const { query, scope = 'all', activeHarness = null, maxResultsPerGroup = 5 } = options

  if (!query.trim()) return []

  const q = query.toLowerCase()
  const filterByHarness = scope === 'current-harness' && activeHarness

  // Run all searches in parallel
  const [skills, hooks, settings, projects, tools, sessions, learnings] = await Promise.all([
    listSkills({ searchText: query }).catch(() => []),
    listHookSummaries().catch(() => []),
    listSettings({ searchText: query }).catch(() => []),
    scanProjects().catch(() => []),
    listTools({ searchText: query }).catch(() => []),
    listSessions({ searchText: query }).catch(() => []),
    listLearnings({ search: query }).catch(() => []),
  ])

  const groups: SearchResultGroup[] = []

  // Skills
  const skillResults: SearchResult[] = skills
    .filter((s) => !filterByHarness || s.harness === activeHarness)
    .map((s) => ({
      id: s.id,
      type: 'skill' as const,
      title: s.name,
      description: s.description,
      harness: s.harness,
      meta: s.category,
      score: scoreMatch(q, s.name, s.description),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResultsPerGroup)

  if (skillResults.length > 0) {
    groups.push({ type: 'skill', label: TYPE_LABELS.skill, results: skillResults })
  }

  // Hooks
  const hookResults: SearchResult[] = hooks
    .filter((h) => {
      if (filterByHarness && h.harness !== activeHarness) return false
      const name = h.name.toLowerCase()
      const trigger = h.trigger.toLowerCase()
      return name.includes(q) || trigger.includes(q)
    })
    .map((h) => ({
      id: h.id,
      type: 'hook' as const,
      title: h.name,
      description: `${h.trigger} hook`,
      harness: h.harness,
      meta: h.status,
      score: scoreMatch(q, h.name, h.trigger),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResultsPerGroup)

  if (hookResults.length > 0) {
    groups.push({ type: 'hook', label: TYPE_LABELS.hook, results: hookResults })
  }

  // Settings
  const settingResults: SearchResult[] = settings
    .map((s) => ({
      id: s.definition.key,
      type: 'setting' as const,
      title: s.definition.name,
      description: s.definition.description ?? s.definition.key,
      meta: s.definition.category,
      score: scoreMatch(q, s.definition.name, s.definition.description ?? ''),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResultsPerGroup)

  if (settingResults.length > 0) {
    groups.push({ type: 'setting', label: TYPE_LABELS.setting, results: settingResults })
  }

  // Projects
  const projectResults: SearchResult[] = projects
    .filter((p) => {
      if (filterByHarness && !p.contextFiles.some((f) => f.harness === activeHarness)) return false
      return p.projectName.toLowerCase().includes(q) || p.projectPath.toLowerCase().includes(q)
    })
    .map((p) => ({
      id: p.projectPath,
      type: 'project' as const,
      title: p.projectName,
      description: p.projectPath,
      meta: `${p.contextFiles.length} files`,
      score: scoreMatch(q, p.projectName, p.projectPath),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResultsPerGroup)

  if (projectResults.length > 0) {
    groups.push({ type: 'project', label: TYPE_LABELS.project, results: projectResults })
  }

  // Tools
  const toolResults: SearchResult[] = tools
    .filter((t) => !filterByHarness || t.harness === activeHarness)
    .map((t) => ({
      id: t.id,
      type: 'tool' as const,
      title: t.name,
      description: t.description,
      harness: t.harness,
      meta: t.isMCP ? 'MCP' : 'Built-in',
      score: scoreMatch(q, t.name, t.description),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResultsPerGroup)

  if (toolResults.length > 0) {
    groups.push({ type: 'tool', label: TYPE_LABELS.tool, results: toolResults })
  }

  // Sessions
  const sessionResults: SearchResult[] = sessions
    .filter((s) => !filterByHarness || s.harness === activeHarness)
    .map((s) => ({
      id: s.id,
      type: 'session' as const,
      title: s.title,
      description: s.lastMessagePreview ?? '',
      harness: s.harness,
      meta: s.project,
      score: scoreMatch(q, s.title, s.lastMessagePreview ?? ''),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResultsPerGroup)

  if (sessionResults.length > 0) {
    groups.push({ type: 'session', label: TYPE_LABELS.session, results: sessionResults })
  }

  // Learnings
  const learningResults: SearchResult[] = learnings
    .filter((l) => !filterByHarness || l.harness === activeHarness)
    .map((l) => ({
      id: l.id,
      type: 'learning' as const,
      title: l.title,
      description: l.category ?? '',
      harness: l.harness,
      meta: l.category,
      score: scoreMatch(q, l.title, l.category ?? ''),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResultsPerGroup)

  if (learningResults.length > 0) {
    groups.push({ type: 'learning', label: TYPE_LABELS.learning, results: learningResults })
  }

  return groups
}

/**
 * Add a query to recent searches.
 */
export function addRecentSearch(query: string): void {
  const trimmed = query.trim()
  if (!trimmed) return

  // Remove duplicates
  recentSearches = recentSearches.filter((s) => s !== trimmed)
  // Add to front
  recentSearches.unshift(trimmed)
  // Trim to max
  if (recentSearches.length > MAX_RECENT_SEARCHES) {
    recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES)
  }
}

/**
 * Get recent searches.
 */
export function getRecentSearches(): string[] {
  return [...recentSearches]
}

/**
 * Clear recent searches.
 */
export function clearRecentSearches(): void {
  recentSearches = []
}

/** Export type labels for UI use */
export { TYPE_LABELS }
