/**
 * Command Palette Component
 * Unified search and command interface (Cmd+K)
 */

import { useEffect, useCallback } from 'react'
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
import { useUIStore, useCommandPaletteOpen, useHarnessStore } from '@/stores'
import { getHarnessConfig, getAllHarnessTypes } from '@/components/harness'

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

/**
 * Command Palette
 * Opens with Cmd+K / Ctrl+K for quick navigation and commands
 */
export function CommandPalette() {
  const isOpen = useCommandPaletteOpen()
  const openCommandPalette = useUIStore((state) => state.openCommandPalette)
  const closeCommandPalette = useUIStore((state) => state.closeCommandPalette)
  const setActiveHarness = useHarnessStore((state) => state.setActiveHarness)

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

  // Handle item selection
  const handleSelect = useCallback(
    (callback: () => void) => {
      callback()
      closeCommandPalette()
    },
    [closeCommandPalette]
  )

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

  const commandGroups = [navigationCommands, harnessCommands, actionCommands]

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => (open ? openCommandPalette() : closeCommandPalette())}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {commandGroups.map((group, groupIndex) => (
          <div key={group.heading}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    keywords={item.keywords}
                    onSelect={() => handleSelect(item.onSelect)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  )
}

export default CommandPalette
