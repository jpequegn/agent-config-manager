/**
 * LearningsPage Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { LearningsPage } from './LearningsPage'
import { useLearningsStore } from '@/stores'

describe('LearningsPage', () => {
  beforeEach(() => {
    const store = useLearningsStore.getState()
    store.setLearnings([])
    store.selectLearning(null)
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setFilterCategory(null)
    store.setFilterHarness(null)
  })

  it('should render the page header', () => {
    render(<LearningsPage />)
    expect(screen.getByText('Learnings')).toBeInTheDocument()
    expect(screen.getByText('Browse and search your knowledge base')).toBeInTheDocument()
  })

  it('should render export and import buttons', async () => {
    render(<LearningsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
  })

  it('should show empty state for learning detail', () => {
    render(<LearningsPage />)
    expect(screen.getByText('Select a learning to view its content')).toBeInTheDocument()
  })

  it('should auto-load and show learnings', async () => {
    render(<LearningsPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Zustand persist middleware requires explicit storage in jsdom')
      ).toBeInTheDocument()
    })
  })

  it('should show search input', () => {
    render(<LearningsPage />)
    expect(screen.getByPlaceholderText('Search learnings...')).toBeInTheDocument()
  })
})
