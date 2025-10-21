import type { Command, CommandOptions, CommandResult } from '../types';

export const login: Command = {
  name: 'login',
  description: 'Interactive login command demonstrating prompt usage',
  usage: 'login',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, prompt } = options;

    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    try {
      // Prompt for username
      const username = await prompt({
        message: 'Username:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Username cannot be empty';
          }
          if (input.length < 3) {
            return 'Username must be at least 3 characters';
          }
          return true;
        }
      });

      // Prompt for password (masked input)
      const password = await prompt({
        message: 'Password:',
        password: true,
        validate: (input) => {
          if (!input || input.length < 6) {
            return 'Password must be at least 6 characters';
          }
          return true;
        }
      });

      // Simulate login
      await stdout.write('\nAuthenticating...\n');
      
      // In a real app, you'd validate credentials
      // For demo, accept any valid inputs
      await stdout.write(`\nWelcome, ${username}!\n`);
      await stdout.write('Login successful.\n');

      return { exitCode: 0 };
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('\nLogin cancelled.\n');
        return { exitCode: 130 }; // Standard cancellation exit code
      }
      
      const message = error instanceof Error ? error.message : String(error);
      await stdout.write(`\nError: ${message}\n`);
      return { exitCode: 1 };
    }
  }
};

