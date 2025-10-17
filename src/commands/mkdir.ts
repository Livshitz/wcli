import type { Command, CommandOptions, CommandResult } from '@/types';

export const mkdirCommand: Command = {
  name: 'mkdir',
  description: 'Create directories',
  usage: 'mkdir <directory...>',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout } = options;
    
    if (args.length === 0) {
      await stdout.write('mkdir: missing operand\n');
      return { exitCode: 1 };
    }
    
    try {
      for (const arg of args) {
        const resolvedPath = fs.resolvePath(arg, cwd);
        
        if (await fs.exists(resolvedPath)) {
          await stdout.write(`mkdir: cannot create directory '${arg}': File exists\n`);
          return { exitCode: 1 };
        }
        
        await fs.createDir(resolvedPath);
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`mkdir: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

