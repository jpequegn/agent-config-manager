import { useState } from 'react'
import { FolderSearch, BookOpen } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { ProjectContextPage, LearningsPage } from '@/features/memory'
import { cn } from '@/lib/utils'

type MemoryTab = 'project-context' | 'learnings'

const TABS: { id: MemoryTab; label: string; icon: React.ComponentType<{ className?: string }> }[] =
  [
    { id: 'project-context', label: 'Project Context', icon: FolderSearch },
    { id: 'learnings', label: 'Learnings', icon: BookOpen },
  ]

function App() {
  const [activeTab, setActiveTab] = useState<MemoryTab>('project-context')

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
      {activeTab === 'project-context' ? <ProjectContextPage /> : <LearningsPage />}
    </AppShell>
  )
}

export default App
