import type { Command, CommandOptions, CommandResult } from '../types';

export const execCommand: Command = {
  name: 'exec',
  description: 'Execute a JavaScript file as a command',
  usage: 'exec <file> [args...]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout, stderr } = options;
    
    if (args.length === 0) {
      await stderr.write('exec: missing file operand\n');
      return { exitCode: 1 };
    }
    
    const file = args[0];
    const execArgs = args.slice(1);
    
    try {
      const filePath = fs.resolvePath(file, cwd);
      
      if (!(await fs.exists(filePath))) {
        await stderr.write(`exec: ${file}: No such file or directory\n`);
        return { exitCode: 1 };
      }
      
      if (!(await fs.isFile(filePath))) {
        await stderr.write(`exec: ${file}: Is a directory\n`);
        return { exitCode: 1 };
      }
      
      const content = await fs.readFile(filePath);
      
      // Try to evaluate and execute
      try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const func = new AsyncFunction('exports', 'require', content + '\nreturn exports;');
        const exports: any = {};
        const require = (name: string) => {
          throw new Error(`Module not found: ${name}`);
        };
        
        const module = await func(exports, require);
        
        if (module && typeof module.execute === 'function') {
          const result = await module.execute(execArgs, options);
          return result;
        } else {
          await stderr.write(`exec: ${file}: No execute function found\n`);
          return { exitCode: 1 };
        }
      } catch (error) {
        await stderr.write(`exec: ${file}: ${error instanceof Error ? error.message : String(error)}\n`);
        return { exitCode: 1 };
      }
    } catch (error) {
      await stderr.write(`exec: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

