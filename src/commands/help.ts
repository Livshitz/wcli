import type { Command, CommandOptions, CommandResult } from '@/types';

export const helpCommand: Command = {
  name: 'help',
  description: 'Display help information about commands',
  usage: 'help [command]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout } = options;
    
    // This will be populated by the executor
    const commands = (options as any).commands as Command[] || [];
    
    try {
      if (args.length === 0) {
        // List all commands
        await stdout.write('Available commands:\n\n');
        
        for (const cmd of commands) {
          await stdout.write(`  ${cmd.name.padEnd(12)} - ${cmd.description}\n`);
        }
        
        await stdout.write('\nUse "help <command>" for more information about a specific command.\n');
      } else {
        // Show help for specific command
        const cmdName = args[0];
        const cmd = commands.find(c => c.name === cmdName);
        
        if (!cmd) {
          await stdout.write(`help: no help topics match '${cmdName}'\n`);
          return { exitCode: 1 };
        }
        
        await stdout.write(`${cmd.name}: ${cmd.description}\n\n`);
        await stdout.write(`Usage: ${cmd.usage}\n`);
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`help: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};

