/**
 * Sessions Service Tests
 */

import { describe, it, expect } from 'vitest'
import { listSessions, getSession, getSessionListStats } from './service'

describe('SessionsService', () => {
  describe('listSessions', () => {
    it('should return a list of session summaries', async () => {
      const sessions = await listSessions()
      expect(sessions.length).toBeGreaterThan(0)
    })

    it('should include required fields on each summary', async () => {
      const sessions = await listSessions()
      for (const session of sessions) {
        expect(session.id).toBeTruthy()
        expect(session.title).toBeTruthy()
        expect(session.harness).toBeTruthy()
        expect(session.startedAt).toBeInstanceOf(Date)
        expect(session.messageCount).toBeGreaterThan(0)
        expect(typeof session.duration).toBe('number')
      }
    })

    it('should filter by harness', async () => {
      const cursorSessions = await listSessions({ harness: 'cursor' })
      expect(cursorSessions.length).toBeGreaterThan(0)
      for (const s of cursorSessions) {
        expect(s.harness).toBe('cursor')
      }
    })

    it('should filter by multiple harnesses', async () => {
      const sessions = await listSessions({ harness: ['cursor', 'copilot'] })
      expect(sessions.length).toBeGreaterThan(0)
      for (const s of sessions) {
        expect(['cursor', 'copilot']).toContain(s.harness)
      }
    })

    it('should filter by search text in title and tags', async () => {
      const results = await listSessions({ searchText: 'zustand' })
      expect(results.length).toBeGreaterThan(0)
    })

    it('should filter by search text in message content', async () => {
      // "localStorage.setItem" is in message content of sess-002
      const results = await listSessions({ searchText: 'localStorage' })
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((s) => s.id === 'sess-002')).toBe(true)
    })

    it('should filter by project', async () => {
      const results = await listSessions({ project: 'agent-config-manager' })
      expect(results.length).toBeGreaterThan(0)
      for (const s of results) {
        expect(s.project?.toLowerCase()).toBe('agent-config-manager')
      }
    })

    it('should filter by active only', async () => {
      const active = await listSessions({ activeOnly: true })
      expect(active.length).toBeGreaterThan(0)
    })

    it('should return empty for non-matching filters', async () => {
      const results = await listSessions({ searchText: 'xyznonexistent123' })
      expect(results).toEqual([])
    })

    it('should include last message preview', async () => {
      const sessions = await listSessions()
      const withPreview = sessions.filter((s) => s.lastMessagePreview)
      expect(withPreview.length).toBeGreaterThan(0)
    })

    it('should sort by most recent descending by default', async () => {
      const sessions = await listSessions()
      for (let i = 1; i < sessions.length; i++) {
        expect(sessions[i - 1].startedAt.getTime()).toBeGreaterThanOrEqual(
          sessions[i].startedAt.getTime()
        )
      }
    })

    it('should sort by duration ascending', async () => {
      const sessions = await listSessions(undefined, {
        sortBy: 'duration',
        sortOrder: 'asc',
      })
      for (let i = 1; i < sessions.length; i++) {
        expect(sessions[i].duration).toBeGreaterThanOrEqual(sessions[i - 1].duration)
      }
    })

    it('should sort by message count descending', async () => {
      const sessions = await listSessions(undefined, {
        sortBy: 'messages',
        sortOrder: 'desc',
      })
      for (let i = 1; i < sessions.length; i++) {
        expect(sessions[i - 1].messageCount).toBeGreaterThanOrEqual(sessions[i].messageCount)
      }
    })

    it('should combine filters and sort', async () => {
      const sessions = await listSessions(
        { harness: 'claude-code' },
        { sortBy: 'messages', sortOrder: 'desc' }
      )
      expect(sessions.length).toBeGreaterThan(0)
      for (const s of sessions) {
        expect(s.harness).toBe('claude-code')
      }
      for (let i = 1; i < sessions.length; i++) {
        expect(sessions[i - 1].messageCount).toBeGreaterThanOrEqual(sessions[i].messageCount)
      }
    })
  })

  describe('getSession', () => {
    it('should return full session by ID', async () => {
      const session = await getSession('sess-001')
      expect(session).not.toBeNull()
      expect(session!.id).toBe('sess-001')
      expect(session!.messages.length).toBeGreaterThan(0)
      expect(session!.metadata).toBeDefined()
      expect(session!.stats).toBeDefined()
    })

    it('should return null for unknown ID', async () => {
      const session = await getSession('nonexistent')
      expect(session).toBeNull()
    })
  })

  describe('getSessionListStats', () => {
    it('should return aggregate statistics', async () => {
      const stats = await getSessionListStats()
      expect(stats.totalSessions).toBeGreaterThan(0)
      expect(stats.totalMessages).toBeGreaterThan(0)
      expect(stats.byHarness.length).toBeGreaterThan(0)
    })

    it('should have harness breakdown that sums to total', async () => {
      const stats = await getSessionListStats()
      const harnessTotal = stats.byHarness.reduce((sum, h) => sum + h.count, 0)
      expect(harnessTotal).toBe(stats.totalSessions)
    })

    it('should track active sessions', async () => {
      const stats = await getSessionListStats()
      expect(stats.activeSessions).toBeGreaterThanOrEqual(0)
      expect(stats.activeSessions).toBeLessThanOrEqual(stats.totalSessions)
    })

    it('should return unique project list', async () => {
      const stats = await getSessionListStats()
      expect(stats.projects.length).toBeGreaterThan(0)
      // Should be sorted
      const sorted = [...stats.projects].sort()
      expect(stats.projects).toEqual(sorted)
      // Should be unique
      expect(new Set(stats.projects).size).toBe(stats.projects.length)
    })
  })
})
