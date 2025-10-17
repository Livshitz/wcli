import type { Command, CommandOptions, CommandResult } from '@/types';

export const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the terminal screen',
  usage: 'clear',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    // This will be handled by the terminal UI
    // We return a special marker that the UI will recognize
    return { exitCode: 0, output: '\x1b[2J\x1b[H' };
  },
};

