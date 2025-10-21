import type { Command, CommandOptions, CommandResult } from '../types';

export const echoCommand: Command = {
  name: 'echo',
  description: 'Display a line of text',
  usage: 'echo [string...]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout } = options;
    
    try {
      const text = args.join(' ');
      await stdout.write(text + '\n');
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`echo: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

