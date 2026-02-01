/**
 * Theme Provider
 * Manages theme state and syncs with DOM
 */

import { useEffect } from 'react'
import { useUIStore, useTheme, useResolvedTheme } from '@/stores'
import type { Theme } from '@/stores/ui-store'

/** Get system color scheme preference */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Apply theme class to document */
function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

/** Props for ThemeProvider */
interface ThemeProviderProps {
  children: React.ReactNode
  /** Default theme if none persisted */
  defaultTheme?: Theme
}

/**
 * Theme Provider Component
 * Syncs theme state with DOM and handles system preference changes
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const theme = useTheme()
  const resolvedTheme = useResolvedTheme()
  const setTheme = useUIStore((state) => state.setTheme)
  const setResolvedTheme = useUIStore((state) => state.setResolvedTheme)

  // Initialize theme on mount
  useEffect(() => {
    // If no theme set, use default
    if (!theme) {
      setTheme(defaultTheme)
    }

    // Resolve the actual theme
    const resolved = theme === 'system' ? getSystemTheme() : theme || defaultTheme
    setResolvedTheme(resolved as 'light' | 'dark')
    applyTheme(resolved as 'light' | 'dark')
  }, [theme, defaultTheme, setTheme, setResolvedTheme])

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
      applyTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, setResolvedTheme])

  // Apply theme whenever resolved theme changes
  useEffect(() => {
    if (resolvedTheme) {
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme])

  return <>{children}</>
}

export default ThemeProvider
