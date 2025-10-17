import type { Command, CommandOptions, CommandResult } from '@/types';

export const cpCommand: Command = {
  name: 'cp',
  description: 'Copy files or directories',
  usage: 'cp <source> <destination>',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout } = options;
    
    if (args.length < 2) {
      await stdout.write('cp: missing source or destination operand\n');
      return { exitCode: 1 };
    }
    
    const source = args[0];
    const dest = args[1];
    
    try {
      const sourcePath = fs.resolvePath(source, cwd);
      const destPath = fs.resolvePath(dest, cwd);
      
      if (!(await fs.exists(sourcePath))) {
        await stdout.write(`cp: cannot stat '${source}': No such file or directory\n`);
        return { exitCode: 1 };
      }
      
      if (await fs.isDirectory(sourcePath)) {
        await stdout.write(`cp: -r not specified; omitting directory '${source}'\n`);
        return { exitCode: 1 };
      }
      
      // Copy file content
      const content = await fs.readFile(sourcePath);
      await fs.writeFile(destPath, content);
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`cp: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

