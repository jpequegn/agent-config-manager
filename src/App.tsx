import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="flex gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" className="hover:opacity-80 transition-opacity">
          <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:opacity-80 transition-opacity">
          <img src={reactLogo} className="h-24 w-24 animate-spin" style={{ animationDuration: '20s' }} alt="React logo" />
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-foreground">Agent Config Manager</h1>

      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>shadcn/ui Components</CardTitle>
          <CardDescription>Testing Tailwind CSS and shadcn/ui integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setCount((count) => count + 1)}>
              Count is {count}
            </Button>
            <Button variant="secondary" onClick={() => setCount(0)}>
              Reset
            </Button>
            <Button variant="destructive" onClick={() => setCount((count) => count - 1)}>
              Decrement
            </Button>
          </div>
          <Input placeholder="Type something to test input..." />
          <p className="text-sm text-muted-foreground">
            Edit <code className="font-mono bg-muted px-1 rounded">src/App.tsx</code> and save to test HMR
          </p>
        </CardContent>
      </Card>

      <p className="text-muted-foreground">
        A unified UI for managing AI coding agent configurations
      </p>
    </div>
  )
}

export default App
