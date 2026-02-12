/**
 * HookTemplatesGallery Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { userEvent } from '@testing-library/user-event'
import { HookTemplatesGallery } from './HookTemplatesGallery'

describe('HookTemplatesGallery', () => {
  it('should render the templates header', async () => {
    render(<HookTemplatesGallery onUseTemplate={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Templates')).toBeInTheDocument()
    })
  })

  it('should show template count', async () => {
    render(<HookTemplatesGallery onUseTemplate={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText(/\d+ available/)).toBeInTheDocument()
    })
  })

  it('should show category headers', async () => {
    render(<HookTemplatesGallery onUseTemplate={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Security')).toBeInTheDocument()
      expect(screen.getByText('Logging')).toBeInTheDocument()
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })
  })

  it('should show template cards', async () => {
    render(<HookTemplatesGallery onUseTemplate={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Secret Scanner')).toBeInTheDocument()
      expect(screen.getByText('Path Validator')).toBeInTheDocument()
      expect(screen.getByText('JSONL Logger')).toBeInTheDocument()
      expect(screen.getByText('Slack Webhook')).toBeInTheDocument()
    })
  })

  it('should show template preview when card is clicked', async () => {
    const user = userEvent.setup()
    render(<HookTemplatesGallery onUseTemplate={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Secret Scanner')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Secret Scanner'))

    await waitFor(() => {
      expect(screen.getByText('Script Preview')).toBeInTheDocument()
      expect(screen.getByText('Use Template')).toBeInTheDocument()
    })
  })

  it('should call onUseTemplate when Use Template is clicked', async () => {
    const onUseTemplate = vi.fn()
    const user = userEvent.setup()
    render(<HookTemplatesGallery onUseTemplate={onUseTemplate} />)

    await waitFor(() => {
      expect(screen.getByText('Secret Scanner')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Secret Scanner'))

    await waitFor(() => {
      expect(screen.getByText('Use Template')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Use Template'))
    expect(onUseTemplate).toHaveBeenCalledTimes(1)
    expect(onUseTemplate.mock.calls[0][0]).toHaveProperty('id', 'tpl-secret-scanner')
  })

  it('should toggle preview off when clicking same card again', async () => {
    const user = userEvent.setup()
    render(<HookTemplatesGallery onUseTemplate={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Secret Scanner')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Secret Scanner'))
    await waitFor(() => {
      expect(screen.getByText('Script Preview')).toBeInTheDocument()
    })

    // Click the first "Secret Scanner" which is the card (not the preview header)
    const elements = screen.getAllByText('Secret Scanner')
    await user.click(elements[0])
    await waitFor(() => {
      expect(screen.queryByText('Script Preview')).not.toBeInTheDocument()
    })
  })

  it('should show config details in preview', async () => {
    const user = userEvent.setup()
    render(<HookTemplatesGallery onUseTemplate={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Secret Scanner')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Secret Scanner'))

    await waitFor(() => {
      expect(screen.getByText(/Trigger:/)).toBeInTheDocument()
      expect(screen.getByText(/Matcher:/)).toBeInTheDocument()
      expect(screen.getByText(/Language:/)).toBeInTheDocument()
    })
  })
})
