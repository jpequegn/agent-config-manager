import { useState, useRef, lazy, Suspense } from 'react'
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
  Activity,
  ArrowLeftRight,
  Archive,
  Bell,
  Loader2,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { ToastContainer } from '@/components/notifications'
import { cn } from '@/lib/utils'

// Lazy-loaded tab pages for route-level code splitting
const MemoryDashboard = lazy(() =>
  import('@/features/memory').then((m) => ({ default: m.MemoryDashboard }))
)
const ExternalContextPage = lazy(() =>
  import('@/features/memory').then((m) => ({ default: m.ExternalContextPage }))
)
const ProjectContextPage = lazy(() =>
  import('@/features/memory').then((m) => ({ default: m.ProjectContextPage }))
)
const LearningsPage = lazy(() =>
  import('@/features/memory').then((m) => ({ default: m.LearningsPage }))
)
const SessionMemoryPage = lazy(() =>
  import('@/features/memory').then((m) => ({ default: m.SessionMemoryPage }))
)
const ConversationsPage = lazy(() =>
  import('@/features/conversations').then((m) => ({ default: m.ConversationsPage }))
)
const HooksPage = lazy(() => import('@/features/hooks').then((m) => ({ default: m.HooksPage })))
const HookTestingPage = lazy(() =>
  import('@/features/hooks').then((m) => ({ default: m.HookTestingPage }))
)
const SkillsPage = lazy(() => import('@/features/skills').then((m) => ({ default: m.SkillsPage })))
const ToolsPage = lazy(() => import('@/features/tools').then((m) => ({ default: m.ToolsPage })))
const MigrationWizardPage = lazy(() =>
  import('@/features/migration').then((m) => ({ default: m.MigrationWizardPage }))
)
const SyncBackupPage = lazy(() =>
  import('@/features/sync-backup').then((m) => ({ default: m.SyncBackupPage }))
)
const NotificationsPage = lazy(() =>
  import('@/features/notifications').then((m) => ({ default: m.NotificationsPage }))
)
const SettingsPage = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsPage }))
)

function TabFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

type AppTab =
  | 'memory'
  | 'external-context'
  | 'project-context'
  | 'learnings'
  | 'session-memory'
  | 'sessions'
  | 'hooks'
  | 'hook-testing'
  | 'skills'
  | 'tools'
  | 'migration'
  | 'sync-backup'
  | 'notifications'
  | 'settings'

const TABS: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'memory', label: 'Memory', icon: BarChart3 },
  { id: 'external-context', label: 'External', icon: HardDrive },
  { id: 'project-context', label: 'Project Context', icon: FolderSearch },
  { id: 'learnings', label: 'Learnings', icon: BookOpen },
  { id: 'session-memory', label: 'Session Memory', icon: Database },
  { id: 'sessions', label: 'Sessions', icon: History },
  { id: 'hooks', label: 'Hooks', icon: Webhook },
  { id: 'hook-testing', label: 'Hook Logs', icon: Activity },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'migration', label: 'Migration', icon: ArrowLeftRight },
  { id: 'sync-backup', label: 'Sync & Backup', icon: Archive },
  { id: 'notifications', label: 'Notifications', icon: Bell },
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
      <Suspense fallback={<TabFallback />}>
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
          id="panel-hook-testing"
          role="tabpanel"
          aria-labelledby="hook-testing-tab"
          hidden={activeTab !== 'hook-testing'}
        >
          {activeTab === 'hook-testing' && <HookTestingPage />}
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
          id="panel-migration"
          role="tabpanel"
          aria-labelledby="migration-tab"
          hidden={activeTab !== 'migration'}
        >
          {activeTab === 'migration' && <MigrationWizardPage />}
        </div>
        <div
          id="panel-sync-backup"
          role="tabpanel"
          aria-labelledby="sync-backup-tab"
          hidden={activeTab !== 'sync-backup'}
        >
          {activeTab === 'sync-backup' && <SyncBackupPage />}
        </div>
        <div
          id="panel-notifications"
          role="tabpanel"
          aria-labelledby="notifications-tab"
          hidden={activeTab !== 'notifications'}
        >
          {activeTab === 'notifications' && <NotificationsPage />}
        </div>
        <div
          id="panel-settings"
          role="tabpanel"
          aria-labelledby="settings-tab"
          hidden={activeTab !== 'settings'}
        >
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </Suspense>
      <ToastContainer />
    </AppShell>
  )
}

export default App
