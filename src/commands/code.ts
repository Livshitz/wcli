import type { Command, CommandOptions, CommandResult } from '@/types';

export const codeCommand: Command = {
  name: 'code',
  description: 'Open a file in the code editor',
  usage: 'code <filename>',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout, stderr } = options;
    
    try {
      if (args.length === 0) {
        await stderr.write('code: missing filename\n');
        await stderr.write(`Usage: ${this.usage}\n`);
        return { exitCode: 1 };
      }
      
      const filename = args[0];
      const resolvedPath = fs.resolvePath(filename, cwd);
      
      // Check if it's a directory
      if (await fs.exists(resolvedPath)) {
        if (await fs.isDirectory(resolvedPath)) {
          await stderr.write(`code: ${filename}: Is a directory\n`);
          return { exitCode: 1 };
        }
      }
      
      // Read file content if it exists, otherwise start with empty content
      let content = '';
      if (await fs.exists(resolvedPath)) {
        const metadata = await fs.stat(resolvedPath);
        
        // File size limit: 1MB
        const MAX_FILE_SIZE = 1024 * 1024;
        if (metadata.size > MAX_FILE_SIZE) {
          await stderr.write(`code: ${filename}: File too large (${Math.round(metadata.size / 1024)}KB). Maximum size is ${MAX_FILE_SIZE / 1024}KB\n`);
          return { exitCode: 1 };
        }
        
        content = await fs.readFile(resolvedPath);
      }
      
      // Output component data for the terminal to render
      // Note: Don't pass fs as prop - it will be accessed from global terminal
      const componentData = {
        __type: 'vue-component',
        name: 'CodeEditor',
        props: {
          filename: resolvedPath,
          content,
        },
        source: 'local',
      };
      
      await stdout.write(JSON.stringify(componentData) + '\n');
      
      return { exitCode: 0 };
    } catch (error) {
      await stderr.write(`code: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

