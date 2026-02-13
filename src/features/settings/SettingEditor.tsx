/**
 * SettingEditor Component
 * Inline editor for individual settings with type-specific inputs
 */

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SettingEntry } from '@/services/settings'
import type { SettingValue } from '@/types'

interface Props {
  entry: SettingEntry
  onUpdate: (key: string, value: SettingValue) => void
  onReset: (key: string) => void
  validationError?: string
}

export function SettingEditor({ entry, onUpdate, onReset, validationError }: Props) {
  const { definition: def, current } = entry

  return (
    <div className="space-y-2 border-t bg-accent/10 px-6 py-3">
      <div className="flex items-center justify-between">
        <label htmlFor={`setting-${def.key}`} className="text-xs font-medium">
          Edit: {def.name}
        </label>
        {current.isModified && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs text-muted-foreground"
            onClick={() => onReset(def.key)}
            aria-label={`Reset ${def.name} to default`}
          >
            <RotateCcw className="h-3 w-3" />
            Reset to default
          </Button>
        )}
      </div>

      <SettingInput
        id={`setting-${def.key}`}
        entry={entry}
        onUpdate={(value) => onUpdate(def.key, value)}
      />

      {validationError && (
        <p className="text-xs text-red-400" role="alert">
          {validationError}
        </p>
      )}

      {def.requiresRestart && (
        <p className="text-[10px] text-amber-400">Requires restart to take effect</p>
      )}
    </div>
  )
}

/** Renders the appropriate input for a setting type */
function SettingInput({
  id,
  entry,
  onUpdate,
}: {
  id: string
  entry: SettingEntry
  onUpdate: (value: SettingValue) => void
}) {
  const { definition: def, current } = entry

  if (def.type === 'boolean') {
    return <BooleanInput id={id} value={current.value as boolean} onChange={onUpdate} />
  }

  if (def.type === 'select') {
    return (
      <SelectInput
        id={id}
        value={String(current.value)}
        options={def.options ?? []}
        onChange={onUpdate}
      />
    )
  }

  if (def.type === 'number') {
    return (
      <NumberInput
        id={id}
        value={current.value as number}
        min={def.min}
        max={def.max}
        onChange={onUpdate}
      />
    )
  }

  // string, path, json all use text input
  return <StringInput id={id} value={String(current.value)} onChange={onUpdate} />
}

function BooleanInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
          value ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
            value ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
      <span className="text-xs text-muted-foreground">{value ? 'Enabled' : 'Disabled'}</span>
    </div>
  )
}

function SelectInput({
  id,
  value,
  options,
  onChange,
}: {
  id: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-8 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function NumberInput({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
}) {
  const [local, setLocal] = useState(String(value))

  function handleBlur() {
    const num = Number(local)
    if (!isNaN(num)) onChange(num)
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        id={id}
        type="number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={handleBlur}
        min={min}
        max={max}
        className="h-8 w-32 text-sm"
      />
      {(min != null || max != null) && (
        <span className="text-[10px] text-muted-foreground">
          {min != null && `min: ${min}`}
          {min != null && max != null && ' · '}
          {max != null && `max: ${max}`}
        </span>
      )}
    </div>
  )
}

function StringInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (v: string) => void
}) {
  const [local, setLocal] = useState(value)

  function handleBlur() {
    onChange(local)
  }

  return (
    <Input
      id={id}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      className="h-8 max-w-md text-sm"
    />
  )
}
