/**
 * Settings Editor Component Tests
 * Tests for SettingEditor, DiffPreview, and inline editing in SettingsList
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { SettingEditor } from './SettingEditor'
import { DiffPreview } from './DiffPreview'
import type { SettingEntry } from '@/services/settings'

const booleanEntry: SettingEntry = {
  definition: {
    key: 'test.boolean',
    name: 'Test Boolean',
    description: 'A boolean setting',
    type: 'boolean',
    category: 'general',
    defaultValue: false,
    scope: 'user',
  },
  current: {
    key: 'test.boolean',
    value: true,
    source: 'user',
    isModified: true,
    modifiedAt: new Date(),
  },
}

const selectEntry: SettingEntry = {
  definition: {
    key: 'test.select',
    name: 'Test Select',
    description: 'A select setting',
    type: 'select',
    category: 'general',
    defaultValue: 'a',
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' },
    ],
    scope: 'user',
  },
  current: {
    key: 'test.select',
    value: 'b',
    source: 'user',
    isModified: true,
  },
}

const numberEntry: SettingEntry = {
  definition: {
    key: 'test.number',
    name: 'Test Number',
    description: 'A number setting',
    type: 'number',
    category: 'general',
    defaultValue: 10,
    min: 0,
    max: 100,
    scope: 'user',
  },
  current: {
    key: 'test.number',
    value: 42,
    source: 'user',
    isModified: true,
  },
}

const stringEntry: SettingEntry = {
  definition: {
    key: 'test.string',
    name: 'Test String',
    description: 'A string setting',
    type: 'string',
    category: 'general',
    defaultValue: 'default',
    scope: 'user',
  },
  current: {
    key: 'test.string',
    value: 'custom',
    source: 'user',
    isModified: true,
  },
}

describe('SettingEditor', () => {
  it('should render boolean toggle', () => {
    render(<SettingEditor entry={booleanEntry} onUpdate={() => {}} onReset={() => {}} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
  })

  it('should toggle boolean value', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()
    render(<SettingEditor entry={booleanEntry} onUpdate={onUpdate} onReset={() => {}} />)

    await user.click(screen.getByRole('switch'))
    expect(onUpdate).toHaveBeenCalledWith('test.boolean', false)
  })

  it('should render select dropdown', () => {
    render(<SettingEditor entry={selectEntry} onUpdate={() => {}} onReset={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('b')
  })

  it('should change select value', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()
    render(<SettingEditor entry={selectEntry} onUpdate={onUpdate} onReset={() => {}} />)

    await user.selectOptions(screen.getByRole('combobox'), 'c')
    expect(onUpdate).toHaveBeenCalledWith('test.select', 'c')
  })

  it('should render number input', () => {
    render(<SettingEditor entry={numberEntry} onUpdate={() => {}} onReset={() => {}} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(42)
  })

  it('should render string input', () => {
    render(<SettingEditor entry={stringEntry} onUpdate={() => {}} onReset={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('custom')
  })

  it('should show reset button for modified settings', () => {
    render(<SettingEditor entry={booleanEntry} onUpdate={() => {}} onReset={() => {}} />)
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('should call onReset when reset is clicked', async () => {
    const onReset = vi.fn()
    const user = userEvent.setup()
    render(<SettingEditor entry={booleanEntry} onUpdate={() => {}} onReset={onReset} />)

    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(onReset).toHaveBeenCalledWith('test.boolean')
  })

  it('should show validation error', () => {
    render(
      <SettingEditor
        entry={numberEntry}
        onUpdate={() => {}}
        onReset={() => {}}
        validationError="Value must be a number"
      />
    )
    expect(screen.getByText('Value must be a number')).toBeInTheDocument()
  })
})

describe('DiffPreview', () => {
  beforeEach(async () => {
    // Import and discard to start fresh
    const { discardAllChanges } = await import('@/services/settings')
    await discardAllChanges()
  })

  it('should not render when no pending changes', () => {
    const { container } = render(
      <DiffPreview onSaved={() => {}} onDiscarded={() => {}} refreshTrigger={0} />
    )
    // Should render nothing (null)
    expect(container.firstChild).toBeNull()
  })

  it('should show pending changes', async () => {
    const { updateSetting } = await import('@/services/settings')
    await updateSetting('appearance.fontSize', 20)

    render(<DiffPreview onSaved={() => {}} onDiscarded={() => {}} refreshTrigger={1} />)

    await waitFor(() => {
      expect(screen.getByText(/pending change/)).toBeInTheDocument()
    })
  })

  it('should show save and discard buttons when changes exist', async () => {
    const { updateSetting } = await import('@/services/settings')
    await updateSetting('editor.tabSize', 4)

    render(<DiffPreview onSaved={() => {}} onDiscarded={() => {}} refreshTrigger={2} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument()
    })
  })

  it('should call onDiscarded when discard is clicked', async () => {
    const { updateSetting } = await import('@/services/settings')
    await updateSetting('editor.wordWrap', false)

    const onDiscarded = vi.fn()
    const user = userEvent.setup()
    render(<DiffPreview onSaved={() => {}} onDiscarded={onDiscarded} refreshTrigger={3} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /discard/i }))

    await waitFor(() => {
      expect(onDiscarded).toHaveBeenCalled()
    })
  })
})
