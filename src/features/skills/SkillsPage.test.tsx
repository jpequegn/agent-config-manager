/**
 * SkillsPage Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { SkillsPage } from './SkillsPage'
import { useSkillsStore } from '@/stores'

// Mock Monaco Editor since it requires web workers
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="mock-monaco" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

describe('SkillsPage', () => {
  beforeEach(() => {
    const store = useSkillsStore.getState()
    store.setSkills([])
    store.selectSkill(null)
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setFilterHarness(null)
    store.setFilterCategory(null)
    store.setGroupBy('harness')
    store.collapseAll()
    store.setActiveTab('content')
  })

  it('should render the page header', () => {
    render(<SkillsPage />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('Browse and manage agent skills')).toBeInTheDocument()
  })

  it('should render the more actions menu button', async () => {
    render(<SkillsPage />)
    expect(screen.getByRole('button', { name: /more actions/i })).toBeInTheDocument()
  })

  it('should show New Skill button', () => {
    render(<SkillsPage />)
    expect(screen.getByRole('button', { name: /create new skill/i })).toBeInTheDocument()
  })

  it('should show empty state for skill detail', () => {
    render(<SkillsPage />)
    expect(screen.getByText('Select a skill to view its details')).toBeInTheDocument()
  })

  it('should auto-load and show skills', async () => {
    render(<SkillsPage />)
    await waitFor(() => {
      expect(screen.getByText(/enabled/)).toBeInTheDocument()
    })
  })

  it('should show search input', () => {
    render(<SkillsPage />)
    expect(screen.getByPlaceholderText('Search skills...')).toBeInTheDocument()
  })

  it('should show grouping buttons', () => {
    render(<SkillsPage />)
    expect(screen.getByRole('button', { name: /harness/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /category/i })).toBeInTheDocument()
  })

  it('should show expand/collapse button', () => {
    render(<SkillsPage />)
    expect(screen.getByRole('button', { name: /expand|collapse/i })).toBeInTheDocument()
  })
})
