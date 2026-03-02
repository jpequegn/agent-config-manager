/**
 * Web Vitals performance monitoring.
 * Reports Core Web Vitals metrics to the console in development.
 * In production, pipe onReport to your analytics endpoint.
 */

import type { Metric } from 'web-vitals'

export function reportWebVitals(onReport?: (metric: Metric) => void) {
  import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
    const handler = onReport ?? defaultReporter
    onCLS(handler)
    onFCP(handler)
    onINP(handler)
    onLCP(handler)
    onTTFB(handler)
  })
}

function defaultReporter(metric: Metric) {
  if (import.meta.env.DEV) {
    const color =
      metric.rating === 'good'
        ? '#22c55e'
        : metric.rating === 'needs-improvement'
          ? '#f59e0b'
          : '#ef4444'
    console.log(
      `%c[Web Vitals] ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    )
  }
}
