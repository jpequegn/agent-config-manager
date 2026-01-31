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
