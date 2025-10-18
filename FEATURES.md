# WCLI Features & Capabilities

## 🎯 Core Features

### Virtual Filesystem
- ✅ In-memory file tree with IndexedDB persistence
- ✅ Full Unix-like path resolution (absolute, relative, `.`, `..`)
- ✅ File and directory operations (create, read, write, delete)
- ✅ Metadata support (timestamps, permissions, size)
- ✅ Automatic persistence across browser sessions

### Command Processing
- ✅ Advanced command parser with operator support
- ✅ Piping: `command1 | command2 | command3`
- ✅ Redirection: `command > file.txt`, `command >> file.txt`
- ✅ Chaining: `cmd1 && cmd2`, `cmd1 || cmd2`, `cmd1 ; cmd2`
- ✅ Quote handling and escape sequences
- ✅ Flag parsing (`-flag`, `--flag`, `-flag=value`)
- ✅ Stream-based I/O for proper piping

### Plugin System
- ✅ Dynamic command loading from filesystem
- ✅ JavaScript/TypeScript command modules
- ✅ Standardized command interface
- ✅ Runtime command execution via `exec`

## ⌨️ Keyboard Shortcuts

### Text Navigation
- **Tab** - Autocomplete commands and file paths (press multiple times to cycle)
- **↑/↓** - Navigate through command history
- **Ctrl+A** (Cmd+A on Mac) - Jump to beginning of line
- **Ctrl+E** (Cmd+E on Mac) - Jump to end of line

### Text Manipulation
- **Ctrl+U** (Cmd+U on Mac) - Delete from cursor to beginning of line
- **Ctrl+K** (Cmd+K on Mac) - Delete from cursor to end of line
- **Ctrl+W** (Cmd+W on Mac) - Delete word backwards

### Terminal Control
- **Ctrl+C** (Cmd+C on Mac) - Interrupt current input
- **Ctrl+L** (Cmd+L on Mac) - Clear screen (same as `clear` command)
- **Enter** - Execute command

## 🔍 Smart Autocomplete

### Command Autocomplete
- Press Tab after typing partial command name
- Cycles through matching commands on multiple Tab presses
- Shows all available suggestions below input

### File Path Autocomplete
- Works with absolute paths: `/bin/de[Tab]`
- Works with relative paths: `./fil[Tab]`
- Shows directories with trailing `/`
- Handles multiple matches intelligently

### Features
- Common prefix completion
- Visual suggestion display (up to 10 items)
- Cycle through suggestions with repeated Tab
- Automatic hiding on typing or submission

## 📦 Built-in Commands (20 total)

### File Operations
- **ls** - List directory contents
- **cd** - Change directory
- **pwd** - Print working directory
- **cat** - Display file contents
- **touch** - Create empty files
- **mkdir** - Create directories
- **rm** - Remove files/directories
- **cp** - Copy files
- **mv** - Move/rename files

### Text Processing
- **echo** - Output text
- **grep** - Search for patterns in files
- **wc** - Count lines, words, and bytes

### System
- **clear** - Clear terminal screen
- **help** - Display available commands
- **history** - Show command history
- **env** - Display/set environment variables
- **find** - Search for files in directory hierarchy
- **exec** - Execute JavaScript files as commands
- **alias** - Create command aliases
- **unalias** - Remove command aliases

### Interactive Components
- **view** - Render Vue components in terminal (local or remote)

## 🔧 Advanced Features

### Command Piping Examples
```bash
ls | grep .js                    # Find JS files
cat fruits.txt | grep a          # Search lines with 'a'
find . -name "*.txt" | wc -l     # Count text files
```

### Redirection Examples
```bash
echo "Hello World" > file.txt    # Write to file
echo "More text" >> file.txt     # Append to file
cat < input.txt                  # Read from file
```

### Command Chaining Examples
```bash
mkdir test && cd test            # Create and enter directory
cd invalid || echo "Failed"      # Execute on failure
touch file1.txt ; ls             # Sequential execution
```

### Dynamic JavaScript Commands
Create executable commands directly in the filesystem:

```javascript
// In /bin/mycommand.js
exports.name = 'mycommand';
exports.description = 'My custom command';
exports.usage = 'mycommand [args]';

exports.execute = async function(args, options) {
  await options.stdout.write('Custom output!\n');
  return { exitCode: 0 };
};
```

Then execute: `exec /bin/mycommand.js` or directly: `mycommand`

### Interactive Vue Components
Render rich, interactive Vue components directly in the terminal:

```bash
# Display built-in components
view Matrix rows=15 cols=40
view DitherPanel
view IntroSection

# Pass various prop types
view Matrix rows=10 cols=20                      # Numbers
view MyComponent title="Hello" enabled=true      # Strings and booleans
view Widget config='{"theme":"dark","size":10}'  # Objects

# Load remote components (experimental)
view HelloWorld --remote /examples/HelloWorld.js
view HelloWorld --remote /examples/HelloWorld.js message="Welcome!" textColor="#0ff"
# Or from external URLs (must be CORS-enabled and properly formatted)
view MyComponent --remote https://example.com/component.js
```

Components are dynamically loaded and mounted, supporting:
- Local components (built into the app)
- Remote components (loaded from URLs)
- Props of any type (strings, numbers, booleans, objects, arrays)
- Full Vue reactivity and lifecycle hooks
- Interactive user interfaces within terminal output

## 🎨 UI Features

### Terminal Display
- Custom terminal UI (no external libraries)
- Smooth scrolling
- ANSI color support (basic)
- Distinct styling for input/output/errors
- Line-by-line rendering

### Visual Feedback
- Autocomplete suggestions display
- Command prompt with user and path
- Input history preservation
- Error highlighting
- Clear visual hierarchy

### Responsive Design
- Works on desktop and mobile
- Scrollable output
- Fixed input area
- Adaptive font sizing

## 💾 Data Persistence

### IndexedDB Storage
- Entire filesystem persists automatically
- Survives browser refreshes
- No manual save required
- Cross-session command history

### Initial Demo Content
- README with full documentation
- Sample command in `/bin/demo.js`
- Sample data file for testing
- Pre-created directory structure

## 🚀 Performance

### Optimizations
- In-memory operations for speed
- Async/await throughout for responsiveness
- Efficient path resolution
- Stream-based command piping
- Virtual scrolling support

## 📊 Technical Stack

- **Runtime**: Bun
- **Build Tool**: Vite (HMR, fast builds)
- **Language**: TypeScript (full type safety)
- **Templating**: Pug
- **Storage**: IndexedDB
- **Architecture**: Modular, separation of concerns

## 🎓 Learning & Exploration

The terminal is perfect for:
- Learning Unix/Linux commands
- Experimenting with shell scripting concepts
- Building custom commands
- Understanding piping and redirection
- Testing file system operations

## 🔮 Extensibility

Easy to extend with:
- New built-in commands
- Custom JavaScript commands
- Additional keyboard shortcuts
- New file system features
- UI enhancements
- Backend integration (future)

---

**Try it now!** Type `help` to get started, or `cat /home/README.txt` for a guided tour.

