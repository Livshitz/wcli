/**
 * Example: Creating a Command with User Prompts
 * 
 * This example demonstrates how to create a command that uses
 * the prompt system to collect user input interactively.
 */

import { Terminal, type Command, type CommandOptions, type CommandResult } from '../../src/index';

// Example 1: Registration Form Command
const registerCommand: Command = {
  name: 'register',
  description: 'Register a new user account',
  usage: 'register',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, prompt } = options;

    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    try {
      await stdout.write('=== User Registration ===\n\n');

      // Get username with validation
      const username = await prompt({
        message: 'Username (3-20 characters):',
        validate: (input) => {
          if (input.length < 3) return 'Username too short';
          if (input.length > 20) return 'Username too long';
          if (!/^[a-zA-Z0-9_]+$/.test(input)) {
            return 'Username can only contain letters, numbers, and underscores';
          }
          return true;
        }
      });

      // Get email with validation
      const email = await prompt({
        message: 'Email address:',
        validate: (input) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) ? true : 'Please enter a valid email';
        }
      });

      // Get password (masked)
      const password = await prompt({
        message: 'Password (min 8 characters):',
        password: true,
        validate: (input) => {
          if (input.length < 8) {
            return 'Password must be at least 8 characters';
          }
          if (!/[A-Z]/.test(input)) {
            return 'Password must contain at least one uppercase letter';
          }
          if (!/[0-9]/.test(input)) {
            return 'Password must contain at least one number';
          }
          return true;
        }
      });

      // Confirm password
      const confirmPassword = await prompt({
        message: 'Confirm password:',
        password: true,
        validate: (input) => {
          return input === password ? true : 'Passwords do not match';
        }
      });

      // Optional fields
      const fullName = await prompt({
        message: 'Full name (optional):',
        defaultValue: ''
      });

      // Display registration summary
      await stdout.write('\n=== Registration Summary ===\n');
      await stdout.write(`Username: ${username}\n`);
      await stdout.write(`Email: ${email}\n`);
      await stdout.write(`Full Name: ${fullName || '(not provided)'}\n`);
      await stdout.write('\nRegistration successful!\n');

      return { exitCode: 0 };
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('\nRegistration cancelled.\n');
        return { exitCode: 130 };
      }
      throw error;
    }
  }
};

// Example 2: Interactive Calculator
const calcCommand: Command = {
  name: 'calc',
  description: 'Interactive calculator',
  usage: 'calc',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, prompt } = options;

    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    try {
      await stdout.write('=== Interactive Calculator ===\n');
      await stdout.write('Operations: + - * /\n\n');

      const num1 = await prompt({
        message: 'First number:',
        validate: (input) => {
          const num = parseFloat(input);
          return !isNaN(num) ? true : 'Please enter a valid number';
        }
      });

      const operator = await prompt({
        message: 'Operator (+, -, *, /):',
        validate: (input) => {
          return ['+', '-', '*', '/'].includes(input.trim()) 
            ? true 
            : 'Please enter a valid operator';
        }
      });

      const num2 = await prompt({
        message: 'Second number:',
        validate: (input) => {
          const num = parseFloat(input);
          if (isNaN(num)) return 'Please enter a valid number';
          if (operator.trim() === '/' && num === 0) {
            return 'Cannot divide by zero';
          }
          return true;
        }
      });

      // Calculate result
      const a = parseFloat(num1);
      const b = parseFloat(num2);
      const op = operator.trim();
      
      let result: number;
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = a / b; break;
        default: throw new Error('Invalid operator');
      }

      await stdout.write(`\nResult: ${a} ${op} ${b} = ${result}\n`);

      return { exitCode: 0 };
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('\nCalculation cancelled.\n');
        return { exitCode: 130 };
      }
      throw error;
    }
  }
};

// Example 3: Setup Wizard
const setupCommand: Command = {
  name: 'setup',
  description: 'Interactive setup wizard',
  usage: 'setup',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, prompt } = options;

    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    try {
      await stdout.write('=== Setup Wizard ===\n\n');

      // Step 1: Project name
      const projectName = await prompt({
        message: 'Project name:',
        defaultValue: 'my-project',
        validate: (input) => {
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Project name must be lowercase with hyphens';
          }
          return true;
        }
      });

      // Step 2: Language selection
      await stdout.write('\nLanguage options:\n');
      await stdout.write('  1. TypeScript\n');
      await stdout.write('  2. JavaScript\n');
      await stdout.write('  3. Python\n');
      
      const language = await prompt({
        message: 'Select language (1-3):',
        defaultValue: '1',
        validate: (input) => {
          return ['1', '2', '3'].includes(input) 
            ? true 
            : 'Please select 1, 2, or 3';
        }
      });

      const languages = { '1': 'TypeScript', '2': 'JavaScript', '3': 'Python' };
      const selectedLanguage = languages[language as keyof typeof languages];

      // Step 3: Git initialization
      const initGit = await prompt({
        message: 'Initialize git repository? (y/n):',
        defaultValue: 'y',
        validate: (input) => {
          const normalized = input.toLowerCase();
          return ['y', 'n', 'yes', 'no'].includes(normalized) 
            ? true 
            : 'Please answer y or n';
        }
      });

      const shouldInitGit = ['y', 'yes'].includes(initGit.toLowerCase());

      // Display configuration
      await stdout.write('\n=== Configuration ===\n');
      await stdout.write(`Project name: ${projectName}\n`);
      await stdout.write(`Language: ${selectedLanguage}\n`);
      await stdout.write(`Initialize git: ${shouldInitGit ? 'Yes' : 'No'}\n`);

      // Confirm
      const confirm = await prompt({
        message: '\nProceed with setup? (y/n):',
        defaultValue: 'y',
        validate: (input) => {
          const normalized = input.toLowerCase();
          return ['y', 'n', 'yes', 'no'].includes(normalized) 
            ? true 
            : 'Please answer y or n';
        }
      });

      if (['y', 'yes'].includes(confirm.toLowerCase())) {
        await stdout.write('\nSetup completed successfully!\n');
        return { exitCode: 0 };
      } else {
        await stdout.write('\nSetup cancelled.\n');
        return { exitCode: 1 };
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('\nSetup cancelled.\n');
        return { exitCode: 130 };
      }
      throw error;
    }
  }
};

// Initialize terminal and register commands
async function main() {
  const terminal = new Terminal({
    includeDefaultCommands: true,
    commands: [registerCommand, calcCommand, setupCommand],
  });

  await terminal.initialize();

  console.log('Terminal initialized with prompt examples!');
  console.log('Try these commands:');
  console.log('  - register: User registration form');
  console.log('  - calc: Interactive calculator');
  console.log('  - setup: Setup wizard');
  console.log('  - login: Built-in login example');
  console.log('  - survey: Built-in survey example');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { registerCommand, calcCommand, setupCommand };


