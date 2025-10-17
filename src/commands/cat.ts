import type { Command, CommandOptions, CommandResult } from '@/types';

export const catCommand: Command = {
  name: 'cat',
  description: 'Concatenate and display file contents',
  usage: 'cat [file...]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout, stdin } = options;
    
    try {
      // If no args, read from stdin
      if (args.length === 0) {
        const input = await stdin.readAll();
        if (input) {
          await stdout.write(input);
        }
        return { exitCode: 0 };
      }
      
      // Read and output each file
      for (const arg of args) {
        const resolvedPath = fs.resolvePath(arg, cwd);
        
        if (!(await fs.exists(resolvedPath))) {
          await stdout.write(`cat: ${arg}: No such file or directory\n`);
          return { exitCode: 1 };
        }
        
        if (!(await fs.isFile(resolvedPath))) {
          await stdout.write(`cat: ${arg}: Is a directory\n`);
          return { exitCode: 1 };
        }
        
        const content = await fs.readFile(resolvedPath);
        await stdout.write(content);
        
        // Add newline if content doesn't end with one
        if (!content.endsWith('\n')) {
          await stdout.write('\n');
        }
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`cat: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

