/**
 * App Shell Component
 * Main application layout with sidebar and content area
 */

import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

/** Props for AppShell */
interface AppShellProps {
  /** Main content */
  children: ReactNode
  /** Optional header content */
  header?: ReactNode
}

/**
 * Main application shell
 * Provides the overall layout structure with sidebar navigation
 */
export function AppShell({ children, header }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Optional header */}
        {header && (
          <header className="flex h-14 shrink-0 items-center border-b bg-card px-6">
            {header}
          </header>
        )}

        {/* Main content */}
        <main
          id="main-content"
          className={cn('flex-1 overflow-auto p-6', 'transition-all duration-200')}
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell
