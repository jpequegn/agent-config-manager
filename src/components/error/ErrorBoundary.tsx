/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

/** Props for ErrorBoundary */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode
  /** Custom fallback UI (optional) */
  fallback?: ReactNode
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Whether to show error details (dev mode) */
  showDetails?: boolean
  /** Custom reset handler */
  onReset?: () => void
}

/** State for ErrorBoundary */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary component
 * Wraps children and catches any errors, displaying a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // Call optional error callback
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  handleReload = (): void => {
    window.location.reload()
  }

  override render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, showDetails = import.meta.env.DEV } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. You can try again or reload the page.
              </CardDescription>
            </CardHeader>

            {showDetails && error && (
              <CardContent>
                <div className="rounded-md bg-muted p-4">
                  <p className="mb-2 font-mono text-sm font-semibold text-destructive">
                    {error.name}: {error.message}
                  </p>
                  {errorInfo?.componentStack && (
                    <pre className="max-h-40 overflow-auto text-xs text-muted-foreground">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </CardContent>
            )}

            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} variant="default">
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
