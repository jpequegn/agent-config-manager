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
export { CopilotAdapter, createCopilotAdapter } from './copilot'
export { ClineAdapter, createClineAdapter } from './cline'
export { ContinueAdapter, createContinueAdapter } from './continue'
export { AiderAdapter, createAiderAdapter } from './aider'

// Register all adapters
import { registerAdapter } from './registry'
import { createClaudeCodeAdapter } from './claude-code'
import { createCursorAdapter } from './cursor'
import { createCopilotAdapter } from './copilot'
import { createClineAdapter } from './cline'
import { createContinueAdapter } from './continue'
import { createAiderAdapter } from './aider'

// Auto-register adapters
registerAdapter('claude-code', 'Claude Code', createClaudeCodeAdapter)
registerAdapter('cursor', 'Cursor', createCursorAdapter)
registerAdapter('copilot', 'GitHub Copilot', createCopilotAdapter)
registerAdapter('cline', 'Cline', createClineAdapter)
registerAdapter('continue', 'Continue', createContinueAdapter)
registerAdapter('aider', 'Aider', createAiderAdapter)
