import { Terminal, type Command } from 'wcli';

// Define custom commands
const deployCommand: Command = {
  name: 'deploy',
  description: 'Deploy application to production',
  usage: 'deploy [--force]',
  async execute(args, options) {
    const force = options.flags?.force === true;
    
    await options.stdout.write('🚀 Starting deployment...\n');
    
    if (!force) {
      await options.stdout.write('⚠️  Use --force to confirm deployment\n');
      return { exitCode: 1 };
    }
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await options.stdout.write('✅ Deployment successful!\n');
    return { exitCode: 0 };
  },
};

const statusCommand: Command = {
  name: 'status',
  description: 'Check application status',
  usage: 'status',
  async execute(args, options) {
    await options.stdout.write('Status: Running\n');
    await options.stdout.write('Uptime: 42 days\n');
    await options.stdout.write('Memory: 512MB\n');
    return { exitCode: 0 };
  },
};

// Create terminal with custom commands and hooks
const terminal = new Terminal({
  commands: [deployCommand, statusCommand],
  includeDefaultCommands: true, // Keep built-in commands
  hooks: {
    beforeCommand: async (input) => {
      console.log(`Executing: ${input}`);
    },
    afterCommand: async (input, output) => {
      console.log(`Completed: ${input}`);
      // Send analytics, log to server, etc.
    },
    commandError: async (input, error) => {
      console.error(`Error in ${input}: ${error}`);
      // Send error reports
    },
  },
});

await terminal.initialize();

// Custom commands are now available!
// > deploy --force
// > status

