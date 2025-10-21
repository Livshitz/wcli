import type { Command, CommandOptions, CommandResult } from '../types';

export const survey: Command = {
  name: 'survey',
  description: 'Interactive survey demonstrating multiple prompts',
  usage: 'survey',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, prompt } = options;

    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    try {
      await stdout.write('Welcome to the WCLI User Survey!\n');
      await stdout.write('Please answer the following questions:\n\n');

      // Question 1
      const name = await prompt({
        message: 'What is your name?',
        defaultValue: 'Anonymous',
      });

      // Question 2
      const experience = await prompt({
        message: 'How would you rate your terminal experience? (1-10)',
        validate: (input) => {
          const num = parseInt(input, 10);
          if (isNaN(num) || num < 1 || num > 10) {
            return 'Please enter a number between 1 and 10';
          }
          return true;
        }
      });

      // Question 3
      const favorite = await prompt({
        message: 'What is your favorite terminal command?',
      });

      // Question 4
      const feedback = await prompt({
        message: 'Any feedback or suggestions?',
        defaultValue: 'None',
      });

      // Display results
      await stdout.write('\n--- Survey Results ---\n');
      await stdout.write(`Name: ${name}\n`);
      await stdout.write(`Experience Level: ${experience}/10\n`);
      await stdout.write(`Favorite Command: ${favorite}\n`);
      await stdout.write(`Feedback: ${feedback}\n`);
      await stdout.write('\nThank you for completing the survey!\n');

      return { exitCode: 0 };
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('\nSurvey cancelled.\n');
        return { exitCode: 130 };
      }
      
      const message = error instanceof Error ? error.message : String(error);
      await stdout.write(`\nError: ${message}\n`);
      return { exitCode: 1 };
    }
  }
};

