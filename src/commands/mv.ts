import type { Command, CommandOptions, CommandResult } from '../types';

export const mvCommand: Command = {
  name: 'mv',
  description: 'Move or rename files',
  usage: 'mv <source> <destination>',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout } = options;
    
    if (args.length < 2) {
      await stdout.write('mv: missing source or destination operand\n');
      return { exitCode: 1 };
    }
    
    const source = args[0];
    const dest = args[1];
    
    try {
      const sourcePath = fs.resolvePath(source, cwd);
      const destPath = fs.resolvePath(dest, cwd);
      
      if (!(await fs.exists(sourcePath))) {
        await stdout.write(`mv: cannot stat '${source}': No such file or directory\n`);
        return { exitCode: 1 };
      }
      
      // Copy content
      if (await fs.isFile(sourcePath)) {
        const content = await fs.readFile(sourcePath);
        await fs.writeFile(destPath, content);
      } else {
        await stdout.write(`mv: cannot move directories (not implemented)\n`);
        return { exitCode: 1 };
      }
      
      // Delete source
      await fs.deleteFile(sourcePath);
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`mv: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

