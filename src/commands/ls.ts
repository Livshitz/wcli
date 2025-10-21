import type { Command, CommandOptions, CommandResult } from '../types';

export const lsCommand: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [options] [path]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout } = options;
    
    try {
      const path = args[0] || cwd;
      const resolvedPath = fs.resolvePath(path, cwd);
      
      // Check if path exists
      if (!(await fs.exists(resolvedPath))) {
        await stdout.write(`ls: cannot access '${path}': No such file or directory\n`);
        return { exitCode: 1 };
      }
      
      // Check if it's a directory
      if (!(await fs.isDirectory(resolvedPath))) {
        // If it's a file, just print the filename
        await stdout.write(args[0] || path + '\n');
        return { exitCode: 0 };
      }
      
      // List directory contents
      const entries = await fs.readDir(resolvedPath);
      
      if (entries.length === 0) {
        return { exitCode: 0 };
      }
      
      // Sort entries
      entries.sort();
      
      // Print entries
      for (const entry of entries) {
        await stdout.write(entry + '\n');
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`ls: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

