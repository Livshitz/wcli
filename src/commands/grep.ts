import type { Command, CommandOptions, CommandResult } from '@/types';

export const grepCommand: Command = {
  name: 'grep',
  description: 'Search for patterns in text',
  usage: 'grep [pattern] [file...]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout, stdin } = options;
    
    if (args.length === 0) {
      await stdout.write('grep: missing pattern\n');
      return { exitCode: 1 };
    }
    
    const pattern = args[0];
    const files = args.slice(1);
    
    try {
      const regex = new RegExp(pattern);
      
      // If no files specified, read from stdin
      if (files.length === 0) {
        const input = await stdin.readAll();
        const lines = input.split('\n');
        
        for (const line of lines) {
          if (regex.test(line)) {
            await stdout.write(line + '\n');
          }
        }
        
        return { exitCode: 0 };
      }
      
      // Process each file
      for (const file of files) {
        const resolvedPath = fs.resolvePath(file, cwd);
        
        if (!(await fs.exists(resolvedPath))) {
          await stdout.write(`grep: ${file}: No such file or directory\n`);
          continue;
        }
        
        if (!(await fs.isFile(resolvedPath))) {
          await stdout.write(`grep: ${file}: Is a directory\n`);
          continue;
        }
        
        const content = await fs.readFile(resolvedPath);
        const lines = content.split('\n');
        
        for (const line of lines) {
          if (regex.test(line)) {
            if (files.length > 1) {
              await stdout.write(`${file}:${line}\n`);
            } else {
              await stdout.write(line + '\n');
            }
          }
        }
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`grep: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

