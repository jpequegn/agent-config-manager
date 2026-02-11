/**
 * Tools Service
 * Manages tool registry and MCP server browsing with mock data
 */

import type {
  HarnessType,
  Tool,
  ToolSummary,
  ToolStatus,
  MCPServer,
  MCPServerSummary,
} from '@/types'

/** Tool aggregate statistics */
export interface ToolListStats {
  totalTools: number
  availableTools: number
  mcpTools: number
  builtInTools: number
  byHarness: { harness: HarnessType; count: number }[]
}

/** Filter options for tools list */
export interface ToolFilterOptions {
  harness?: HarnessType
  status?: ToolStatus
  searchText?: string
  mcpOnly?: boolean
}

/** Mock MCP servers */
const MOCK_MCP_SERVERS: MCPServer[] = [
  {
    id: 'mcp-filesystem',
    name: 'Filesystem',
    harness: 'claude-code',
    description: 'File system operations with safety checks',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/user'],
      transport: 'stdio',
    },
    status: 'connected',
    tools: [
      {
        id: 'tool-fs-read',
        name: 'read_file',
        harness: 'claude-code',
        description: 'Read file contents',
        status: 'available',
        callCount: 234,
        isMCP: true,
      },
      {
        id: 'tool-fs-write',
        name: 'write_file',
        harness: 'claude-code',
        description: 'Write content to file',
        status: 'available',
        callCount: 89,
        isMCP: true,
      },
      {
        id: 'tool-fs-list',
        name: 'list_directory',
        harness: 'claude-code',
        description: 'List directory contents',
        status: 'available',
        callCount: 156,
        isMCP: true,
      },
    ],
    lastConnectedAt: new Date(Date.now() - 60000),
    enabled: true,
  },
  {
    id: 'mcp-github',
    name: 'GitHub',
    harness: 'claude-code',
    description: 'GitHub API integration for issues, PRs, and repos',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      transport: 'stdio',
      env: { GITHUB_TOKEN: '***' },
    },
    status: 'connected',
    tools: [
      {
        id: 'tool-gh-issues',
        name: 'list_issues',
        harness: 'claude-code',
        description: 'List repository issues',
        status: 'available',
        callCount: 45,
        isMCP: true,
      },
      {
        id: 'tool-gh-pr',
        name: 'create_pull_request',
        harness: 'claude-code',
        description: 'Create a pull request',
        status: 'available',
        callCount: 12,
        isMCP: true,
      },
    ],
    lastConnectedAt: new Date(Date.now() - 120000),
    enabled: true,
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL',
    harness: 'cursor',
    description: 'PostgreSQL database queries and schema inspection',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      transport: 'stdio',
      env: { DATABASE_URL: '***' },
    },
    status: 'disconnected',
    tools: [
      {
        id: 'tool-pg-query',
        name: 'query',
        harness: 'cursor',
        description: 'Execute SQL query',
        status: 'disabled',
        callCount: 0,
        isMCP: true,
      },
    ],
    enabled: false,
    error: 'Connection refused: database server not running',
  },
  {
    id: 'mcp-brave',
    name: 'Brave Search',
    harness: 'claude-code',
    description: 'Web search via Brave Search API',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      transport: 'stdio',
      env: { BRAVE_API_KEY: '***' },
    },
    status: 'error',
    tools: [],
    enabled: true,
    error: 'Invalid API key',
  },
]

/** Mock tools data */
const MOCK_TOOLS: Tool[] = [
  // Built-in Claude Code tools
  {
    id: 'tool-cc-bash',
    name: 'Bash',
    harness: 'claude-code',
    description: 'Execute bash commands with optional timeout and background execution',
    parameters: [
      { name: 'command', type: 'string', description: 'The command to execute', required: true },
      {
        name: 'timeout',
        type: 'number',
        description: 'Optional timeout in milliseconds',
        required: false,
        defaultValue: 120000,
      },
      {
        name: 'run_in_background',
        type: 'boolean',
        description: 'Run command in background',
        required: false,
        defaultValue: false,
      },
    ],
    returnType: 'string',
    status: 'available',
    stats: {
      callCount: 523,
      successCount: 498,
      errorCount: 25,
      avgExecutionTime: 3200,
      lastUsed: new Date(Date.now() - 300000),
    },
    isBuiltIn: true,
    category: 'system',
    examples: [
      { title: 'List files', input: { command: 'ls -la' } },
      { title: 'Run tests', input: { command: 'npm test', timeout: 60000 } },
    ],
  },
  {
    id: 'tool-cc-read',
    name: 'Read',
    harness: 'claude-code',
    description: 'Read file contents with optional line offset and limit',
    parameters: [
      { name: 'file_path', type: 'string', description: 'Absolute path to file', required: true },
      {
        name: 'offset',
        type: 'number',
        description: 'Line number to start from',
        required: false,
      },
      { name: 'limit', type: 'number', description: 'Number of lines to read', required: false },
    ],
    returnType: 'string',
    status: 'available',
    stats: {
      callCount: 892,
      successCount: 880,
      errorCount: 12,
      avgExecutionTime: 150,
      lastUsed: new Date(Date.now() - 60000),
    },
    isBuiltIn: true,
    category: 'filesystem',
  },
  {
    id: 'tool-cc-edit',
    name: 'Edit',
    harness: 'claude-code',
    description: 'Perform exact string replacements in files',
    parameters: [
      { name: 'file_path', type: 'string', description: 'Absolute path to file', required: true },
      { name: 'old_string', type: 'string', description: 'Text to replace', required: true },
      { name: 'new_string', type: 'string', description: 'Replacement text', required: true },
      {
        name: 'replace_all',
        type: 'boolean',
        description: 'Replace all occurrences',
        required: false,
        defaultValue: false,
      },
    ],
    status: 'available',
    stats: {
      callCount: 345,
      successCount: 330,
      errorCount: 15,
      avgExecutionTime: 200,
      lastUsed: new Date(Date.now() - 180000),
    },
    isBuiltIn: true,
    category: 'filesystem',
  },
  {
    id: 'tool-cc-grep',
    name: 'Grep',
    harness: 'claude-code',
    description: 'Search file contents using regex patterns',
    parameters: [
      { name: 'pattern', type: 'string', description: 'Regex pattern to search', required: true },
      { name: 'path', type: 'string', description: 'Directory to search in', required: false },
      { name: 'glob', type: 'string', description: 'File glob filter', required: false },
    ],
    status: 'available',
    stats: {
      callCount: 267,
      successCount: 265,
      errorCount: 2,
      avgExecutionTime: 400,
      lastUsed: new Date(Date.now() - 600000),
    },
    isBuiltIn: true,
    category: 'search',
  },
  {
    id: 'tool-cc-web',
    name: 'WebSearch',
    harness: 'claude-code',
    description: 'Search the web and return results',
    parameters: [{ name: 'query', type: 'string', description: 'Search query', required: true }],
    status: 'available',
    stats: {
      callCount: 34,
      successCount: 32,
      errorCount: 2,
      avgExecutionTime: 2500,
      lastUsed: new Date(Date.now() - 86400000),
    },
    isBuiltIn: true,
    category: 'web',
  },
  // MCP tools (from filesystem server)
  {
    id: 'tool-fs-read',
    name: 'read_file',
    harness: 'claude-code',
    description: 'Read the complete contents of a file from the file system',
    parameters: [
      { name: 'path', type: 'string', description: 'Path to the file to read', required: true },
    ],
    returnType: 'string',
    status: 'available',
    stats: {
      callCount: 234,
      successCount: 230,
      errorCount: 4,
      avgExecutionTime: 100,
      lastUsed: new Date(Date.now() - 120000),
    },
    isBuiltIn: false,
    mcpServer: 'Filesystem',
    category: 'filesystem',
  },
  {
    id: 'tool-fs-write',
    name: 'write_file',
    harness: 'claude-code',
    description: 'Create a new file or overwrite an existing file with content',
    parameters: [
      { name: 'path', type: 'string', description: 'Path where to write the file', required: true },
      { name: 'content', type: 'string', description: 'Content to write', required: true },
    ],
    status: 'available',
    stats: {
      callCount: 89,
      successCount: 87,
      errorCount: 2,
      avgExecutionTime: 120,
      lastUsed: new Date(Date.now() - 300000),
    },
    isBuiltIn: false,
    mcpServer: 'Filesystem',
    category: 'filesystem',
  },
  // Cursor built-in tool
  {
    id: 'tool-cur-apply',
    name: 'apply_edit',
    harness: 'cursor',
    description: 'Apply a code edit to a file using AI-powered diff application',
    parameters: [
      { name: 'file', type: 'string', description: 'File path', required: true },
      { name: 'edit', type: 'string', description: 'Edit instructions', required: true },
    ],
    status: 'available',
    stats: {
      callCount: 178,
      successCount: 170,
      errorCount: 8,
      avgExecutionTime: 1800,
      lastUsed: new Date(Date.now() - 7200000),
    },
    isBuiltIn: true,
    category: 'filesystem',
  },
  // Deprecated tool
  {
    id: 'tool-cc-legacy',
    name: 'LegacySearch',
    harness: 'claude-code',
    description: 'Deprecated file search tool - use Grep instead',
    parameters: [{ name: 'query', type: 'string', description: 'Search query', required: true }],
    status: 'deprecated',
    stats: { callCount: 0, successCount: 0, errorCount: 0 },
    isBuiltIn: true,
    category: 'search',
  },
]

/**
 * List tools, optionally filtered.
 */
export async function listTools(options?: ToolFilterOptions): Promise<ToolSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  let filtered = MOCK_TOOLS

  if (options?.harness) {
    filtered = filtered.filter((t) => t.harness === options.harness)
  }
  if (options?.status) {
    filtered = filtered.filter((t) => t.status === options.status)
  }
  if (options?.mcpOnly) {
    filtered = filtered.filter((t) => !t.isBuiltIn)
  }
  if (options?.searchText) {
    const q = options.searchText.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    )
  }

  return filtered.map((t) => ({
    id: t.id,
    name: t.name,
    harness: t.harness,
    description: t.description,
    status: t.status,
    callCount: t.stats.callCount,
    isMCP: !t.isBuiltIn,
  }))
}

/**
 * Get full tool by ID.
 */
export async function getTool(id: string): Promise<Tool | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return MOCK_TOOLS.find((t) => t.id === id) ?? null
}

/**
 * List MCP servers.
 */
export async function listMCPServers(): Promise<MCPServerSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  return MOCK_MCP_SERVERS.map((s) => ({
    id: s.id,
    name: s.name,
    harness: s.harness,
    status: s.status,
    toolCount: s.tools.length,
    enabled: s.enabled,
  }))
}

/**
 * Get aggregate tool statistics.
 */
export async function getToolListStats(): Promise<ToolListStats> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const harnessMap = new Map<HarnessType, number>()
  for (const t of MOCK_TOOLS) {
    harnessMap.set(t.harness, (harnessMap.get(t.harness) ?? 0) + 1)
  }

  return {
    totalTools: MOCK_TOOLS.length,
    availableTools: MOCK_TOOLS.filter((t) => t.status === 'available').length,
    mcpTools: MOCK_TOOLS.filter((t) => !t.isBuiltIn).length,
    builtInTools: MOCK_TOOLS.filter((t) => t.isBuiltIn).length,
    byHarness: Array.from(harnessMap.entries()).map(([harness, count]) => ({
      harness,
      count,
    })),
  }
}
