import type { Command, IFilesystem } from './index';
import type { IStorageAdapter } from '@/core/IStorageAdapter';
import type { ISessionManager } from '@/core/ISessionManager';
import type { IHistoryManager } from '@/core/IHistoryManager';
import type { Component } from 'vue';

/**
 * Main configuration interface for WCLI
 */
export interface WCLIConfig {
  /**
   * Custom filesystem implementation
   */
  filesystem?: IFilesystem;

  /**
   * Storage adapter for persistence (filesystem, sessions, history)
   */
  storageAdapter?: IStorageAdapter;

  /**
   * Custom commands to register
   */
  commands?: Command[];

  /**
   * Whether to include built-in commands (ls, cd, cat, etc.)
   * @default true
   */
  includeDefaultCommands?: boolean;

  /**
   * Custom session manager
   */
  sessionManager?: ISessionManager;

  /**
   * Custom history manager
   */
  historyManager?: IHistoryManager;

  /**
   * Component customization
   */
  components?: ComponentConfig;

  /**
   * Theme configuration
   */
  theme?: ThemeConfig;

  /**
   * Lifecycle hooks
   */
  hooks?: HookConfig;

  /**
   * Initial environment variables
   */
  env?: Record<string, string>;

  /**
   * Initial working directory
   * @default '/home'
   */
  initialPath?: string;

  /**
   * Auto-save session on changes
   * @default true
   */
  autoSaveSession?: boolean;
}

/**
 * Component customization configuration
 */
export interface ComponentConfig {
  /**
   * Custom intro component
   */
  intro?: Component;

  /**
   * Custom prompt function
   */
  prompt?: PromptFunction;
}

/**
 * Function to generate terminal prompt
 */
export type PromptFunction = (cwd: string, env: Record<string, string>) => string;

/**
 * Theme configuration
 */
export interface ThemeConfig {
  colors?: {
    background?: string;
    foreground?: string;
    prompt?: string;
    error?: string;
    success?: string;
    info?: string;
    warning?: string;
  };
  font?: {
    family?: string;
    size?: number;
    lineHeight?: number;
  };
}

/**
 * Lifecycle hooks configuration
 */
export interface HookConfig {
  /**
   * Called before terminal initialization
   */
  beforeInit?: () => void | Promise<void>;

  /**
   * Called after terminal initialization
   */
  afterInit?: () => void | Promise<void>;

  /**
   * Called before command execution
   */
  beforeCommand?: (input: string) => void | Promise<void>;

  /**
   * Called after successful command execution
   */
  afterCommand?: (input: string, output: string) => void | Promise<void>;

  /**
   * Called when command execution fails
   */
  commandError?: (input: string, error: string) => void | Promise<void>;

  /**
   * Called when filesystem changes
   */
  filesystemChange?: (operation: string, path: string) => void | Promise<void>;

  /**
   * Called when session is saved
   */
  sessionSave?: () => void | Promise<void>;

  /**
   * Called when session is loaded
   */
  sessionLoad?: () => void | Promise<void>;
}

