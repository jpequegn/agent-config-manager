/**
 * HookEditor Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { HookEditor } from './HookEditor'
import { useHooksStore } from '@/stores/hooks-store'

// Mock Monaco Editor since it requires web workers
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="mock-monaco" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

describe('HookEditor', () => {
  const defaultProps = {
    hookId: null,
    open: true,
    onOpenChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const store = useHooksStore.getState()
    store.setHookGroups([])
  })

  it('should render create mode when hookId is null', () => {
    render(<HookEditor {...defaultProps} />)
    expect(screen.getByText('Create Hook', { selector: 'h2' })).toBeInTheDocument()
  })

  it('should render edit mode when hookId is provided', async () => {
    render(<HookEditor {...defaultProps} hookId="hook-1" />)
    await waitFor(() => {
      expect(screen.getByText('Edit Hook', { selector: 'h2' })).toBeInTheDocument()
    })
  })

  it('should show form fields', () => {
    render(<HookEditor {...defaultProps} />)
    expect(screen.getByLabelText('Hook name')).toBeInTheDocument()
    expect(screen.getByLabelText('Hook description')).toBeInTheDocument()
    expect(screen.getByLabelText('Trigger type')).toBeInTheDocument()
    expect(screen.getByLabelText('Timeout in milliseconds')).toBeInTheDocument()
    expect(screen.getByLabelText('Target harness')).toBeInTheDocument()
  })

  it('should show language selector buttons', () => {
    render(<HookEditor {...defaultProps} />)
    expect(screen.getByText('Bash')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('should show tool matcher for PreToolUse trigger', () => {
    render(<HookEditor {...defaultProps} />)
    // Default trigger is PreToolUse
    expect(screen.getByLabelText('Tool matcher pattern')).toBeInTheDocument()
  })

  it('should show Monaco editor mock', () => {
    render(<HookEditor {...defaultProps} />)
    expect(screen.getByTestId('mock-monaco')).toBeInTheDocument()
  })

  it('should show cancel and save buttons', () => {
    render(<HookEditor {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Create Hook', { selector: 'button' })).toBeInTheDocument()
  })

  it('should show validation errors for empty form', async () => {
    const user = userEvent.setup()
    render(<HookEditor {...defaultProps} />)

    // Clear the default script content
    const editor = screen.getByTestId('mock-monaco')
    await user.clear(editor)

    // Click save
    const saveBtn = screen.getByText('Create Hook', { selector: 'button' })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('should call onOpenChange when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<HookEditor {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(screen.getByText('Cancel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should not render when open is false', () => {
    render(<HookEditor {...defaultProps} open={false} />)
    expect(screen.queryByText('Create Hook')).not.toBeInTheDocument()
  })
})
