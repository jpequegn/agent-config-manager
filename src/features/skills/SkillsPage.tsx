/**
 * SkillsPage Component
 * Main page for the skills browser with tree navigation and detail view
 */

import { useEffect } from 'react'
import { RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSkillsStore, useSkills, useIsSkillsLoading } from '@/stores'
import { listSkills } from '@/services/skills'
import { SkillTree } from './SkillTree'
import { SkillDetail } from './SkillDetail'

export function SkillsPage() {
  const skills = useSkills()
  const isLoading = useIsSkillsLoading()
  const setSkills = useSkillsStore((s) => s.setSkills)
  const setIsLoading = useSkillsStore((s) => s.setIsLoading)
  const searchQuery = useSkillsStore((s) => s.searchQuery)
  const filterHarness = useSkillsStore((s) => s.filterHarness)
  const filterCategory = useSkillsStore((s) => s.filterCategory)

  /** Load skills with current filters */
  async function handleLoad() {
    setIsLoading(true)
    try {
      const results = await listSkills({
        harness: filterHarness ?? undefined,
        category: filterCategory ?? undefined,
        searchText: searchQuery || undefined,
      })
      setSkills(results)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load on mount and when filters change
  useEffect(() => {
    handleLoad()
  }, [searchQuery, filterHarness, filterCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const enabledCount = skills.filter((s) => s.status === 'enabled').length

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">Skills</h1>
            <p className="text-sm text-muted-foreground">Browse and manage agent skills</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
            aria-label={`${enabledCount} enabled out of ${skills.length} total skills`}
          >
            {enabledCount} enabled / {skills.length} total
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoad}
            disabled={isLoading}
            aria-label={isLoading ? 'Loading skills' : 'Refresh skills'}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Skill tree */}
        <div className="w-80 shrink-0 border-r">
          <h2 className="sr-only">Skill List</h2>
          <SkillTree />
        </div>

        {/* Right panel - Skill detail */}
        <div className="flex-1">
          <h2 className="sr-only">Skill Details</h2>
          <SkillDetail />
        </div>
      </div>
    </div>
  )
}
