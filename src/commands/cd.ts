import type { Command, CommandOptions, CommandResult } from '../types';

export const cdCommand: Command = {
  name: 'cd',
  description: 'Change the current directory',
  usage: 'cd [directory]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout, env } = options;
    
    try {
      let targetPath: string;
      
      if (args.length === 0) {
        // No arguments, go to home
        targetPath = env.HOME || '/home';
      } else {
        targetPath = args[0];
      }
      
      const resolvedPath = fs.resolvePath(targetPath, cwd);
      
      // Check if path exists
      if (!(await fs.exists(resolvedPath))) {
        await stdout.write(`cd: ${targetPath}: No such file or directory\n`);
        return { exitCode: 1 };
      }
      
      // Check if it's a directory
      if (!(await fs.isDirectory(resolvedPath))) {
        await stdout.write(`cd: ${targetPath}: Not a directory\n`);
        return { exitCode: 1 };
      }
      
      // Change directory
      fs.setCwd(resolvedPath);
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`cd: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

