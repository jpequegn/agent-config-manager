import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement, type ReactNode } from 'react'

// Add any providers that need to wrap components during testing
interface WrapperProps {
  children: ReactNode
}

function AllProviders({ children }: WrapperProps) {
  return <>{children}</>
}

// Custom render function that wraps components with providers
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Override render with custom render
export { customRender as render }
