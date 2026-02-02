/**
 * Adapters Module
 * Exports all adapter-related interfaces, classes, and utilities
 */

// Base adapter interface and class
export type { HarnessAdapter } from './base'
export { BaseHarnessAdapter } from './base'

// Registry and factory utilities
export type { AdapterFactory } from './registry'
export { adapterRegistry, getAdapter, registerAdapter } from './registry'

// Harness-specific adapters
export { ClaudeCodeAdapter, createClaudeCodeAdapter } from './claude-code'
export { CursorAdapter, createCursorAdapter } from './cursor'

// Register all adapters
import { registerAdapter } from './registry'
import { createClaudeCodeAdapter } from './claude-code'
import { createCursorAdapter } from './cursor'

// Auto-register adapters
registerAdapter('claude-code', 'Claude Code', createClaudeCodeAdapter)
registerAdapter('cursor', 'Cursor', createCursorAdapter)
