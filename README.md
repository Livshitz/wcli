# WCLI - Web Command Line Interface

A fully-featured, extensible terminal framework for the web. Build powerful terminal-based applications with Vue 3, TypeScript, and complete customization.

[![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen)]() [![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D)]() [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]() [![License](https://img.shields.io/badge/license-MIT-blue)]()

**Version 2.0** - Now a proper extensible library! 🎉

## ✨ Features

### Core Features
- 🖥️ **Custom Terminal UI** - No external terminal libraries, built from scratch
- 💾 **Virtual Filesystem** - Persistent storage with pluggable backends
- 🔗 **Command Piping** - Real stream-based I/O (`ls | grep test`)
- 📝 **File Redirection** - Output to files (`echo "text" > file.txt`)
- ⌨️ **Native Shortcuts** - All standard terminal keyboard shortcuts
- 🔍 **Smart Autocomplete** - Tab completion for commands and file paths
- 🔌 **Extensible** - Load JavaScript files as executable commands
- 📜 **Command History** - Navigate with arrow keys
- 🔤 **Command Aliases** - Create shortcuts for commands
- 💬 **Interactive Prompts** - Collect user input with validation and masking

### v2.0 Library Features
- 🔧 **Configuration-Based** - Simple, powerful configuration object
- 💿 **Storage Adapters** - IndexedDB, LocalStorage, Memory, or custom
- 🎯 **Lifecycle Hooks** - Hook into command execution, filesystem changes
- 🎨 **Theme System** - Built-in themes or custom CSS variables
- 📦 **NPM Package** - Import as a library in any Vue 3 project
- 🧩 **Composable Components** - Use full terminal or individual components
- 💼 **Session Management** - Save/load terminal state
- 📊 **History API** - Programmatic access to command history
- 🔐 **Multi-User Ready** - Per-user storage and sessions

## 📦 Installation

```bash
npm install wcli
# or
yarn add wcli
# or
pnpm add wcli
```

## 🚀 Quick Start

### As a Library

```vue
<script setup>
import { TerminalComponent } from 'wcli/components';
</script>

<template>
  <TerminalComponent />
</template>
```

That's it! You now have a fully functional terminal.

### With Custom Configuration

```typescript
import { Terminal } from 'wcli';
import type { Command } from 'wcli';

// Define custom command
const myCommand: Command = {
  name: 'hello',
  description: 'Say hello',
  usage: 'hello [name]',
  async execute(args, options) {
    const name = args[0] || 'World';
    await options.stdout.write(`Hello, ${name}!\n`);
    return { exitCode: 0 };
  },
};

// Create terminal with config
const terminal = new Terminal({
  commands: [myCommand],
  includeDefaultCommands: true,
  hooks: {
    afterCommand: (input, output) => {
      console.log('Command executed:', input);
    },
  },
  env: {
    USER: 'alice',
    HOME: '/home/alice',
  },
});

await terminal.initialize();
```

### Standalone Development

```bash
# Clone the repository
git clone https://github.com/yourusername/wcli.git
cd wcli

# Install dependencies
bun install  # or npm install

# Start development server
bun run dev  # or npm run dev
```

The terminal will open at `http://localhost:3000`

## 🎯 Library API

### Terminal Configuration

```typescript
interface WCLIConfig {
  // Storage
  storageAdapter?: IStorageAdapter;         // Custom storage backend
  
  // Commands
  commands?: Command[];                     // Custom commands
  includeDefaultCommands?: boolean;         // Include built-in commands (default: true)
  
  // Managers
  sessionManager?: ISessionManager;         // Custom session manager
  historyManager?: IHistoryManager;         // Custom history manager
  
  // Customization
  components?: ComponentConfig;             // Custom UI components
  theme?: ThemeConfig;                      // Theme configuration
  hooks?: HookConfig;                       // Lifecycle hooks
  
  // Environment
  env?: Record<string, string>;             // Initial environment variables
  initialPath?: string;                     // Starting directory (default: '/home')
  autoSaveSession?: boolean;                // Auto-save on changes (default: true)
}
```

### Storage Adapters

```typescript
// Use IndexedDB (default)
import { IndexedDBAdapter } from 'wcli/adapters';
const terminal = new Terminal({
  storageAdapter: new IndexedDBAdapter('my-app-db'),
});

// Use LocalStorage
import { LocalStorageAdapter } from 'wcli/adapters';
const terminal = new Terminal({
  storageAdapter: new LocalStorageAdapter('my-app:'),
});

// Use Memory (no persistence)
import { MemoryAdapter } from 'wcli/adapters';
const terminal = new Terminal({
  storageAdapter: new MemoryAdapter(),
});

// Implement custom adapter
class APIAdapter implements IStorageAdapter {
  async save(key: string, data: any) { /* ... */ }
  async load(key: string) { /* ... */ }
  async remove(key: string) { /* ... */ }
  async list() { /* ... */ }
}
```

### Lifecycle Hooks

```typescript
const terminal = new Terminal({
  hooks: {
    beforeInit: async () => {
      console.log('Terminal initializing...');
    },
    afterInit: async () => {
      console.log('Terminal ready!');
    },
    beforeCommand: async (input) => {
      console.log('Executing:', input);
    },
    afterCommand: async (input, output) => {
      // Analytics, logging, etc.
    },
    commandError: async (input, error) => {
      // Error reporting
    },
    filesystemChange: async (operation, path) => {
      console.log(`Filesystem ${operation}:`, path);
    },
  },
});
```

### Session Management

```typescript
// Save current session
await terminal.saveSession();

// Load saved session
const loaded = await terminal.loadSession();

// Clear session
await terminal.clearSession();

// Access history
const history = terminal.getHistoryManager();
const allCommands = history.getAll();
const lastCommand = history.getPrevious();
```

### Themes

```typescript
import { applyTheme, darkTheme, draculaTheme, nordTheme } from 'wcli/themes';

// Apply built-in theme
applyTheme(darkTheme);

// Apply custom theme
applyTheme({
  colors: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    prompt: '#00ff00',
  },
  font: {
    family: 'Monaco, monospace',
    size: 14,
  },
});
```

### Component Composition

```vue
<template>
  <!-- Full terminal component -->
  <TerminalComponent :config="config" />
  
  <!-- Or compose individual components -->
  <div class="custom-layout">
    <Sidebar @command="terminal.executeCommand" />
    <TerminalOutput :lines="outputLines" />
    <TerminalInput 
      v-model="input"
      :prompt="prompt"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { Terminal } from 'wcli';
import { TerminalComponent, TerminalOutput, TerminalInput } from 'wcli/components';

const terminal = new Terminal();
await terminal.initialize();
</script>
```

### Custom Commands

```typescript
import type { Command } from 'wcli';

const deployCommand: Command = {
  name: 'deploy',
  description: 'Deploy application',
  usage: 'deploy [environment]',
  async execute(args, options) {
    const env = args[0] || 'staging';
    await options.stdout.write(`Deploying to ${env}...\n`);
    
    // Your deployment logic
    
    await options.stdout.write('✅ Deployment complete!\n');
    return { exitCode: 0 };
  },
};

const terminal = new Terminal({
  commands: [deployCommand],
});
```

### Interactive Prompts

Commands can request user input interactively using the prompt system:

```typescript
import type { Command } from 'wcli';

const loginCommand: Command = {
  name: 'login',
  description: 'Interactive login',
  usage: 'login',
  async execute(args, options) {
    const { stdout, prompt } = options;
    
    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    try {
      // Simple prompt
      const username = await prompt('Username:');
      
      // Prompt with validation and password masking
      const password = await prompt({
        message: 'Password:',
        password: true, // Masks input with *
        validate: (input) => {
          if (input.length < 6) {
            return 'Password must be at least 6 characters';
          }
          return true;
        }
      });
      
      await stdout.write(`Welcome, ${username}!\n`);
      return { exitCode: 0 };
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('Login cancelled.\n');
        return { exitCode: 130 };
      }
      throw error;
    }
  }
};
```

**Prompt Options:**
- `message` - The prompt message to display
- `defaultValue` - Optional default value (used when Enter is pressed with empty input)
- `password` - If true, input is completely invisible (like macOS terminal password prompts)
- `validate` - Function that returns `true` for valid input or an error message string

**Built-in Interactive Commands:**
- `login` - Interactive login with username/password
- `survey` - Multi-question survey
- `ask <question>` - Ask a simple question
- `confirm <message>` - Yes/no confirmation prompt

See [examples/prompts/](examples/prompts/) for more detailed examples.

## 📖 Command Usage

### Basic Commands

```bash
# Navigation
ls                      # List files in current directory
cd /bin                 # Change to /bin directory
pwd                     # Show current directory

# File Operations
cat README.txt          # Display file contents
touch newfile.txt       # Create empty file
mkdir projects          # Create directory
rm file.txt             # Remove file

# Text Processing
echo "Hello World"      # Print text
grep pattern file.txt   # Search for pattern
wc -l file.txt         # Count lines

# Network
curl wttr.in/London    # Fetch weather report
curl --html example.com | view  # Fetch and render HTML

# Aliases (built-in shortcuts)
l                      # Same as 'ls'
ll                     # Same as 'ls -la'
..                     # Same as 'cd ..'
```

### Advanced Features

```bash
# Piping
ls | grep .js           # List only .js files
cat file.txt | wc -l    # Count lines in file
find . -name "*.ts" | grep test  # Find test files

# Redirection
echo "content" > file.txt       # Write to file
cat file1.txt >> file2.txt      # Append to file

# Command Chaining
mkdir test && cd test           # Create and enter directory
cd invalid || echo "Failed"     # Execute on failure
touch file1.txt ; ls           # Sequential execution

# Execute JavaScript Commands
exec /bin/demo.js "Hello!"     # Run custom command

# Command Aliases
alias                          # List all aliases
alias ll='ls -la'              # Create new alias
alias gs='grep --color search' # Alias with arguments
unalias gs                     # Remove an alias

# Interactive Commands
login                          # Interactive login prompt
survey                         # Multi-question survey
ask "What's your name?"        # Ask a question
confirm "Are you sure?"        # Yes/no confirmation
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Autocomplete commands/paths (cycle with multiple tabs) |
| `↑` / `↓` | Navigate command history |
| `Ctrl+C` | Interrupt current input |
| `Ctrl+L` | Clear screen |
| `Ctrl+A` | Jump to beginning of line |
| `Ctrl+E` | Jump to end of line |
| `Ctrl+U` | Delete to beginning of line |
| `Ctrl+K` | Delete to end of line |
| `Ctrl+W` | Delete word backwards |

## 🛠️ Development

### Project Structure

```
wcli/
├── src/
│   ├── components/     # Vue 3 components
│   │   ├── TerminalComponent.vue
│   │   ├── TerminalOutput.vue
│   │   └── TerminalInput.vue
│   ├── core/           # Terminal engine
│   │   ├── Terminal.ts
│   │   ├── Filesystem.ts
│   │   ├── CommandParser.ts
│   │   ├── CommandExecutor.ts
│   │   └── PluginLoader.ts
│   ├── commands/       # Built-in commands (20 total)
│   ├── ui/            # UI utilities (animations)
│   ├── utils/         # Utilities (streams, paths)
│   ├── types/         # TypeScript interfaces
│   └── App.vue        # Main Vue app
├── tests/             # Comprehensive test suite
├── FEATURES.md        # Detailed feature documentation
├── TESTING.md         # Testing guide
└── MIGRATION.md       # Vue migration notes
```

### Available Scripts

```bash
# Development
bun run dev            # Start dev server with HMR

# Building
bun run build          # Build for production
bun run preview        # Preview production build

# Testing
bun run test           # Run tests in watch mode
bun run test:run       # Run tests once
bun run test:ui        # Open interactive test UI
bun run test:coverage  # Generate coverage report
```

### Testing

WCLI includes a comprehensive test suite with **97 tests** covering all major components:

```bash
bun run test:run
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 🎯 Built-in Commands

| Command | Description |
|---------|-------------|
| `ls` | List directory contents |
| `cd` | Change directory |
| `pwd` | Print working directory |
| `cat` | Display file contents |
| `echo` | Print text to output |
| `grep` | Search for patterns |
| `find` | Search for files |
| `wc` | Count lines, words, bytes |
| `curl` | Transfer data from or to a server |
| `mkdir` | Create directories |
| `touch` | Create empty files |
| `rm` | Remove files/directories |
| `cp` | Copy files |
| `mv` | Move/rename files |
| `clear` | Clear terminal screen |
| `help` | Show available commands |
| `history` | View command history |
| `env` | Display/set environment variables |
| `exec` | Execute JavaScript commands |
| `alias` | Create/view command aliases |
| `unalias` | Remove command aliases |
| `view` | Display Vue components or HTML content |

## 🔤 Command Aliases

WCLI supports command aliases just like a real shell. Several useful aliases are pre-configured:

| Alias | Expands To | Description |
|-------|-----------|-------------|
| `l` | `ls` | Quick file listing |
| `ll` | `ls -la` | Detailed list with hidden files |
| `la` | `ls -a` | List all files including hidden |
| `lt` | `ls -lt` | List sorted by time |
| `..` | `cd ..` | Go up one directory |
| `...` | `cd ../..` | Go up two directories |
| `~` | `cd ~` | Go to home directory |
| `h` | `history` | Show command history |
| `c` | `clear` | Clear screen |
| `cls` | `clear` | Clear screen (Windows-style) |

### Managing Aliases

```bash
# View all aliases
alias

# View a specific alias
alias l

# Create a new alias
alias gs='grep --color'
alias proj='cd /home/projects'

# Remove an alias
unalias gs

# Reset to default aliases
unalias -a
```

## 🔌 Creating Custom Commands

Create executable JavaScript commands in the filesystem:

```javascript
// Save as /bin/mycommand.js
exports.name = 'mycommand';
exports.description = 'My custom command';
exports.usage = 'mycommand [args]';

exports.execute = async function(args, options) {
  await options.stdout.write('Hello from custom command!\n');
  return { exitCode: 0 };
};
```

Then execute it:
```bash
exec /bin/mycommand.js
# or if registered
mycommand
```

## 🏗️ Architecture

### Virtual Filesystem
- In-memory file tree with IndexedDB persistence
- Full Unix-like path resolution
- Supports files and directories with metadata

### Command Execution
- Stream-based I/O for proper piping
- Support for all major shell operators
- Async command execution
- Environment variable support

### Terminal UI
- Vue 3 reactive components
- Custom rendering with Vue SFCs
- ANSI color support
- Smart autocomplete with visual suggestions
- Modular component architecture

## 📊 Technical Details

- **Runtime**: Bun
- **Build Tool**: Vite
- **Framework**: Vue 3
- **Language**: TypeScript
- **Testing**: Vitest (97 tests, 100% passing)
- **Storage**: IndexedDB
- **UI**: Vue 3 Single File Components (SFC)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`bun run test:run`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please ensure all tests pass before submitting a PR.

## 📝 Documentation

- [MIGRATION.md](./MIGRATION.md) - **v1.x → v2.0 migration guide**
- [FEATURES.md](./FEATURES.md) - Comprehensive feature documentation
- [TESTING.md](./TESTING.md) - Testing guide and best practices
- [examples/](./examples/) - Working code examples

## 📚 Examples

### Running Examples

See **[EXAMPLES.md](./EXAMPLES.md)** for detailed instructions on running examples.

**Quick start:**
```bash
cd examples/demo-app
bun install
bun run dev
```

### Available Examples

- **[demo-app/](./examples/demo-app/)** - **Runnable demo** showing basic usage
- **[basic/](./examples/basic/)** - Code reference for minimal setup
- **[custom-storage/](./examples/custom-storage/)** - Custom storage adapter with API backend
- **[custom-commands/](./examples/custom-commands/)** - Adding custom commands and lifecycle hooks

More examples coming soon:
- Multi-user sessions
- Custom UI components  
- Theme customization
- Session management

## 🎓 Use Cases

### For Developers
- **Terminal-as-a-Service**: Build multi-tenant terminal applications
- **Development Tools**: Create custom CLI tools for your applications
- **Internal Tools**: Admin panels, deployment dashboards, log viewers
- **IDE Integration**: Embed terminals in web-based IDEs

### For Education
- **Interactive Tutorials**: Teach Unix/Linux commands safely
- **Coding Platforms**: Provide terminals in educational platforms
- **Documentation**: Interactive command examples

### For Fun
- **Browser Games**: Terminal-based games and interactive fiction
- **Retro Aesthetics**: 80s/90s terminal UIs
- **Art Projects**: Creative coding with terminal interfaces

## 🗺️ Roadmap

### v2.0 (Current) ✅
- [x] Configuration-based architecture
- [x] Storage adapters (IndexedDB, LocalStorage, Memory, Custom)
- [x] Session management
- [x] History API
- [x] Lifecycle hooks
- [x] Theme system
- [x] NPM package
- [x] Component composition

### v2.1 (Next)
- [ ] Backend integration support (WebSocket command execution)
- [ ] More built-in themes
- [ ] Advanced component customization
- [ ] Plugin system for commands
- [ ] Better mobile support

### Future
- [ ] Terminal multiplexing (tabs/splits)
- [ ] SSH client integration
- [ ] Session recording and playback
- [ ] Collaborative terminals
- [ ] Performance optimizations

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

Built with inspiration from:
- [xterm.js](https://xtermjs.org/)
- [jQuery Terminal](https://terminal.jcubic.pl/)
- Modern Unix terminals

## 💬 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/wcli/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/wcli/discussions)

---

**Made with ❤️ by [Livshitz](https://github.com/Livshitz)**

⭐ Star this repo if you find it useful!

