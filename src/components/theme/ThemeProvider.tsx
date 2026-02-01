/**
 * Theme Provider
 * Manages theme state and syncs with DOM
 */

import { useEffect, useRef } from 'react'
import { useUIStore, useTheme, useResolvedTheme } from '@/stores'
import type { Theme } from '@/stores/ui-store'

/** Get system color scheme preference */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Apply theme class to document (SSR safe) */
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

/** Props for ThemeProvider */
interface ThemeProviderProps {
  children: React.ReactNode
  /** Default theme if none persisted (only used on first mount) */
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

  // Track if we've initialized (only use defaultTheme on first mount)
  const hasInitialized = useRef(false)

  // Initialize theme on mount only
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    // If no theme set, use default
    if (!theme) {
      setTheme(defaultTheme)
    }

    // Resolve and apply the initial theme
    const resolved = theme === 'system' ? getSystemTheme() : theme || defaultTheme
    setResolvedTheme(resolved as 'light' | 'dark')
    applyTheme(resolved as 'light' | 'dark')
  }, []) // Empty deps - only run on mount

  // Apply theme whenever resolved theme changes (handles user toggling)
  useEffect(() => {
    if (resolvedTheme) {
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme])

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, setResolvedTheme])

  return <>{children}</>
}

export default ThemeProvider
