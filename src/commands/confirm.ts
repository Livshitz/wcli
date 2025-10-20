import type { Command, CommandOptions, CommandResult } from '@/types';

export const confirm: Command = {
  name: 'confirm',
  description: 'Ask for user confirmation with yes/no prompt',
  usage: 'confirm <message>',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, prompt } = options;

    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    if (args.length === 0) {
      await stdout.write('Usage: confirm <message>\n');
      await stdout.write('Example: confirm "Do you want to continue?"\n');
      return { exitCode: 1 };
    }

    const message = args.join(' ');

    try {
      const answer = await prompt({
        message: `${message} (Y/n)`,
        defaultValue: 'y',
        validate: (input) => {
          const normalized = input.toLowerCase().trim();
          if (normalized !== 'y' && normalized !== 'n' && 
              normalized !== 'yes' && normalized !== 'no' && normalized !== '') {
            return 'Please answer with y/n or yes/no';
          }
          return true;
        }
      });

      const normalized = answer.toLowerCase().trim();
      const confirmed = normalized === 'y' || normalized === 'yes';

      if (confirmed) {
        await stdout.write('Confirmed!\n');
        return { exitCode: 0 };
      } else {
        await stdout.write('Cancelled.\n');
        return { exitCode: 1 };
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('\nCancelled.\n');
        return { exitCode: 130 };
      }
      
      const message = error instanceof Error ? error.message : String(error);
      await stdout.write(`\nError: ${message}\n`);
      return { exitCode: 1 };
    }
  }
};

