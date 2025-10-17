import type { Command, CommandOptions, CommandResult } from '@/types';

export const rmCommand: Command = {
  name: 'rm',
  description: 'Remove files or directories',
  usage: 'rm [-r] <file...>',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout, flags } = options;
    
    if (args.length === 0) {
      await stdout.write('rm: missing operand\n');
      return { exitCode: 1 };
    }
    
    const recursive = flags?.r || flags?.recursive;
    
    try {
      for (const arg of args) {
        const resolvedPath = fs.resolvePath(arg, cwd);
        
        if (!(await fs.exists(resolvedPath))) {
          await stdout.write(`rm: cannot remove '${arg}': No such file or directory\n`);
          return { exitCode: 1 };
        }
        
        if ((await fs.isDirectory(resolvedPath)) && !recursive) {
          await stdout.write(`rm: cannot remove '${arg}': Is a directory (use -r for recursive)\n`);
          return { exitCode: 1 };
        }
        
        await fs.deleteFile(resolvedPath);
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`rm: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

