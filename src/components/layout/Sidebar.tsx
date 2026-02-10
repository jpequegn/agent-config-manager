/**
 * Sidebar Component
 * Navigation sidebar with collapsible sections and item counts
 */

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  FileText,
  History,
  HardDrive,
  Settings,
  Wrench,
  Zap,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useUIStore, useSidebarCollapsed, type SidebarSection } from '@/stores'
import { useActiveHarness } from '@/stores'

/** Navigation item definition */
interface NavItem {
  id: SidebarSection
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  children?: { id: string; label: string; count?: number }[]
}

/** Navigation items configuration */
const navItems: NavItem[] = [
  {
    id: 'harnesses',
    label: 'Harnesses',
    icon: Cpu,
    children: [
      { id: 'claude-code', label: 'Claude Code' },
      { id: 'cursor', label: 'Cursor' },
      { id: 'copilot', label: 'GitHub Copilot' },
      { id: 'cline', label: 'Cline' },
      { id: 'continue', label: 'Continue' },
      { id: 'aider', label: 'Aider' },
    ],
  },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'hooks', label: 'Hooks', icon: Code2 },
  { id: 'sessions', label: 'Sessions', icon: History },
  { id: 'memory', label: 'Memory', icon: HardDrive },
  { id: 'tools', label: 'Tools & MCP', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: Settings },
]

/** Props for NavSection */
interface NavSectionProps {
  item: NavItem
  isExpanded: boolean
  isActive: boolean
  isCollapsed: boolean
  onToggle: () => void
  onSelect: () => void
}

/** Individual navigation section */
function NavSection({
  item,
  isExpanded,
  isActive,
  isCollapsed,
  onToggle,
  onSelect,
}: NavSectionProps) {
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="mb-1">
      <button
        onClick={hasChildren ? onToggle : onSelect}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={
          isCollapsed
            ? item.label +
              (item.count !== undefined ? ` (${item.count})` : '') +
              (hasChildren ? (isExpanded ? ', expanded' : ', collapsed') : '')
            : undefined
        }
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring',
          isActive && 'bg-accent text-accent-foreground',
          isCollapsed && 'justify-center px-2'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.count !== undefined && (
              <span
                className="rounded-full bg-muted px-2 py-0.5 text-xs"
                aria-label={`${item.count} items`}
              >
                {item.count}
              </span>
            )}
            {hasChildren && (
              <span className="text-muted-foreground" aria-hidden="true">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
          </>
        )}
      </button>

      {/* Children (sub-items) */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div
          className="ml-4 mt-1 space-y-1 border-l pl-3"
          role="group"
          aria-label={`${item.label} submenu`}
        >
          {item.children!.map((child) => (
            <button
              key={child.id}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring'
              )}
              aria-label={
                child.count !== undefined
                  ? `${child.label} (${child.count} items)`
                  : child.label
              }
            >
              <span className="flex-1 text-left">{child.label}</span>
              {child.count !== undefined && (
                <span
                  className="rounded-full bg-muted px-2 py-0.5 text-xs"
                  aria-hidden="true"
                >
                  {child.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Sidebar component */
export function Sidebar() {
  const isCollapsed = useSidebarCollapsed()
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const expandedSections = useUIStore((state) => state.expandedSections)
  const toggleSection = useUIStore((state) => state.toggleSection)
  const activeHarness = useActiveHarness()

  const [activeSection, setActiveSection] = useState<SidebarSection>('harnesses')

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-200',
        isCollapsed ? 'w-14' : 'w-64'
      )}
      aria-label="Application navigation"
    >
      {/* Header */}
      <div
        className={cn('flex h-14 items-center border-b px-4', isCollapsed && 'justify-center px-2')}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="font-semibold">Config Manager</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', !isCollapsed && 'ml-auto')}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto p-2"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <NavSection
            key={item.id}
            item={item}
            isExpanded={expandedSections.has(item.id)}
            isActive={activeSection === item.id}
            isCollapsed={isCollapsed}
            onToggle={() => toggleSection(item.id)}
            onSelect={() => setActiveSection(item.id)}
          />
        ))}
      </nav>

      {/* Footer - Active harness indicator */}
      {!isCollapsed && activeHarness && (
        <div
          className="border-t p-3"
          role="status"
          aria-live="polite"
          aria-label={`Active harness: ${activeHarness}`}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div
              className="h-2 w-2 rounded-full bg-green-500"
              aria-hidden="true"
            />
            <span>Active: {activeHarness}</span>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
