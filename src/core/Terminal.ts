import type { IFilesystem, TerminalLine } from '@/types';
import { VirtualFilesystem } from './Filesystem';
import { CommandExecutor } from './CommandExecutor';
import { PluginLoader } from './PluginLoader';

export class Terminal {
  private fs: IFilesystem;
  private executor: CommandExecutor;
  private pluginLoader: PluginLoader;
  private lines: TerminalLine[] = [];
  private onOutputCallback?: (line: TerminalLine) => void;

  constructor() {
    this.fs = new VirtualFilesystem();
    this.executor = new CommandExecutor(this.fs);
    this.pluginLoader = new PluginLoader(this.executor, this.fs);
  }

  async initialize(): Promise<void> {
    // Load filesystem from IndexedDB
    await (this.fs as VirtualFilesystem).load();
    
    // Initialize default directory structure
    await (this.fs as VirtualFilesystem).initializeDefaultStructure();
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
    // Add input line
    this.addLine({
      type: 'input',
      content: input,
    });

    try {
      const result = await this.executor.execute(input);
      
      if (result.output) {
        this.addLine({
          type: 'output',
          content: result.output,
        });
      }
      
      if (result.error) {
        this.addLine({
          type: 'error',
          content: result.error,
        });
      }
    } catch (error) {
      this.addLine({
        type: 'error',
        content: error instanceof Error ? error.message : String(error),
      });
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
    const cwd = this.fs.getCwd();
    const user = this.executor.getEnv('USER') || 'user';
    return `${user}:${cwd}$ `;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

