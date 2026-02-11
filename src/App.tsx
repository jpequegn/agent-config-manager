import { useState, useRef } from 'react'
import {
  FolderSearch,
  BookOpen,
  History,
  Zap,
  Wrench,
  Settings2,
  BarChart3,
  Database,
  HardDrive,
  Webhook,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import {
  ProjectContextPage,
  LearningsPage,
  MemoryDashboard,
  SessionMemoryPage,
  ExternalContextPage,
} from '@/features/memory'
import { ConversationsPage } from '@/features/conversations'
import { SkillsPage } from '@/features/skills'
import { ToolsPage } from '@/features/tools'
import { SettingsPage } from '@/features/settings'
import { HooksPage } from '@/features/hooks'
import { cn } from '@/lib/utils'

type AppTab =
  | 'memory'
  | 'external-context'
  | 'project-context'
  | 'learnings'
  | 'session-memory'
  | 'sessions'
  | 'hooks'
  | 'skills'
  | 'tools'
  | 'settings'

const TABS: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'memory', label: 'Memory', icon: BarChart3 },
  { id: 'external-context', label: 'External', icon: HardDrive },
  { id: 'project-context', label: 'Project Context', icon: FolderSearch },
  { id: 'learnings', label: 'Learnings', icon: BookOpen },
  { id: 'session-memory', label: 'Session Memory', icon: Database },
  { id: 'sessions', label: 'Sessions', icon: History },
  { id: 'hooks', label: 'Hooks', icon: Webhook },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('memory')
  const tabButtonsRef = useRef<(HTMLButtonElement | null)[]>([])

  // Handle keyboard navigation in tab list
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tabIndex: number) => {
    let newIndex = tabIndex
    let shouldFocus = false

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      newIndex = (tabIndex + 1) % TABS.length
      shouldFocus = true
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      newIndex = (tabIndex - 1 + TABS.length) % TABS.length
      shouldFocus = true
    } else if (e.key === 'Home') {
      e.preventDefault()
      newIndex = 0
      shouldFocus = true
    } else if (e.key === 'End') {
      e.preventDefault()
      newIndex = TABS.length - 1
      shouldFocus = true
    }

    if (shouldFocus) {
      setActiveTab(TABS[newIndex].id)
      // Focus the button after state updates
      setTimeout(() => {
        tabButtonsRef.current[newIndex]?.focus()
      }, 0)
    }
  }

  return (
    <AppShell
      header={
        <div
          className="flex items-center gap-1"
          role="tablist"
          aria-label="Content navigation tabs"
        >
          {TABS.map(({ id, label, icon: Icon }, index) => (
            <Button
              key={id}
              ref={(el) => {
                tabButtonsRef.current[index] = el
              }}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`panel-${id}`}
              variant="ghost"
              size="sm"
              className={cn('gap-2', activeTab === id && 'bg-accent text-accent-foreground')}
              onClick={() => setActiveTab(id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>
      }
    >
      <div
        id="panel-memory"
        role="tabpanel"
        aria-labelledby="memory-tab"
        hidden={activeTab !== 'memory'}
      >
        {activeTab === 'memory' && <MemoryDashboard />}
      </div>
      <div
        id="panel-external-context"
        role="tabpanel"
        aria-labelledby="external-context-tab"
        hidden={activeTab !== 'external-context'}
      >
        {activeTab === 'external-context' && <ExternalContextPage />}
      </div>
      <div
        id="panel-project-context"
        role="tabpanel"
        aria-labelledby="project-context-tab"
        hidden={activeTab !== 'project-context'}
      >
        {activeTab === 'project-context' && <ProjectContextPage />}
      </div>
      <div
        id="panel-learnings"
        role="tabpanel"
        aria-labelledby="learnings-tab"
        hidden={activeTab !== 'learnings'}
      >
        {activeTab === 'learnings' && <LearningsPage />}
      </div>
      <div
        id="panel-session-memory"
        role="tabpanel"
        aria-labelledby="session-memory-tab"
        hidden={activeTab !== 'session-memory'}
      >
        {activeTab === 'session-memory' && <SessionMemoryPage />}
      </div>
      <div
        id="panel-sessions"
        role="tabpanel"
        aria-labelledby="sessions-tab"
        hidden={activeTab !== 'sessions'}
      >
        {activeTab === 'sessions' && <ConversationsPage />}
      </div>
      <div
        id="panel-hooks"
        role="tabpanel"
        aria-labelledby="hooks-tab"
        hidden={activeTab !== 'hooks'}
      >
        {activeTab === 'hooks' && <HooksPage />}
      </div>
      <div
        id="panel-skills"
        role="tabpanel"
        aria-labelledby="skills-tab"
        hidden={activeTab !== 'skills'}
      >
        {activeTab === 'skills' && <SkillsPage />}
      </div>
      <div
        id="panel-tools"
        role="tabpanel"
        aria-labelledby="tools-tab"
        hidden={activeTab !== 'tools'}
      >
        {activeTab === 'tools' && <ToolsPage />}
      </div>
      <div
        id="panel-settings"
        role="tabpanel"
        aria-labelledby="settings-tab"
        hidden={activeTab !== 'settings'}
      >
        {activeTab === 'settings' && <SettingsPage />}
      </div>
    </AppShell>
  )
}

export default App
