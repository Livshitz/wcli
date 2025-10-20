import type { IFilesystem, TerminalLine, WCLIConfig } from '@/types';
import type { ISessionManager } from './ISessionManager';
import type { IHistoryManager } from './IHistoryManager';
import type { IStorageAdapter } from './IStorageAdapter';
import { VirtualFilesystem } from './Filesystem';
import { CommandExecutor } from './CommandExecutor';
import { PluginLoader } from './PluginLoader';
import { EventEmitter } from './EventEmitter';
import { DefaultSessionManager } from './DefaultSessionManager';
import { DefaultHistoryManager } from './DefaultHistoryManager';
import { IndexedDBAdapter } from '@/adapters/IndexedDBAdapter';
import { mergeConfig } from '@/config/defaults';
import { registerBuiltInCommands } from '@/commands';
import { PromptManager } from './PromptManager';
import type { PromptRequest } from './PromptManager';

export class Terminal {
  private fs: IFilesystem;
  private executor: CommandExecutor;
  private pluginLoader: PluginLoader;
  private lines: TerminalLine[] = [];
  private onOutputCallback?: (line: TerminalLine) => void;
  private config: WCLIConfig;
  private hooks: EventEmitter;
  private sessionManager?: ISessionManager;
  private historyManager?: IHistoryManager;
  private storageAdapter: IStorageAdapter;
  private promptManager: PromptManager;

  constructor(config?: WCLIConfig) {
    this.config = mergeConfig(config);
    this.hooks = new EventEmitter();
    this.promptManager = new PromptManager();

    // Initialize storage adapter (shared across filesystem, session, history)
    this.storageAdapter = this.config.storageAdapter || new IndexedDBAdapter();

    // Initialize filesystem
    if (this.config.filesystem) {
      this.fs = this.config.filesystem;
    } else {
      this.fs = new VirtualFilesystem(this.storageAdapter);
    }

    // Initialize executor
    this.executor = new CommandExecutor(this.fs);
    
    // Set prompt manager for executor
    this.executor.setPromptManager(this.promptManager);
    
    // Set initial environment variables
    if (this.config.env) {
      for (const [key, value] of Object.entries(this.config.env)) {
        this.executor.setEnv(key, value);
      }
    }

    // Register commands
    if (this.config.includeDefaultCommands) {
      registerBuiltInCommands(this.executor);
    }
    if (this.config.commands) {
      for (const command of this.config.commands) {
        this.executor.registerCommand(command);
      }
    }

    // Initialize plugin loader
    this.pluginLoader = new PluginLoader(this.executor, this.fs);

    // Initialize session manager
    if (this.config.sessionManager) {
      this.sessionManager = this.config.sessionManager;
    } else {
      this.sessionManager = new DefaultSessionManager(this.storageAdapter);
    }

    // Initialize history manager
    if (this.config.historyManager) {
      this.historyManager = this.config.historyManager;
    } else {
      this.historyManager = new DefaultHistoryManager(this.storageAdapter);
    }

    // Register lifecycle hooks
    if (this.config.hooks) {
      if (this.config.hooks.beforeInit) {
        this.hooks.on('beforeInit', this.config.hooks.beforeInit);
      }
      if (this.config.hooks.afterInit) {
        this.hooks.on('afterInit', this.config.hooks.afterInit);
      }
      if (this.config.hooks.beforeCommand) {
        this.hooks.on('beforeCommand', this.config.hooks.beforeCommand);
      }
      if (this.config.hooks.afterCommand) {
        this.hooks.on('afterCommand', this.config.hooks.afterCommand);
      }
      if (this.config.hooks.commandError) {
        this.hooks.on('commandError', this.config.hooks.commandError);
      }
      if (this.config.hooks.filesystemChange) {
        this.hooks.on('filesystemChange', this.config.hooks.filesystemChange);
      }
      if (this.config.hooks.sessionSave) {
        this.hooks.on('sessionSave', this.config.hooks.sessionSave);
      }
      if (this.config.hooks.sessionLoad) {
        this.hooks.on('sessionLoad', this.config.hooks.sessionLoad);
      }
    }
  }

  async initialize(): Promise<void> {
    await this.hooks.emit('beforeInit');

    // Load filesystem from storage
    await (this.fs as VirtualFilesystem).load();
    
    // Initialize default directory structure
    await (this.fs as VirtualFilesystem).initializeDefaultStructure();

    // Set initial path if configured
    if (this.config.initialPath) {
      this.fs.setCwd(this.config.initialPath);
    }

    // Load history
    if (this.historyManager) {
      await this.historyManager.load();
    }

    // Load session if available
    // Note: Session loading is optional and can override filesystem state
    // We load history above separately because it's less intrusive

    await this.hooks.emit('afterInit');
  }

  getFilesystem(): IFilesystem {
    return this.fs;
  }

  getExecutor(): CommandExecutor {
    return this.executor;
  }

  getPluginLoader(): PluginLoader {
    return this.pluginLoader;
  }

  async executeCommand(input: string): Promise<void> {
    // Add to history
    if (this.historyManager && input.trim()) {
      this.historyManager.add(input);
      // Persist history after adding
      await this.historyManager.persist();
    }

    // Add input line
    this.addLine({
      type: 'input',
      content: input,
    });

    try {
      // Emit beforeCommand hook
      await this.hooks.emit('beforeCommand', input);

      const result = await this.executor.execute(input);
      
      if (result.output) {
        // Check if output is a Vue component marker
        const trimmedOutput = result.output.trim();
        try {
          const parsed = JSON.parse(trimmedOutput);
          if (parsed.__type === 'vue-component') {
            this.addLine({
              type: 'component',
              content: '',
              component: {
                name: parsed.name,
                props: parsed.props || {},
                source: parsed.source || 'local',
                url: parsed.url,
              },
            });
          } else {
            this.addLine({
              type: 'output',
              content: result.output,
            });
          }
        } catch {
          // Not JSON, treat as regular output
          this.addLine({
            type: 'output',
            content: result.output,
          });
        }
      }
      
      if (result.error) {
        this.addLine({
          type: 'error',
          content: result.error,
        });
        // Emit commandError hook
        await this.hooks.emit('commandError', input, result.error);
      } else {
        // Emit afterCommand hook on success
        await this.hooks.emit('afterCommand', input, result.output || '');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.addLine({
        type: 'error',
        content: errorMessage,
      });
      // Emit commandError hook
      await this.hooks.emit('commandError', input, errorMessage);
    }
  }

  private addLine(line: Omit<TerminalLine, 'id' | 'timestamp'>): void {
    const fullLine: TerminalLine = {
      id: this.generateId(),
      timestamp: new Date(),
      ...line,
    };
    
    this.lines.push(fullLine);
    
    if (this.onOutputCallback) {
      this.onOutputCallback(fullLine);
    }
  }

  getLines(): TerminalLine[] {
    return this.lines;
  }

  clearLines(): void {
    this.lines = [];
  }

  onOutput(callback: (line: TerminalLine) => void): void {
    this.onOutputCallback = callback;
  }

  getPrompt(): string {
    // Use custom prompt function if configured
    if (this.config.components?.prompt) {
      const cwd = this.fs.getCwd();
      const env = {
        USER: this.executor.getEnv('USER') || 'user',
        HOME: this.executor.getEnv('HOME') || '/home',
        PATH: this.executor.getEnv('PATH') || '/bin',
      };
      return this.config.components.prompt(cwd, env);
    }

    // Default prompt
    const cwd = this.fs.getCwd();
    const user = this.executor.getEnv('USER') || 'user';
    return `${user}:${cwd}$ `;
  }

  /**
   * Register a lifecycle hook
   */
  on(event: string, listener: (...args: any[]) => void | Promise<void>): void {
    this.hooks.on(event, listener);
  }

  /**
   * Unregister a lifecycle hook
   */
  off(event: string, listener: (...args: any[]) => void | Promise<void>): void {
    this.hooks.off(event, listener);
  }

  /**
   * Get the current configuration
   */
  getConfig(): WCLIConfig {
    return this.config;
  }

  /**
   * Get the history manager
   */
  getHistoryManager(): IHistoryManager | undefined {
    return this.historyManager;
  }

  /**
   * Get the prompt manager
   */
  getPromptManager(): PromptManager {
    return this.promptManager;
  }

  /**
   * Save the current session
   */
  async saveSession(): Promise<void> {
    if (!this.sessionManager) {
      console.warn('No session manager configured');
      return;
    }

    try {
      const aliasMap = this.executor.getAliasManager().getAll();
      const aliasesRecord: Record<string, string> = {};
      for (const [key, value] of aliasMap.entries()) {
        aliasesRecord[key] = value;
      }

      const session = {
        filesystem: (this.fs as any).root, // This is a simplification
        history: this.historyManager?.getAll() || [],
        env: {
          USER: this.executor.getEnv('USER') || 'user',
          HOME: this.executor.getEnv('HOME') || '/home',
          PATH: this.executor.getEnv('PATH') || '/bin',
        },
        cwd: this.fs.getCwd(),
        aliases: aliasesRecord,
      };

      await this.sessionManager.saveSession(session);
      await this.hooks.emit('sessionSave');
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  /**
   * Load a saved session
   */
  async loadSession(): Promise<boolean> {
    if (!this.sessionManager) {
      console.warn('No session manager configured');
      return false;
    }

    try {
      const session = await this.sessionManager.loadSession();
      if (!session) {
        return false;
      }

      // Restore environment
      if (session.env) {
        for (const [key, value] of Object.entries(session.env)) {
          this.executor.setEnv(key, value);
        }
      }

      // Restore cwd
      if (session.cwd) {
        this.fs.setCwd(session.cwd);
      }

      // Restore aliases
      if (session.aliases) {
        const aliasManager = this.executor.getAliasManager();
        for (const [name, command] of Object.entries(session.aliases)) {
          aliasManager.setAlias(name, command);
        }
      }

      await this.hooks.emit('sessionLoad');
      return true;
    } catch (error) {
      console.error('Failed to load session:', error);
      return false;
    }
  }

  /**
   * Clear the saved session
   */
  async clearSession(): Promise<void> {
    if (!this.sessionManager) {
      console.warn('No session manager configured');
      return;
    }

    await this.sessionManager.clearSession();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}



