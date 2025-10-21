import type { Command, CommandOptions, CommandResult } from '../types';

export const envCommand: Command = {
  name: 'env',
  description: 'Display or set environment variables',
  usage: 'env [KEY=VALUE...]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, env } = options;
    
    try {
      // If no arguments, display all environment variables
      if (args.length === 0) {
        const entries = Object.entries(env).sort(([a], [b]) => a.localeCompare(b));
        
        for (const [key, value] of entries) {
          await stdout.write(`${key}=${value}\n`);
        }
        
        return { exitCode: 0 };
      }
      
      // Set environment variables (note: this won't persist across commands in current impl)
      for (const arg of args) {
        if (arg.includes('=')) {
          const [key, ...valueParts] = arg.split('=');
          const value = valueParts.join('=');
          env[key] = value;
          await stdout.write(`Set ${key}=${value}\n`);
        } else {
          // Display specific variable
          const value = env[arg];
          if (value !== undefined) {
            await stdout.write(`${arg}=${value}\n`);
          } else {
            await stdout.write(`env: ${arg}: not found\n`);
          }
        }
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`env: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

