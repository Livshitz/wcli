import type { Command, CommandOptions, CommandResult } from '../types';

export const historyCommand: Command = {
  name: 'history',
  description: 'Display command history',
  usage: 'history',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout } = options;
    
    // History will be injected by the terminal UI
    const history = (options as any).history as string[] || [];
    
    try {
      if (history.length === 0) {
        await stdout.write('No history available\n');
        return { exitCode: 0 };
      }
      
      for (let i = 0; i < history.length; i++) {
        await stdout.write(`  ${(i + 1).toString().padStart(4)}  ${history[i]}\n`);
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`history: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

