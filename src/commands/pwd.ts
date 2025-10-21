import type { Command, CommandOptions, CommandResult } from '../types';

export const pwdCommand: Command = {
  name: 'pwd',
  description: 'Print working directory',
  usage: 'pwd',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, stdout } = options;
    
    try {
      const cwd = fs.getCwd();
      await stdout.write(cwd + '\n');
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`pwd: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

