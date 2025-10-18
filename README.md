# WCLI - Web Command Line Interface

A fully-featured, modular terminal that runs entirely in your browser. Built with Vue 3, TypeScript, and Vite.

[![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen)]() [![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D)]() [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]() [![License](https://img.shields.io/badge/license-MIT-blue)]()

## ✨ Features

- 🖥️ **Custom Terminal UI** - No external terminal libraries, built from scratch
- 💾 **Virtual Filesystem** - Persistent storage using IndexedDB
- 🔗 **Command Piping** - Real stream-based I/O (`ls | grep test`)
- 📝 **File Redirection** - Output to files (`echo "text" > file.txt`)
- ⌨️ **Native Shortcuts** - All standard terminal keyboard shortcuts
- 🔍 **Smart Autocomplete** - Tab completion for commands and file paths
- 🔌 **Extensible** - Load JavaScript files as executable commands
- 📜 **Command History** - Navigate with arrow keys
- 🔤 **Command Aliases** - Create shortcuts for commands (like `l` for `ls`)
- 🎨 **Modern UI** - Beautiful, responsive terminal design

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wcli.git
cd wcli

# Install dependencies
bun install

# Start development server
bun run dev
```

The terminal will open at `http://localhost:3000`

## 📖 Usage

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

- [FEATURES.md](./FEATURES.md) - Comprehensive feature documentation
- [TESTING.md](./TESTING.md) - Testing guide and best practices
- [MIGRATION.md](./MIGRATION.md) - Vue 3 migration notes

## 🎓 Use Cases

- **Education**: Learn Unix/Linux commands in a safe environment
- **Development**: Quick terminal for web-based IDEs
- **Demos**: Showcase command-line tools in the browser
- **Prototyping**: Test shell scripts without a backend
- **Fun**: Experiment with a fully-featured terminal in your browser!

## 🗺️ Roadmap

- [ ] Backend integration support (WebSocket command execution)
- [ ] Themes and customization
- [ ] More built-in commands
- [ ] Terminal multiplexing (tabs/splits)
- [ ] SSH client integration
- [ ] Package manager for commands
- [ ] Session recording and playback

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

