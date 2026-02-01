/**
 * Theme Toggle Component
 * Button to toggle between light/dark/system themes
 */

import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUIStore, useTheme } from '@/stores'
import type { Theme } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

/** Theme option configuration */
interface ThemeOption {
  value: Theme
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

/** Props for ThemeToggle */
interface ThemeToggleProps {
  /** Additional class name */
  className?: string
  /** Size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * Theme Toggle Component
 * Dropdown menu to select theme preference
 */
export function ThemeToggle({ className, size = 'icon' }: ThemeToggleProps) {
  const theme = useTheme()
  const setTheme = useUIStore((state) => state.setTheme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className={cn('relative', className)}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(theme === option.value && 'bg-accent')}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle
