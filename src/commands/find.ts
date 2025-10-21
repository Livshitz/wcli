import type { Command, CommandOptions, CommandResult } from '../types';

// Helper function for recursive directory search
async function searchDirectory(
  basePath: string,
  currentPath: string,
  namePattern: RegExp | null,
  stdout: any,
  fs: any
): Promise<void> {
  // Get display path (relative to base)
  const displayPath = currentPath === basePath ? '.' : currentPath.slice(basePath.length + 1);
  
  if (!(await fs.isDirectory(currentPath))) {
    return;
  }
  
  // Check if current directory matches
  if (!namePattern || namePattern.test(displayPath.split('/').pop() || '')) {
    await stdout.write(displayPath + '\n');
  }
  
  // Search entries
  const entries = await fs.readDir(currentPath);
  
  for (const entry of entries) {
    const entryPath = currentPath === '/' ? `/${entry}` : `${currentPath}/${entry}`;
    const entryDisplayPath = displayPath === '.' ? entry : `${displayPath}/${entry}`;
    
    if (await fs.isDirectory(entryPath)) {
      await searchDirectory(basePath, entryPath, namePattern, stdout, fs);
    } else {
      // Check if file matches pattern
      if (!namePattern || namePattern.test(entry)) {
        await stdout.write(entryDisplayPath + '\n');
      }
    }
  }
}

export const findCommand: Command = {
  name: 'find',
  description: 'Search for files in directory hierarchy',
  usage: 'find [path] [-name pattern]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout, flags } = options;
    
    try {
      // Determine search path
      const searchPath = args[0] && !args[0].startsWith('-') ? args[0] : '.';
      const resolvedPath = fs.resolvePath(searchPath, cwd);
      
      if (!(await fs.exists(resolvedPath))) {
        await stdout.write(`find: ${searchPath}: No such file or directory\n`);
        return { exitCode: 1 };
      }
      
      // Get name pattern if specified
      let namePattern: RegExp | null = null;
      const nameIndex = args.indexOf('-name');
      if (nameIndex !== -1 && args[nameIndex + 1]) {
        const pattern = args[nameIndex + 1]
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        namePattern = new RegExp(`^${pattern}$`);
      }
      
      // Search recursively
      await searchDirectory(resolvedPath, resolvedPath, namePattern, stdout, fs);
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`find: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};
