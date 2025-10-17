import type { Command, CommandOptions, CommandResult } from '@/types';

export const unaliasCommand: Command = {
  name: 'unalias',
  description: 'Remove alias definitions',
  usage: 'unalias [-a] name [name ...]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, flags } = options;
    const aliasManager = (options as any).aliasManager;

    if (!aliasManager) {
      await stdout.write('Alias manager not available\n');
      return { exitCode: 1 };
    }

    // Handle -a flag (remove all aliases)
    if (flags?.a) {
      aliasManager.reset(); // Reset to defaults instead of clearing completely
      return { exitCode: 0 };
    }

    if (args.length === 0) {
      await stdout.write('unalias: usage: unalias [-a] name [name ...]\n');
      return { exitCode: 1 };
    }

    let hasError = false;
    for (const name of args) {
      if (!aliasManager.unset(name)) {
        await stdout.write(`unalias: ${name}: not found\n`);
        hasError = true;
      }
    }

    return { exitCode: hasError ? 1 : 0 };
  },
};

