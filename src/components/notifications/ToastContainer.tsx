/**
 * ToastContainer Component
 * Renders floating toast notifications from the UI store's toast queue
 */

import { useEffect, useCallback } from 'react'
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import type { Toast } from '@/stores/ui-store'

const TOAST_CONFIG: Record<
  Toast['type'],
  { icon: typeof Info; className: string; borderClass: string }
> = {
  info: {
    icon: Info,
    className: 'text-blue-500',
    borderClass: 'border-l-blue-500',
  },
  success: {
    icon: CheckCircle2,
    className: 'text-emerald-500',
    borderClass: 'border-l-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-amber-500',
    borderClass: 'border-l-amber-500',
  },
  error: {
    icon: XCircle,
    className: 'text-red-500',
    borderClass: 'border-l-red-500',
  },
}

const DEFAULT_DURATION = 5000

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast)
  const config = TOAST_CONFIG[toast.type]
  const Icon = config.icon
  const duration = toast.duration ?? DEFAULT_DURATION

  const handleDismiss = useCallback(() => {
    removeToast(toast.id)
  }, [removeToast, toast.id])

  useEffect(() => {
    if (duration <= 0) return
    const timer = setTimeout(handleDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, handleDismiss])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex w-80 items-start gap-3 rounded-lg border border-l-4 bg-card p-3 shadow-lg',
        config.borderClass
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.className)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-xs text-muted-foreground">{toast.message}</p>}
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
