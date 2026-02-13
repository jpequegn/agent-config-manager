/**
 * Command Palette Component
 * Unified search and command interface (Cmd+K)
 * - Default mode: searches across all content types with grouped results
 * - Command mode (> prefix): shows navigation and action commands
 * - Recent searches shown when input is empty
 * - Search scope toggle: All / Current Harness
 */

import { useEffect, useCallback, useState } from 'react'
import {
  Settings,
  Zap,
  Code2,
  History,
  HardDrive,
  Wrench,
  Cpu,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Clock,
  X,
  FolderOpen,
  Lightbulb,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { useUIStore, useCommandPaletteOpen, useHarnessStore } from '@/stores'
import { getHarnessConfig, getAllHarnessTypes } from '@/components/harness'
import {
  searchAll,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  type SearchResultGroup,
  type SearchResultType,
  type SearchScope,
} from '@/services/search'

/** Command item definition */
interface CommandItemDef {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  onSelect: () => void
  keywords?: string[]
}

/** Command group definition */
interface CommandGroupDef {
  heading: string
  items: CommandItemDef[]
}

/** Icons for search result types */
const TYPE_ICONS: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
  skill: Zap,
  hook: Code2,
  setting: Settings,
  project: FolderOpen,
  tool: Wrench,
  session: History,
  learning: Lightbulb,
}

/**
 * Command Palette
 * Opens with Cmd+K / Ctrl+K for quick navigation and commands
 */
export function CommandPalette() {
  const isOpen = useCommandPaletteOpen()
  const openCommandPalette = useUIStore((state) => state.openCommandPalette)
  const closeCommandPalette = useUIStore((state) => state.closeCommandPalette)
  const setActiveHarness = useHarnessStore((state) => state.setActiveHarness)
  const activeHarness = useHarnessStore((state) => state.activeHarness)

  const [inputValue, setInputValue] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchScope, setSearchScope] = useState<SearchScope>('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const isCommandMode = inputValue.startsWith('>')
  const commandFilter = isCommandMode ? inputValue.slice(1).trim().toLowerCase() : ''
  const searchQuery = isCommandMode ? '' : inputValue
  const hasSearchQuery = searchQuery.trim().length > 0

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          closeCommandPalette()
        } else {
          openCommandPalette()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, openCommandPalette, closeCommandPalette])

  // Reset state when palette opens/closes
  function handleOpenChange(open: boolean) {
    if (open) {
      setInputValue('')
      setSearchResults([])
      setRecentSearches(getRecentSearches())
      openCommandPalette()
    } else {
      closeCommandPalette()
    }
  }

  // Debounced search
  useEffect(() => {
    if (!hasSearchQuery) return

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchAll({
        query: searchQuery,
        scope: searchScope,
        activeHarness,
      })
      setSearchResults(results)
      setIsSearching(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery, searchScope, activeHarness, hasSearchQuery])

  // Handle item selection
  const handleSelect = useCallback(
    (callback: () => void) => {
      // Track search if we have a query
      if (hasSearchQuery) {
        addRecentSearch(searchQuery)
      }
      callback()
      closeCommandPalette()
    },
    [closeCommandPalette, hasSearchQuery, searchQuery]
  )

  function handleRecentSearchClick(query: string) {
    setInputValue(query)
  }

  function handleClearRecent() {
    clearRecentSearches()
    setRecentSearches([])
  }

  // Navigation commands
  const navigationCommands: CommandGroupDef = {
    heading: 'Navigation',
    items: [
      {
        id: 'nav-skills',
        label: 'Go to Skills',
        icon: Zap,
        shortcut: '⌘1',
        onSelect: () => console.log('Navigate to Skills'),
        keywords: ['skills', 'commands', 'prompts'],
      },
      {
        id: 'nav-hooks',
        label: 'Go to Hooks',
        icon: Code2,
        shortcut: '⌘2',
        onSelect: () => console.log('Navigate to Hooks'),
        keywords: ['hooks', 'automation', 'scripts'],
      },
      {
        id: 'nav-sessions',
        label: 'Go to Sessions',
        icon: History,
        shortcut: '⌘3',
        onSelect: () => console.log('Navigate to Sessions'),
        keywords: ['sessions', 'history', 'conversations'],
      },
      {
        id: 'nav-memory',
        label: 'Go to Memory',
        icon: HardDrive,
        shortcut: '⌘4',
        onSelect: () => console.log('Navigate to Memory'),
        keywords: ['memory', 'storage', 'context'],
      },
      {
        id: 'nav-tools',
        label: 'Go to Tools & MCP',
        icon: Wrench,
        shortcut: '⌘5',
        onSelect: () => console.log('Navigate to Tools'),
        keywords: ['tools', 'mcp', 'servers'],
      },
      {
        id: 'nav-settings',
        label: 'Go to Settings',
        icon: Settings,
        shortcut: '⌘,',
        onSelect: () => console.log('Navigate to Settings'),
        keywords: ['settings', 'preferences', 'config'],
      },
    ],
  }

  // Harness commands
  const harnessCommands: CommandGroupDef = {
    heading: 'Switch Harness',
    items: getAllHarnessTypes().map((type) => {
      const config = getHarnessConfig(type)
      return {
        id: `harness-${type}`,
        label: `Switch to ${config.name}`,
        icon: Cpu,
        onSelect: () => setActiveHarness(type),
        keywords: [type, config.name.toLowerCase(), config.shortName.toLowerCase()],
      }
    }),
  }

  // Action commands
  const actionCommands: CommandGroupDef = {
    heading: 'Actions',
    items: [
      {
        id: 'action-new-skill',
        label: 'Create New Skill',
        icon: Plus,
        onSelect: () => console.log('Create new skill'),
        keywords: ['create', 'new', 'skill', 'add'],
      },
      {
        id: 'action-new-hook',
        label: 'Create New Hook',
        icon: Plus,
        onSelect: () => console.log('Create new hook'),
        keywords: ['create', 'new', 'hook', 'add'],
      },
      {
        id: 'action-refresh',
        label: 'Refresh All',
        icon: RefreshCw,
        shortcut: '⌘R',
        onSelect: () => console.log('Refresh all'),
        keywords: ['refresh', 'reload', 'sync'],
      },
      {
        id: 'action-docs',
        label: 'Open Documentation',
        icon: FileText,
        onSelect: () => console.log('Open docs'),
        keywords: ['docs', 'documentation', 'help'],
      },
    ],
  }

  // Filter command groups when user types after >
  function filterCommandGroup(group: CommandGroupDef): CommandGroupDef {
    if (!commandFilter) return group
    return {
      ...group,
      items: group.items.filter((item) => {
        const searchStr = [item.label, ...(item.keywords ?? [])].join(' ').toLowerCase()
        return searchStr.includes(commandFilter)
      }),
    }
  }

  const commandGroups = [navigationCommands, harnessCommands, actionCommands]
    .map(filterCommandGroup)
    .filter((g) => g.items.length > 0)
  const totalResults = searchResults.reduce((sum, g) => sum + g.results.length, 0)

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder={
          isCommandMode ? 'Type a command...' : 'Search everything or type > for commands...'
        }
        value={inputValue}
        onValueChange={(value) => {
          setInputValue(value)
          if (!value.trim() || value.startsWith('>')) {
            setSearchResults([])
            setIsSearching(false)
          }
        }}
      />

      {/* Scope toggle */}
      {!isCommandMode && (
        <div className="flex items-center gap-1.5 border-b px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Search in:</span>
          <Button
            variant={searchScope === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-5 px-2 text-[10px]"
            onClick={() => setSearchScope('all')}
          >
            All
          </Button>
          <Button
            variant={searchScope === 'current-harness' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-5 px-2 text-[10px]"
            onClick={() => setSearchScope('current-harness')}
          >
            Current Harness
          </Button>
          {hasSearchQuery && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              {isSearching ? 'Searching...' : `${totalResults} results`}
            </span>
          )}
        </div>
      )}

      <CommandList>
        {/* Search mode - show results */}
        {hasSearchQuery && !isCommandMode && (
          <>
            {searchResults.length === 0 && !isSearching && (
              <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
            )}
            {searchResults.map((group, groupIndex) => {
              const Icon = TYPE_ICONS[group.type]
              return (
                <div key={group.type}>
                  {groupIndex > 0 && <CommandSeparator />}
                  <CommandGroup heading={group.label}>
                    {group.results.map((result) => (
                      <CommandItem
                        key={`${result.type}-${result.id}`}
                        value={`${result.type}-${result.id}`}
                        onSelect={() =>
                          handleSelect(() => console.log('Navigate to', result.type, result.id))
                        }
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex flex-1 items-center gap-2 overflow-hidden">
                          <span className="truncate">{result.title}</span>
                          {result.description && (
                            <span className="truncate text-xs text-muted-foreground">
                              {result.description}
                            </span>
                          )}
                        </div>
                        {result.meta && (
                          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                            {result.meta}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </div>
              )
            })}
          </>
        )}

        {/* Empty state - show recent searches or hint */}
        {!hasSearchQuery && !isCommandMode && (
          <>
            {recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((query) => (
                  <CommandItem
                    key={`recent-${query}`}
                    value={`recent-${query}`}
                    onSelect={() => handleRecentSearchClick(query)}
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{query}</span>
                  </CommandItem>
                ))}
                <CommandItem
                  value="clear-recent"
                  onSelect={handleClearRecent}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  <span>Clear recent searches</span>
                </CommandItem>
              </CommandGroup>
            )}
            {recentSearches.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Quick Actions">
              <CommandItem value="search-hint" onSelect={() => setInputValue('>')}>
                <Search className="mr-2 h-4 w-4" />
                <span>Type to search or</span>
                <kbd className="ml-1 rounded border bg-muted px-1 text-[10px]">&gt;</kbd>
                <span className="ml-1">for commands</span>
              </CommandItem>
              <CommandItem
                value="quick-new-skill"
                onSelect={() => handleSelect(() => console.log('Create new skill'))}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Skill</span>
              </CommandItem>
              <CommandItem
                value="quick-new-hook"
                onSelect={() => handleSelect(() => console.log('Create new hook'))}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Hook</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Command mode (> prefix) - show command groups */}
        {isCommandMode && (
          <>
            {commandGroups.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No commands found.
              </div>
            )}
            {commandGroups.map((group, groupIndex) => (
              <div key={group.heading}>
                {groupIndex > 0 && <CommandSeparator />}
                <CommandGroup heading={group.heading}>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        keywords={item.keywords}
                        onSelect={() => handleSelect(item.onSelect)}
                      >
                        <ItemIcon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                        {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </div>
            ))}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}

export default CommandPalette
