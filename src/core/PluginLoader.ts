import type { Command, IFilesystem } from '@/types';
import { CommandExecutor } from './CommandExecutor';

export class PluginLoader {
  private executor: CommandExecutor;
  private fs: IFilesystem;

  constructor(executor: CommandExecutor, fs: IFilesystem) {
    this.executor = executor;
    this.fs = fs;
  }

  async loadFromPath(path: string): Promise<void> {
    try {
      const content = await this.fs.readFile(path);
      const command = await this.parseCommand(content);
      
      if (command) {
        this.executor.registerCommand(command);
      }
    } catch (error) {
      throw new Error(`Failed to load plugin from ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async loadFromDirectory(dirPath: string): Promise<void> {
    try {
      const files = await this.fs.readDir(dirPath);
      
      for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          const fullPath = `${dirPath}/${file}`;
          try {
            await this.loadFromPath(fullPath);
          } catch (error) {
            console.error(`Failed to load ${file}:`, error);
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to load plugins from directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async parseCommand(code: string): Promise<Command | null> {
    try {
      // Create a safe evaluation context
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const func = new AsyncFunction('exports', code + '\nreturn exports;');
      const exports: any = {};
      const result = await func(exports);
      
      // Validate command interface
      if (result && 
          typeof result.name === 'string' &&
          typeof result.description === 'string' &&
          typeof result.usage === 'string' &&
          typeof result.execute === 'function') {
        return result as Command;
      }
      
      return null;
    } catch (error) {
      throw new Error(`Failed to parse command: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async discoverCommands(searchPaths: string[]): Promise<string[]> {
    const discovered: string[] = [];
    
    for (const path of searchPaths) {
      try {
        if (await this.fs.isDirectory(path)) {
          const files = await this.fs.readDir(path);
          for (const file of files) {
            if (file.endsWith('.js') || file.endsWith('.ts')) {
              discovered.push(`${path}/${file}`);
            }
          }
        }
      } catch (error) {
        // Path doesn't exist or can't be read, skip
      }
    }
    
    return discovered;
  }
}

