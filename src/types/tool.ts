/**
 * Tool Types
 * Types for AI tools and MCP (Model Context Protocol) servers
 */

import type { HarnessType } from './harness'

/** Tool parameter type */
export type ToolParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object'

/** Tool status */
export type ToolStatus = 'available' | 'disabled' | 'error' | 'deprecated'

/** MCP server status */
export type MCPServerStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

/** MCP transport type */
export type MCPTransportType = 'stdio' | 'http' | 'websocket'

/** Tool parameter definition */
export interface ToolParameter {
  /** Parameter name */
  name: string
  /** Parameter type */
  type: ToolParameterType
  /** Description */
  description: string
  /** Whether required */
  required: boolean
  /** Default value */
  defaultValue?: unknown
  /** Enum values (for string type) */
  enum?: string[]
  /** Array item type (for array type) */
  items?: ToolParameterType
  /** Object properties (for object type) */
  properties?: Record<string, ToolParameter>
}

/** Tool usage statistics */
export interface ToolStats {
  /** Number of times called */
  callCount: number
  /** Number of successful calls */
  successCount: number
  /** Number of failed calls */
  errorCount: number
  /** Average execution time in ms */
  avgExecutionTime?: number
  /** Last used timestamp */
  lastUsed?: Date
}

/** Complete tool definition */
export interface Tool {
  /** Unique tool identifier */
  id: string
  /** Tool name */
  name: string
  /** Harness this tool belongs to */
  harness: HarnessType
  /** Tool description */
  description: string
  /** Input parameters schema */
  parameters: ToolParameter[]
  /** Return type description */
  returnType?: string
  /** Current status */
  status: ToolStatus
  /** Usage statistics */
  stats: ToolStats
  /** Whether this is a built-in tool */
  isBuiltIn: boolean
  /** MCP server providing this tool (if any) */
  mcpServer?: string
  /** Category for organization */
  category?: string
  /** Example usage */
  examples?: ToolExample[]
}

/** Tool usage example */
export interface ToolExample {
  /** Example title */
  title: string
  /** Input parameters */
  input: Record<string, unknown>
  /** Expected output description */
  output?: string
}

/** Tool summary for list views */
export interface ToolSummary {
  /** Unique identifier */
  id: string
  /** Tool name */
  name: string
  /** Harness */
  harness: HarnessType
  /** Brief description */
  description: string
  /** Status */
  status: ToolStatus
  /** Call count */
  callCount: number
  /** Whether from MCP */
  isMCP: boolean
}

/** MCP server configuration */
export interface MCPServerConfig {
  /** Server command to run */
  command: string
  /** Command arguments */
  args?: string[]
  /** Environment variables */
  env?: Record<string, string>
  /** Working directory */
  cwd?: string
  /** Transport type */
  transport: MCPTransportType
  /** HTTP/WebSocket URL (for non-stdio) */
  url?: string
  /** Connection timeout in ms */
  timeout?: number
}

/** MCP server definition */
export interface MCPServer {
  /** Unique server identifier */
  id: string
  /** Server name */
  name: string
  /** Harness this server is configured for */
  harness: HarnessType
  /** Server description */
  description?: string
  /** Server configuration */
  config: MCPServerConfig
  /** Current connection status */
  status: MCPServerStatus
  /** Tools provided by this server */
  tools: ToolSummary[]
  /** Resources provided by this server */
  resources?: MCPResource[]
  /** Prompts provided by this server */
  prompts?: MCPPrompt[]
  /** Last connection timestamp */
  lastConnectedAt?: Date
  /** Error message if status is 'error' */
  error?: string
  /** Whether server is enabled */
  enabled: boolean
}

/** MCP server summary for list views */
export interface MCPServerSummary {
  /** Unique identifier */
  id: string
  /** Server name */
  name: string
  /** Harness */
  harness: HarnessType
  /** Connection status */
  status: MCPServerStatus
  /** Number of tools */
  toolCount: number
  /** Whether enabled */
  enabled: boolean
}

/** MCP resource definition */
export interface MCPResource {
  /** Resource URI */
  uri: string
  /** Resource name */
  name: string
  /** Resource description */
  description?: string
  /** MIME type */
  mimeType?: string
}

/** MCP prompt definition */
export interface MCPPrompt {
  /** Prompt name */
  name: string
  /** Prompt description */
  description?: string
  /** Prompt arguments */
  arguments?: MCPPromptArgument[]
}

/** MCP prompt argument */
export interface MCPPromptArgument {
  /** Argument name */
  name: string
  /** Argument description */
  description?: string
  /** Whether required */
  required: boolean
}

/** Options for creating/updating MCP server */
export interface MCPServerOptions {
  /** Server name */
  name: string
  /** Description */
  description?: string
  /** Server configuration */
  config: MCPServerConfig
  /** Target harness */
  harness: HarnessType
  /** Whether to enable immediately */
  enabled?: boolean
}
