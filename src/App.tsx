import { useState } from 'react'
import { FolderSearch, BookOpen, History } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { ProjectContextPage, LearningsPage } from '@/features/memory'
import { ConversationsPage } from '@/features/conversations'
import { cn } from '@/lib/utils'

type AppTab = 'project-context' | 'learnings' | 'sessions'

const TABS: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'project-context', label: 'Project Context', icon: FolderSearch },
  { id: 'learnings', label: 'Learnings', icon: BookOpen },
  { id: 'sessions', label: 'Sessions', icon: History },
]

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('project-context')

  return (
    <AppShell
      header={
        <div className="flex items-center gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              size="sm"
              className={cn('gap-2', activeTab === id && 'bg-accent text-accent-foreground')}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      }
    >
      {activeTab === 'project-context' && <ProjectContextPage />}
      {activeTab === 'learnings' && <LearningsPage />}
      {activeTab === 'sessions' && <ConversationsPage />}
    </AppShell>
  )
}

export default App
