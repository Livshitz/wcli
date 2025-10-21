import type { Command, CommandOptions, CommandResult } from '../types';

export const ask: Command = {
  name: 'ask',
  description: 'Ask a simple question and get user input',
  usage: 'ask <question>',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, prompt } = options;

    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    if (args.length === 0) {
      await stdout.write('Usage: ask <question>\n');
      await stdout.write('Example: ask "What is your favorite color?"\n');
      return { exitCode: 1 };
    }

    const question = args.join(' ');

    try {
      const answer = await prompt({
        message: question,
      });

      await stdout.write(`\nYou answered: ${answer}\n`);
      return { exitCode: 0 };
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('\nQuestion cancelled.\n');
        return { exitCode: 130 };
      }
      
      const message = error instanceof Error ? error.message : String(error);
      await stdout.write(`\nError: ${message}\n`);
      return { exitCode: 1 };
    }
  }
};

