/**
 * Utility Function Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatBytes,
  formatRelativeTime,
  truncate,
  debounce,
  throttle,
  generateId,
  capitalize,
  kebabToTitle,
} from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const condition = false
    expect(cn('foo', condition && 'bar', 'baz')).toBe('foo baz')
  })

  it('deduplicates tailwind classes', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })
})

describe('formatBytes', () => {
  it('returns "0 Bytes" for zero', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 Bytes')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
  })

  it('respects decimal places', () => {
    expect(formatBytes(1500, 1)).toBe('1.5 KB')
  })

  it('handles 0 decimal places', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for recent times', () => {
    const date = new Date('2025-01-01T11:59:50Z') // 10 seconds ago
    expect(formatRelativeTime(date)).toBe('just now')
  })

  it('returns minutes ago', () => {
    const date = new Date('2025-01-01T11:55:00Z') // 5 minutes ago
    expect(formatRelativeTime(date)).toBe('5m ago')
  })

  it('returns hours ago', () => {
    const date = new Date('2025-01-01T10:00:00Z') // 2 hours ago
    expect(formatRelativeTime(date)).toBe('2h ago')
  })

  it('returns days ago', () => {
    const date = new Date('2024-12-29T12:00:00Z') // 3 days ago
    expect(formatRelativeTime(date)).toBe('3d ago')
  })

  it('returns formatted date for old dates', () => {
    const date = new Date('2024-12-01T12:00:00Z') // over 7 days ago
    const result = formatRelativeTime(date)
    expect(result).not.toContain('ago')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('truncate', () => {
  it('returns the string unchanged when shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns the string unchanged when equal to maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('only calls function once for multiple rapid calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledOnce()
  })

  it('passes arguments to the function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('arg1', 'arg2')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('resets the timer on each call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(50)
    debounced() // reset timer
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledOnce()
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls function immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledOnce()
  })

  it('ignores subsequent calls within the limit', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledOnce()
  })

  it('allows calls again after the limit expires', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(100)
    throttled()

    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('generateId', () => {
  it('generates a non-empty string', () => {
    expect(generateId()).toBeTruthy()
    expect(typeof generateId()).toBe('string')
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('includes prefix when provided', () => {
    const id = generateId('hook')
    expect(id.startsWith('hook-')).toBe(true)
  })

  it('omits prefix when not provided', () => {
    const id = generateId()
    expect(id.includes('-')).toBe(true) // still has timestamp-random separator
  })
})

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('leaves already capitalized string unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
  })
})

describe('kebabToTitle', () => {
  it('converts kebab-case to Title Case', () => {
    expect(kebabToTitle('hello-world')).toBe('Hello World')
  })

  it('handles single word', () => {
    expect(kebabToTitle('hello')).toBe('Hello')
  })

  it('handles multiple words', () => {
    expect(kebabToTitle('foo-bar-baz')).toBe('Foo Bar Baz')
  })
})
