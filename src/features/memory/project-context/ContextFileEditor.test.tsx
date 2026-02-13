/**
 * ContextFileEditor Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { ContextFileEditor } from './ContextFileEditor'
import type { ProjectContextFile } from '@/types'

const mockFile: ProjectContextFile = {
  type: 'claude-md',
  fileName: 'CLAUDE.md',
  filePath: '~/Code/agent-config-manager/CLAUDE.md',
  size: 4096,
  harness: 'claude-code',
  lastModified: new Date(),
}

describe('ContextFileEditor', () => {
  const defaultProps = {
    file: mockFile,
    open: true,
    onClose: vi.fn(),
    onSaved: vi.fn(),
    projectPath: '~/Code/agent-config-manager',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render edit dialog for existing file', async () => {
    render(<ContextFileEditor {...defaultProps} />)
    expect(screen.getByText('Edit CLAUDE.md')).toBeInTheDocument()
  })

  it('should render create dialog when file is null', () => {
    render(<ContextFileEditor {...defaultProps} file={null} />)
    expect(screen.getByText('Create Context File')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<ContextFileEditor {...defaultProps} open={false} />)
    expect(screen.queryByText('Edit CLAUDE.md')).not.toBeInTheDocument()
  })

  it('should show edit and preview tabs', () => {
    render(<ContextFileEditor {...defaultProps} />)
    expect(screen.getByLabelText('Editor')).toBeInTheDocument()
    expect(screen.getByLabelText('Preview')).toBeInTheDocument()
  })

  it('should show insert template button', () => {
    render(<ContextFileEditor {...defaultProps} />)
    expect(screen.getByText('Insert Template')).toBeInTheDocument()
  })

  it('should load file content in editor', async () => {
    render(<ContextFileEditor {...defaultProps} />)
    await waitFor(() => {
      const editor = screen.getByLabelText('File content editor') as HTMLTextAreaElement
      expect(editor.value).toContain('Agent Config Manager')
    })
  })

  it('should switch to preview tab', async () => {
    const user = userEvent.setup()
    render(<ContextFileEditor {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByLabelText('File content editor')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('Preview'))

    // Preview shows pre element instead of textarea
    expect(screen.queryByLabelText('File content editor')).not.toBeInTheDocument()
  })

  it('should show templates when Insert Template is clicked', async () => {
    const user = userEvent.setup()
    render(<ContextFileEditor {...defaultProps} />)

    await user.click(screen.getByText('Insert Template'))

    await waitFor(() => {
      expect(screen.getByText('CLAUDE.md - Basic')).toBeInTheDocument()
      expect(screen.getByText('.cursorrules - Basic')).toBeInTheDocument()
    })
  })

  it('should insert template content', async () => {
    const user = userEvent.setup()
    render(<ContextFileEditor {...defaultProps} file={null} />)

    await user.click(screen.getByText('Insert Template'))

    await waitFor(() => {
      expect(screen.getByText('CLAUDE.md - Basic')).toBeInTheDocument()
    })

    await user.click(screen.getByText('CLAUDE.md - Basic'))

    await waitFor(() => {
      const editor = screen.getByLabelText('File content editor') as HTMLTextAreaElement
      expect(editor.value).toContain('# Project Name')
    })
  })

  it('should show cancel and save buttons', async () => {
    render(<ContextFileEditor {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
  })

  it('should show Create File button for new files', () => {
    render(<ContextFileEditor {...defaultProps} file={null} />)
    expect(screen.getByText('Create File')).toBeInTheDocument()
  })

  it('should show file name input for new files', () => {
    render(<ContextFileEditor {...defaultProps} file={null} />)
    expect(screen.getByPlaceholderText('e.g. CLAUDE.md, .cursorrules')).toBeInTheDocument()
  })

  it('should show harness selector for new files', () => {
    render(<ContextFileEditor {...defaultProps} file={null} />)
    expect(screen.getByLabelText('Harness')).toBeInTheDocument()
  })

  it('should call onSaved when save succeeds', async () => {
    const onSaved = vi.fn()
    const user = userEvent.setup()
    render(<ContextFileEditor {...defaultProps} onSaved={onSaved} />)

    // Wait for content to load
    await waitFor(() => {
      const editor = screen.getByLabelText('File content editor') as HTMLTextAreaElement
      expect(editor.value).toContain('Agent Config Manager')
    })

    await user.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled()
    })
  })

  it('should call onClose when cancel is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ContextFileEditor {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should show harness name for existing file', async () => {
    render(<ContextFileEditor {...defaultProps} />)
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
  })
})
