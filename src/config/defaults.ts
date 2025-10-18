import type { WCLIConfig } from '@/types/config';

/**
 * Default configuration for WCLI
 */
export const defaultConfig: Partial<WCLIConfig> = {
  includeDefaultCommands: true,
  autoSaveSession: true,
  env: {
    HOME: '/home',
    PATH: '/bin',
    USER: 'user',
  },
  initialPath: '/home',
  hooks: {},
};

/**
 * Merge user config with defaults
 */
export function mergeConfig(userConfig?: WCLIConfig): WCLIConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    env: {
      ...defaultConfig.env,
      ...userConfig?.env,
    },
    hooks: {
      ...defaultConfig.hooks,
      ...userConfig?.hooks,
    },
  } as WCLIConfig;
}

