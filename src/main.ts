import { Terminal } from './core/Terminal';
import { TerminalUI } from './ui/TerminalUI';
import { registerBuiltInCommands } from './commands';
import './styles/terminal.css';

async function main() {
  // Create terminal instance
  const terminal = new Terminal();
  
  // Initialize filesystem and load persisted data
  await terminal.initialize();
  
  // Register built-in commands
  registerBuiltInCommands(terminal.getExecutor());
  
  // Inject commands list into help command options
  const helpCommand = terminal.getExecutor().getCommand('help');
  if (helpCommand) {
    const originalExecute = helpCommand.execute;
    helpCommand.execute = async (args, options) => {
      (options as any).commands = terminal.getExecutor().getAllCommands();
      return originalExecute.call(helpCommand, args, options);
    };
  }
  
  // Create UI
  const ui = new TerminalUI(terminal, '#terminal');
  
  // Render welcome message with intro animation
  await ui.renderWelcome();
  
  // Create some demo files
  await initializeDemoFiles(terminal);
  
  // Make terminal globally available for debugging
  (window as any).terminal = terminal;
  (window as any).ui = ui;
}

async function initializeDemoFiles(terminal: Terminal) {
  const fs = terminal.getFilesystem();
  
  // Create a demo JS command
  const demoCommand = `
// Demo command
exports.name = 'demo';
exports.description = 'A demo command loaded from filesystem';
exports.usage = 'demo [message]';

exports.execute = async function(args, options) {
  const message = args.join(' ') || 'Hello from demo command!';
  await options.stdout.write(message + '\\n');
  return { exitCode: 0 };
};
`.trim();
  
  try {
    await fs.writeFile('/bin/demo.js', demoCommand);
    
    // Create a README file
    const readme = `Welcome to WCLI - Web Command Line Interface!

This is a fully-featured web-based terminal simulator built with TypeScript and Vite.

FEATURES:
=========
✓ Virtual filesystem with IndexedDB persistence
✓ Command piping and redirection  
✓ Extensible plugin system (JS commands from filesystem)
✓ Tab autocomplete for commands and file paths
✓ Command history with arrow keys
✓ Native terminal keyboard shortcuts

KEYBOARD SHORTCUTS:
==================
Tab           - Autocomplete (press multiple times to cycle)
↑/↓           - Navigate command history
Ctrl+C        - Interrupt/cancel current input
Ctrl+L        - Clear screen
Ctrl+A        - Jump to beginning of line
Ctrl+E        - Jump to end of line
Ctrl+U        - Delete to beginning of line
Ctrl+K        - Delete to end of line
Ctrl+W        - Delete word backwards

EXAMPLE COMMANDS:
================
Basic:
  help                    - Show all available commands
  ls /bin                 - List command files
  cd /bin                 - Change directory
  pwd                     - Print working directory
  
Files:
  cat /bin/demo.js        - View the demo command source
  echo "test" > file.txt  - Create a file with redirection
  cat file.txt            - Read the file
  touch newfile.txt       - Create empty file
  mkdir projects          - Create directory
  
Advanced:
  ls | grep demo          - Use piping between commands
  find . -name "*.js"     - Find all JS files
  cat file.txt | wc -l    - Count lines in file
  exec /bin/demo.js Hi    - Execute a JS command
  history                 - View command history
  env                     - Show environment variables

Try tab completion - type "ca" and press Tab!

Enjoy exploring! 🚀
`;
    
    await fs.writeFile('/home/README.txt', readme);
    
    // Create a sample data file for demos
    const sampleData = `apple
banana
cherry
date
elderberry
fig
grape`;
    await fs.writeFile('/home/fruits.txt', sampleData);
    
  } catch (error) {
    console.error('Failed to create demo files:', error);
  }
}

// Start the application
main().catch(console.error);

