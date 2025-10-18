# WCLI Demo App - Full Feature Showcase

This demo app showcases **all** the customization features of WCLI v2.0 with an interactive sidebar.

## Features Demonstrated

### 1. 🎨 Theme System
- **5 Built-in Themes**: Default, Dark, Light, Dracula, Nord
- **Live Theme Switching**: Click theme buttons to change colors instantly
- **CSS Custom Properties**: Themes use CSS variables for easy customization

### 2. 🔧 Custom Commands
- **demo** - Custom command example
- **greet** - Command that uses environment variables
- Shows how to register custom commands via configuration

### 3. 🎯 Custom Configuration
```typescript
const terminal = new Terminal({
  commands: [demoCommand, greetCommand],  // Custom commands
  includeDefaultCommands: true,            // Keep built-ins
  env: {                                   // Custom environment
    USER: 'demo-user',
    HOME: '/home/demo',
    DEMO_MODE: 'true',
  },
  hooks: {                                 // Lifecycle hooks
    beforeCommand: (input) => { ... },
    afterCommand: (input, output) => { ... },
    commandError: (input, error) => { ... },
  },
});
```

### 4. 🎣 Lifecycle Hooks
- **beforeCommand**: Logs before execution
- **afterCommand**: Logs after success
- **commandError**: Logs on failure
- Check browser console to see hooks in action!

### 5. 💾 Session Management
- **Save Session**: Persist terminal state
- **Load Session**: Restore saved state
- **Clear Session**: Remove saved data
- Uses configurable storage adapters (IndexedDB by default)

### 6. 🖱️ Programmatic Command Execution
- Click sidebar commands to execute them
- Shows how to trigger commands from UI
- Useful for building custom interfaces

### 7. 🧩 Component Composition
- **Sidebar + Terminal Layout**: Custom layout with sidebar
- **External Terminal Instance**: Pass terminal to component
- **Flexible UI**: Build any layout you want

### 8. 📋 Command Discovery
- Lists all available commands dynamically
- Shows command descriptions
- Interactive command palette

## Running the Demo

```bash
# From wcli root
cd examples/demo-app
bun install
bun run dev
```

Open `http://localhost:3001`

## What to Try

### Theme Switching
1. Click different theme buttons in the sidebar
2. Watch the terminal colors change instantly
3. Try all 5 themes!

### Custom Commands
1. Click "🎨 Demo Command" in sidebar
2. Click "👋 Greet" to see environment variables in action
3. Type `demo "Your message"` in terminal
4. Type `greet YourName` in terminal

### Quick Commands
1. Click any command in the "Quick Commands" section
2. Watch it execute automatically
3. See the output in the terminal

### Session Management
1. Create some files: `mkdir test && cd test && echo "data" > file.txt`
2. Click "💾 Save" to save session
3. Refresh the page
4. Click "📂 Load" to restore your session
5. Your files and location are restored!

### Lifecycle Hooks
1. Open browser console (F12)
2. Run any command
3. See the hook logs:
   - 📝 Before execution
   - ✅ After success
   - ❌ On error

### All Commands
1. Scroll down in sidebar to "All Commands"
2. Click any command name to run it
3. Explore all 25+ built-in commands!

## Code Highlights

### Custom Command Definition
```typescript
const demoCommand: Command = {
  name: 'demo',
  description: 'Show a demo message',
  usage: 'demo [message]',
  async execute(args, options) {
    const message = args.join(' ') || 'Hello!';
    await options.stdout.write(`🎉 ${message}\n`);
    return { exitCode: 0 };
  },
};
```

### Programmatic Execution
```typescript
async function executeCommand(cmd: string) {
  await terminal.executeCommand(cmd);
}
```

### Theme Application
```typescript
import { applyTheme, darkTheme } from 'wcli/themes';

function applyTheme(theme) {
  applyThemeUtil(theme);
}
```

### Session Management
```typescript
// Save
await terminal.saveSession();

// Load
await terminal.loadSession();

// Clear
await terminal.clearSession();
```

## Customization Ideas

Based on this demo, you can:

1. **Build Admin Panels**: Terminal interface for server management
2. **Create Dev Tools**: Custom commands for your workflow
3. **Make Interactive Tutorials**: Clickable command guides
4. **Design Command Palettes**: Quick access to common tasks
5. **Build Terminal Games**: Interactive text-based games
6. **Create Log Viewers**: Real-time log streaming
7. **Make API Explorers**: Terminal-based API testing

## Architecture

```
App.vue
├── Sidebar (Custom UI)
│   ├── Theme Selector
│   ├── Quick Commands
│   ├── All Commands
│   └── Session Controls
└── TerminalComponent (WCLI)
    └── Terminal Instance (with config)
```

## Next Steps

1. **Modify the sidebar**: Add your own sections
2. **Add more custom commands**: Create commands for your use case
3. **Customize themes**: Create your own color schemes
4. **Add more hooks**: Track analytics, log to server, etc.
5. **Implement custom storage**: Use your own backend API

## Learn More

- [Main README](../../README.md) - Full API documentation
- [MIGRATION.md](../../MIGRATION.md) - Migration guide
- [EXAMPLES.md](../../EXAMPLES.md) - More examples

---

**This demo showcases every major feature of WCLI v2.0!** 🚀
