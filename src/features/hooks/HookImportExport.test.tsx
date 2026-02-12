/**
 * Hook Import/Export Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { HookImportDialog } from './HookImportDialog'
import { HookExportDialog } from './HookExportDialog'
import { CommunityHooksDialog } from './CommunityHooksDialog'
import { HookCreationWizard } from './HookCreationWizard'
import type { HookExportData } from '@/services/hooks'

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="mock-monaco" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

describe('HookImportDialog', () => {
  it('should render import dialog when open', () => {
    render(<HookImportDialog open={true} onOpenChange={vi.fn()} onImportComplete={vi.fn()} />)
    expect(screen.getByText('Import Hooks')).toBeInTheDocument()
  })

  it('should show paste and URL mode tabs', () => {
    render(<HookImportDialog open={true} onOpenChange={vi.fn()} onImportComplete={vi.fn()} />)
    expect(screen.getByText('Paste / File')).toBeInTheDocument()
    expect(screen.getByText('From URL')).toBeInTheDocument()
  })

  it('should switch to URL mode', async () => {
    const user = userEvent.setup()
    render(<HookImportDialog open={true} onOpenChange={vi.fn()} onImportComplete={vi.fn()} />)

    await user.click(screen.getByText('From URL'))
    expect(screen.getByLabelText('Hook source URL')).toBeInTheDocument()
  })

  it('should show error for invalid JSON', async () => {
    const user = userEvent.setup()
    render(<HookImportDialog open={true} onOpenChange={vi.fn()} onImportComplete={vi.fn()} />)

    const textarea = screen.getByLabelText('Hook JSON content')
    await user.click(textarea)
    await user.paste('invalid json')
    await user.click(screen.getByText('Import'))

    await waitFor(() => {
      expect(screen.getByText('Import failed')).toBeInTheDocument()
    })
  })

  it('should import valid JSON', async () => {
    const user = userEvent.setup()
    const onImportComplete = vi.fn()
    render(
      <HookImportDialog open={true} onOpenChange={vi.fn()} onImportComplete={onImportComplete} />
    )

    const validJson = JSON.stringify({
      version: 1,
      hooks: [
        {
          name: 'Test',
          config: { trigger: 'Stop' },
          scriptContent: 'exit 0',
          scriptLanguage: 'bash',
        },
      ],
    })
    const textarea = screen.getByLabelText('Hook JSON content')
    await user.click(textarea)
    // Use paste to avoid { being parsed as a keyboard modifier
    await user.paste(validJson)
    await user.click(screen.getByText('Import'))

    await waitFor(() => {
      expect(screen.getByText(/Imported 1 hook/)).toBeInTheDocument()
    })
    expect(onImportComplete).toHaveBeenCalled()
  })
})

describe('HookExportDialog', () => {
  const mockExportData: HookExportData = {
    version: 1,
    exportedAt: '2025-01-01T00:00:00Z',
    hooks: [
      {
        name: 'Test hook',
        config: { trigger: 'PreToolUse' },
        scriptContent: '#!/bin/bash\nexit 0',
        scriptLanguage: 'bash',
        harness: 'claude-code',
      },
    ],
  }

  it('should render export dialog with data', () => {
    render(
      <HookExportDialog
        open={true}
        onOpenChange={vi.fn()}
        exportData={mockExportData}
        selectedCount={0}
      />
    )
    expect(screen.getByText('Export Hooks')).toBeInTheDocument()
    expect(screen.getByText('1 hook')).toBeInTheDocument()
  })

  it('should show Download JSON button', () => {
    render(
      <HookExportDialog
        open={true}
        onOpenChange={vi.fn()}
        exportData={mockExportData}
        selectedCount={0}
      />
    )
    expect(screen.getByText('Download JSON')).toBeInTheDocument()
  })

  it('should show Copy button', () => {
    render(
      <HookExportDialog
        open={true}
        onOpenChange={vi.fn()}
        exportData={mockExportData}
        selectedCount={0}
      />
    )
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('should not render content when no data', () => {
    render(
      <HookExportDialog open={true} onOpenChange={vi.fn()} exportData={null} selectedCount={0} />
    )
    // Content only renders when exportData is available
    expect(screen.queryByText('Download JSON')).not.toBeInTheDocument()
  })
})

describe('CommunityHooksDialog', () => {
  it('should render community dialog when open', async () => {
    render(<CommunityHooksDialog open={true} onOpenChange={vi.fn()} onImportComplete={vi.fn()} />)
    expect(screen.getByText('Community Hook Sources')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Claude Code Security Pack')).toBeInTheDocument()
    })
  })

  it('should show all community sources', async () => {
    render(<CommunityHooksDialog open={true} onOpenChange={vi.fn()} onImportComplete={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Claude Code Security Pack')).toBeInTheDocument()
      expect(screen.getByText('DevOps Hook Collection')).toBeInTheDocument()
      expect(screen.getByText('Multi-Agent Logging Suite')).toBeInTheDocument()
      expect(screen.getByText('Cursor Safety Hooks')).toBeInTheDocument()
    })
  })

  it('should show import buttons', async () => {
    render(<CommunityHooksDialog open={true} onOpenChange={vi.fn()} onImportComplete={vi.fn()} />)

    await waitFor(() => {
      const importButtons = screen.getAllByText('Import')
      expect(importButtons.length).toBe(4)
    })
  })
})

describe('HookCreationWizard', () => {
  it('should render wizard when open', async () => {
    render(<HookCreationWizard open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('Hook Creation Wizard')).toBeInTheDocument()
  })

  it('should show step indicators', async () => {
    render(<HookCreationWizard open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('Template')).toBeInTheDocument()
    expect(screen.getByText('Configure')).toBeInTheDocument()
    expect(screen.getByText('Script')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('should show start from scratch option', async () => {
    render(<HookCreationWizard open={true} onOpenChange={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Start from scratch')).toBeInTheDocument()
    })
  })

  it('should show templates in first step', async () => {
    render(<HookCreationWizard open={true} onOpenChange={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Secret Scanner')).toBeInTheDocument()
      expect(screen.getByText('Path Validator')).toBeInTheDocument()
    })
  })

  it('should navigate to configure step', async () => {
    const user = userEvent.setup()
    render(<HookCreationWizard open={true} onOpenChange={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Start from scratch')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Start from scratch'))

    await waitFor(() => {
      expect(screen.getByLabelText('Hook name')).toBeInTheDocument()
      expect(screen.getByLabelText('Trigger type')).toBeInTheDocument()
    })
  })

  it('should navigate through all steps', async () => {
    const user = userEvent.setup()
    render(<HookCreationWizard open={true} onOpenChange={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Start from scratch')).toBeInTheDocument()
    })

    // Step 1 -> 2
    await user.click(screen.getByText('Start from scratch'))
    await waitFor(() => {
      expect(screen.getByLabelText('Hook name')).toBeInTheDocument()
    })

    // Fill name
    await user.type(screen.getByLabelText('Hook name'), 'Test wizard hook')

    // Step 2 -> 3
    await user.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(screen.getByLabelText('Script content')).toBeInTheDocument()
    })

    // Step 3 -> 4
    await user.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(screen.getByText('Script Preview')).toBeInTheDocument()
    })
  })
})
