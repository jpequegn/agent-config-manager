/**
 * SkillEditor and SkillCreationWizard Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { SkillEditor } from './SkillEditor'
import { SkillCreationWizard } from './SkillCreationWizard'
import type { Skill } from '@/types'

// Mock Monaco Editor since it requires web workers
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="mock-monaco" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

const mockSkill: Skill = {
  id: 'skill-cc-commit',
  harness: 'claude-code',
  filePath: '~/.claude/skills/commit/SKILL.md',
  metadata: {
    name: 'Commit',
    description: 'Create well-formatted git commits with conventional commit messages',
    category: 'development',
    triggers: [{ pattern: '/commit', isRegex: false, description: 'Slash command' }],
    tags: ['git', 'commit'],
    version: '1.2.0',
  },
  content:
    '# Commit Skill\n\nCreates well-formatted git commits following conventional commit format.',
  status: 'enabled',
  stats: { invocationCount: 142 },
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('SkillEditor', () => {
  it('should render the editor dialog when open', () => {
    render(<SkillEditor open={true} onOpenChange={() => {}} skill={mockSkill} onSaved={() => {}} />)
    expect(screen.getByText('Edit Skill')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <SkillEditor open={false} onOpenChange={() => {}} skill={mockSkill} onSaved={() => {}} />
    )
    expect(screen.queryByText('Edit Skill')).not.toBeInTheDocument()
  })

  it('should show skill name in input', () => {
    render(<SkillEditor open={true} onOpenChange={() => {}} skill={mockSkill} onSaved={() => {}} />)
    const nameInput = screen.getByLabelText('Name')
    expect(nameInput).toHaveValue('Commit')
  })

  it('should show category selector', () => {
    render(<SkillEditor open={true} onOpenChange={() => {}} skill={mockSkill} onSaved={() => {}} />)
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
  })

  it('should show content textarea', () => {
    render(<SkillEditor open={true} onOpenChange={() => {}} skill={mockSkill} onSaved={() => {}} />)
    const textarea = screen.getByLabelText('Content (Markdown)')
    expect(textarea).toHaveValue(mockSkill.content)
  })

  it('should show save and cancel buttons', () => {
    render(<SkillEditor open={true} onOpenChange={() => {}} skill={mockSkill} onSaved={() => {}} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('should call onSaved when save succeeds', async () => {
    const onSaved = vi.fn()
    const user = userEvent.setup()
    render(<SkillEditor open={true} onOpenChange={() => {}} skill={mockSkill} onSaved={onSaved} />)

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled()
    })
  })

  it('should show validation error for empty name', async () => {
    const user = userEvent.setup()
    render(<SkillEditor open={true} onOpenChange={() => {}} skill={mockSkill} onSaved={() => {}} />)

    const nameInput = screen.getByLabelText('Name')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText('Skill name is required')).toBeInTheDocument()
    })
  })
})

describe('SkillCreationWizard', () => {
  it('should render wizard dialog when open', () => {
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)
    expect(screen.getByText('Create Skill')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<SkillCreationWizard open={false} onOpenChange={() => {}} onCreated={() => {}} />)
    expect(screen.queryByText('Create Skill')).not.toBeInTheDocument()
  })

  it('should show template options on step 1', () => {
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)
    expect(screen.getByText('Slash Command')).toBeInTheDocument()
    expect(screen.getByText('Code Review')).toBeInTheDocument()
    expect(screen.getByText('Documentation Generator')).toBeInTheDocument()
    expect(screen.getByText('Test Generator')).toBeInTheDocument()
  })

  it('should show start from scratch option', () => {
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)
    expect(screen.getByText('Start from scratch')).toBeInTheDocument()
  })

  it('should advance to configure step when template is selected', async () => {
    const user = userEvent.setup()
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)

    await user.click(screen.getByText('Slash Command'))

    await waitFor(() => {
      expect(screen.getByLabelText('Skill Name')).toBeInTheDocument()
    })
  })

  it('should advance to configure step from scratch', async () => {
    const user = userEvent.setup()
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)

    await user.click(screen.getByText('Start from scratch'))

    await waitFor(() => {
      expect(screen.getByLabelText('Skill Name')).toBeInTheDocument()
    })
  })

  it('should navigate through all steps', async () => {
    const user = userEvent.setup()
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)

    // Step 1 -> Step 2 (select template)
    await user.click(screen.getByText('Start from scratch'))

    // Fill in step 2
    await waitFor(() => {
      expect(screen.getByLabelText('Skill Name')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Skill Name'), 'Test Wizard Skill')
    await user.type(screen.getByLabelText('Description'), 'Created via wizard')

    // Step 2 -> Step 3
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Skill Content (Markdown)')).toBeInTheDocument()
    })

    // Step 3 -> Step 4 (Review)
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText('Review Skill')).toBeInTheDocument()
      expect(screen.getByText('Test Wizard Skill')).toBeInTheDocument()
    })
  })

  it('should go back with the back button', async () => {
    const user = userEvent.setup()
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)

    // Go to step 2
    await user.click(screen.getByText('Start from scratch'))
    await waitFor(() => {
      expect(screen.getByLabelText('Skill Name')).toBeInTheDocument()
    })

    // Go back to step 1
    await user.click(screen.getByRole('button', { name: /back/i }))
    await waitFor(() => {
      expect(screen.getByText('Start from scratch')).toBeInTheDocument()
    })
  })

  it('should show step indicator', () => {
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)
    expect(screen.getByText('Template')).toBeInTheDocument()
    expect(screen.getByText('Configure')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('should show Create Skill button on review step', async () => {
    const user = userEvent.setup()
    render(<SkillCreationWizard open={true} onOpenChange={() => {}} onCreated={() => {}} />)

    // Navigate to review
    await user.click(screen.getByText('Start from scratch'))
    await waitFor(() => expect(screen.getByLabelText('Skill Name')).toBeInTheDocument())
    await user.type(screen.getByLabelText('Skill Name'), 'Test')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() =>
      expect(screen.getByLabelText('Skill Content (Markdown)')).toBeInTheDocument()
    )
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create skill/i })).toBeInTheDocument()
    })
  })
})
