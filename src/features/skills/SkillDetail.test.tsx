/**
 * SkillDetail Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { SkillDetail } from './SkillDetail'
import { useSkillsStore } from '@/stores'
import type { Skill } from '@/types'

const mockSkill: Skill = {
  id: 'skill-test-001',
  harness: 'claude-code',
  filePath: '~/test/SKILL.md',
  metadata: {
    name: 'Test Skill',
    description: 'A test skill for unit testing',
    category: 'development',
    triggers: [
      { pattern: '/test', isRegex: false, description: 'Slash command' },
      { pattern: 'run test', isRegex: false, description: 'Natural language' },
    ],
    tags: ['test', 'unit'],
    version: '1.0.0',
  },
  content: '# Test Skill\n\nThis is a test skill.',
  schema: {
    type: 'object',
    properties: {
      verbose: { type: 'boolean', description: 'Enable verbose output' },
    },
  },
  status: 'enabled',
  stats: {
    invocationCount: 42,
    lastUsed: new Date(Date.now() - 3600000),
    avgExecutionTime: 5000,
    successRate: 0.95,
  },
  history: [
    {
      version: '1.0.0',
      date: new Date(Date.now() - 86400000),
      summary: 'Initial release',
      author: 'user',
    },
    { version: '0.9.0', date: new Date(Date.now() - 86400000 * 7), summary: 'Beta version' },
  ],
  createdAt: new Date(Date.now() - 86400000 * 30),
  updatedAt: new Date(Date.now() - 86400000),
}

const mockSkillNoExtras: Skill = {
  id: 'skill-test-002',
  harness: 'cursor',
  filePath: '~/test/SKILL2.md',
  metadata: {
    name: 'Basic Skill',
    description: 'A basic skill without schema or history',
    category: 'core',
    triggers: [],
  },
  content: '# Basic Skill',
  status: 'disabled',
  stats: { invocationCount: 0 },
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('SkillDetail', () => {
  beforeEach(() => {
    const store = useSkillsStore.getState()
    store.selectSkill(null)
    store.setActiveTab('content')
  })

  it('should show empty state when no skill selected', () => {
    render(<SkillDetail />)
    expect(screen.getByText('Select a skill to view its details')).toBeInTheDocument()
  })

  it('should show skill header with name and status', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    expect(screen.getByRole('heading', { level: 2, name: 'Test Skill' })).toBeInTheDocument()
    expect(screen.getByText('enabled')).toBeInTheDocument()
  })

  it('should show description and metadata', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    expect(screen.getByText('A test skill for unit testing')).toBeInTheDocument()
    expect(screen.getByText('claude-code')).toBeInTheDocument()
    expect(screen.getByText('development')).toBeInTheDocument()
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  it('should show tags', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('unit')).toBeInTheDocument()
  })

  it('should show triggers', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    expect(screen.getByText('/test')).toBeInTheDocument()
    expect(screen.getByText('run test')).toBeInTheDocument()
  })

  it('should show action buttons', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    expect(screen.getByRole('button', { name: /edit skill/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy skill/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disable skill/i })).toBeInTheDocument()
  })

  it('should show Enable button for disabled skills', () => {
    useSkillsStore.getState().selectSkill(mockSkillNoExtras)
    render(<SkillDetail />)
    expect(screen.getByRole('button', { name: /enable skill/i })).toBeInTheDocument()
  })

  it('should render all four tabs', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /schema/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /stats/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /history/i })).toBeInTheDocument()
  })

  it('should show content tab by default', () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    const contentTab = screen.getByRole('tab', { name: /content/i })
    expect(contentTab).toHaveAttribute('aria-selected', 'true')
  })

  it('should switch to schema tab and show JSON', async () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('tab', { name: /schema/i }))

    await waitFor(() => {
      expect(screen.getByText(/"verbose"/)).toBeInTheDocument()
    })
  })

  it('should show empty state on schema tab when no schema', async () => {
    useSkillsStore.getState().selectSkill(mockSkillNoExtras)
    render(<SkillDetail />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('tab', { name: /schema/i }))

    await waitFor(() => {
      expect(screen.getByText('No schema defined for this skill')).toBeInTheDocument()
    })
  })

  it('should switch to stats tab and show statistics', async () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('tab', { name: /stats/i }))

    await waitFor(() => {
      expect(screen.getByText('Total Invocations')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('5.0s')).toBeInTheDocument()
      expect(screen.getByText('95%')).toBeInTheDocument()
    })
  })

  it('should switch to history tab and show version entries', async () => {
    useSkillsStore.getState().selectSkill(mockSkill)
    render(<SkillDetail />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('tab', { name: /history/i }))

    await waitFor(() => {
      expect(screen.getByText('Initial release')).toBeInTheDocument()
      expect(screen.getByText('Beta version')).toBeInTheDocument()
      expect(screen.getByText('v0.9.0')).toBeInTheDocument()
    })
  })

  it('should show empty state on history tab when no history', async () => {
    useSkillsStore.getState().selectSkill(mockSkillNoExtras)
    render(<SkillDetail />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('tab', { name: /history/i }))

    await waitFor(() => {
      expect(screen.getByText('No version history available')).toBeInTheDocument()
    })
  })

  it('should show error message for error status skills', () => {
    const errorSkill: Skill = {
      ...mockSkill,
      status: 'error',
      error: 'Syntax error at line 15',
    }
    useSkillsStore.getState().selectSkill(errorSkill)
    render(<SkillDetail />)
    expect(screen.getByText('Syntax error at line 15')).toBeInTheDocument()
  })
})
