import type { Command, CommandOptions, CommandResult } from '@/types';

export const aliasCommand: Command = {
  name: 'alias',
  description: 'Define or display aliases',
  usage: 'alias [name[=value] ...]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, fs } = options;
    const aliasManager = (options as any).aliasManager;

    if (!aliasManager) {
      await stdout.write('Alias manager not available\n');
      return { exitCode: 1 };
    }

    // If no arguments, display all aliases
    if (args.length === 0) {
      const aliases: Map<string, string> = aliasManager.getAll();
      if (aliases.size === 0) {
        await stdout.write('No aliases defined\n');
      } else {
        const entries = Array.from(aliases.entries());
        const sorted = entries.sort((a, b) => a[0].localeCompare(b[0]));
        for (const [name, value] of sorted) {
          await stdout.write(`alias ${name}='${value}'\n`);
        }
      }
      return { exitCode: 0 };
    }

    // Process each argument
    for (const arg of args) {
      if (arg.includes('=')) {
        // Setting an alias
        const [name, ...valueParts] = arg.split('=');
        const value = valueParts.join('=').replace(/^['"]|['"]$/g, ''); // Remove quotes
        
        if (!name) {
          await stdout.write('alias: invalid alias name\n');
          return { exitCode: 1 };
        }

        aliasManager.set(name, value);
      } else {
        // Display specific alias
        const value = aliasManager.get(arg);
        if (value !== undefined) {
          await stdout.write(`alias ${arg}='${value}'\n`);
        } else {
          await stdout.write(`alias: ${arg}: not found\n`);
          return { exitCode: 1 };
        }
      }
    }

    return { exitCode: 0 };
  },
};

