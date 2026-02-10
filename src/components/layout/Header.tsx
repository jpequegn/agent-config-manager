/**
 * Header Component
 * Application header with search and actions
 */

import { Search, Command, Bell, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUIStore, useTheme, useResolvedTheme } from '@/stores'
import { cn } from '@/lib/utils'

/** Header component */
export function Header() {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  const openCommandPalette = useUIStore((state) => state.openCommandPalette)
  const theme = useTheme()
  const resolvedTheme = useResolvedTheme()
  const setTheme = useUIStore((state) => state.setTheme)

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  return (
    <div className="flex w-full items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search..."
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-12"
        />
        <kbd
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5',
            'font-mono text-[10px] font-medium text-muted-foreground sm:flex'
          )}
          aria-hidden="true"
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Command palette */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openCommandPalette}
          aria-label="Open command palette (⌘K)"
        >
          <Command className="h-4 w-4" aria-hidden="true" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

export default Header
