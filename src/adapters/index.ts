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

// Register all adapters
import { registerAdapter } from './registry'
import { createClaudeCodeAdapter } from './claude-code'

// Auto-register Claude Code adapter
registerAdapter('claude-code', 'Claude Code', createClaudeCodeAdapter)
