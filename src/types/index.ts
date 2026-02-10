/**
 * Type Definitions Index
 * Central export point for all TypeScript types
 */

// Harness types
export type {
  HarnessType,
  HarnessStatus,
  DetectionResult,
  HarnessConfigPaths,
  HarnessStats,
  HarnessConfig,
  HarnessInfo,
} from './harness'

// Skill types
export type {
  SkillCategory,
  SkillStatus,
  SkillTrigger,
  SkillMetadata,
  SkillStats,
  SkillHistoryEntry,
  Skill,
  SkillSummary,
  CreateSkillOptions,
} from './skill'

// Hook types
export type {
  HookTrigger,
  HookResult,
  HookStatus,
  HookLogEntry,
  HookStats,
  HookConfig,
  Hook,
  HookSummary,
  HookTemplate,
  CreateHookOptions,
} from './hook'

// Session types
export type {
  MessageRole,
  ToolCallStatus,
  FileChangeType,
  FileChange,
  ToolCall,
  Message,
  SessionMetadata,
  SessionStats,
  Session,
  SessionSummary,
  SessionFilterOptions,
} from './session'

// Memory types
export type {
  MemoryType,
  LearningCategory,
  StorageLocation,
  MemoryEntryMetadata,
  MemoryEntry,
  MemoryEntrySummary,
  StorageInfo,
  MemoryUsageByType,
  MemoryUsageByHarness,
  MemoryStats,
  ProjectContext,
  ProjectContextFile,
  MemoryPruneOptions,
  MemoryPruneResult,
} from './memory'

// Settings types
export type {
  SettingValueType,
  SettingCategory,
  SettingScope,
  SettingValue,
  SettingOption,
  SettingDefinition,
  Setting,
  HarnessSettings,
  AppSettings,
  WindowBounds,
  SettingsExport,
  SettingsValidationResult,
} from './settings'

// Tool types
export type {
  ToolParameterType,
  ToolStatus,
  MCPServerStatus,
  MCPTransportType,
  ToolParameter,
  ToolStats,
  Tool,
  ToolExample,
  ToolSummary,
  MCPServerConfig,
  MCPServer,
  MCPServerSummary,
  MCPResource,
  MCPPrompt,
  MCPPromptArgument,
  MCPServerOptions,
} from './tool'
