// Core classes
export { Terminal } from './core/Terminal';
export { VirtualFilesystem } from './core/Filesystem';
export { CommandExecutor } from './core/CommandExecutor';
export { CommandParser } from './core/CommandParser';
export { AliasManager } from './core/AliasManager';
export { PluginLoader } from './core/PluginLoader';
export { EventEmitter } from './core/EventEmitter';
export { DefaultSessionManager } from './core/DefaultSessionManager';
export { DefaultHistoryManager } from './core/DefaultHistoryManager';
export { PromptManager } from './core/PromptManager';
export type { PromptOptions, PromptRequest } from './core/PromptManager';

// Storage adapters
export * from './adapters';

// Types and interfaces
export * from './types';
export type { IStorageAdapter } from './core/IStorageAdapter';
export type { ISessionManager, Session } from './core/ISessionManager';
export type { IHistoryManager } from './core/IHistoryManager';

// Commands
export { builtInCommands, registerBuiltInCommands } from './commands';

// Configuration
export { defaultConfig, mergeConfig } from './config/defaults';

// Themes (exporting individually to avoid conflicts)
export { defaultTheme, darkTheme, lightTheme, draculaTheme, nordTheme } from './themes';
export type { Theme } from './themes';

// Utilities
export { PathResolver } from './utils/PathResolver';
export { applyTheme, getCurrentTheme } from './utils/ThemeApplier';
export { 
  StringInputStream, 
  StringOutputStream, 
  EmptyInputStream, 
  PipeStream 
} from './utils/Stream';

