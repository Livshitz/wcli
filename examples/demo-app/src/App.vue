<template>
  <div class="demo-app">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>WCLI Demo</h2>
        <p class="version">v2.0.0</p>
      </div>

      <!-- Theme Selector -->
      <section class="sidebar-section">
        <h3>Themes</h3>
        <div class="theme-buttons">
          <button 
            v-for="theme in themes" 
            :key="theme.name"
            @click="applyTheme(theme.theme)"
            :class="{ active: currentTheme === theme.name }"
          >
            {{ theme.name }}
          </button>
        </div>
      </section>

      <!-- Quick Commands -->
      <section class="sidebar-section">
        <h3>Quick Commands</h3>
        <ul class="command-list">
          <li 
            v-for="cmd in quickCommands" 
            :key="cmd.command"
            @click="executeCommand(cmd.command)"
            :title="cmd.description"
          >
            <span class="cmd-name">{{ cmd.name }}</span>
            <span class="cmd-hint">{{ cmd.command }}</span>
          </li>
        </ul>
      </section>

      <!-- All Commands -->
      <section class="sidebar-section">
        <h3>All Commands</h3>
        <ul class="command-list compact">
          <li 
            v-for="cmd in allCommands" 
            :key="cmd.name"
            @click="executeCommand(cmd.name)"
            :title="cmd.description"
          >
            {{ cmd.name }}
          </li>
        </ul>
      </section>

      <!-- Session Controls -->
      <section class="sidebar-section">
        <h3>Session</h3>
        <div class="button-group">
          <button @click="saveSession" class="btn-small">💾 Save</button>
          <button @click="loadSession" class="btn-small">📂 Load</button>
          <button @click="clearSession" class="btn-small">🗑️ Clear</button>
        </div>
      </section>
    </aside>

    <!-- Terminal -->
    <main class="terminal-area">
      <TerminalComponent 
        ref="terminalRef"
        :terminal="terminal" 
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Terminal, applyTheme as applyThemeUtil } from 'wcli';
import { TerminalComponent } from 'wcli/components';
import { defaultTheme, darkTheme, lightTheme, draculaTheme, nordTheme } from 'wcli/themes';
import type { Command } from 'wcli';
import 'wcli/styles/terminal.css';

// Custom command example
const demoCommand: Command = {
  name: 'demo',
  description: 'Show a demo message',
  usage: 'demo [message]',
  async execute(args, options) {
    const message = args.join(' ') || 'Hello from custom command!';
    await options.stdout.write(`🎉 ${message}\n`);
    return { exitCode: 0 };
  },
};

const greetCommand: Command = {
  name: 'greet',
  description: 'Greet the user',
  usage: 'greet [name]',
  async execute(args, options) {
    const name = args[0] || 'User';
    const user = options.env.USER || 'user';
    await options.stdout.write(`👋 Hello ${name}! Welcome to WCLI.\n`);
    await options.stdout.write(`You are logged in as: ${user}\n`);
    return { exitCode: 0 };
  },
};

// Create terminal with custom configuration
const terminal = new Terminal({
  commands: [demoCommand, greetCommand],
  includeDefaultCommands: true,
  env: {
    USER: 'demo-user',
    HOME: '/home/demo',
    PATH: '/bin',
    DEMO_MODE: 'true',
  },
  hooks: {
    beforeCommand: (input) => {
      console.log('📝 Executing command:', input);
    },
    afterCommand: (input, output) => {
      console.log('✅ Command completed:', input);
    },
    commandError: (input, error) => {
      console.error('❌ Command failed:', input, error);
    },
  },
});

const terminalRef = ref<InstanceType<typeof TerminalComponent> | null>(null);
const currentTheme = ref('default');

// Theme options
const themes = [
  { name: 'default', theme: defaultTheme },
  { name: 'dark', theme: darkTheme },
  { name: 'light', theme: lightTheme },
  { name: 'dracula', theme: draculaTheme },
  { name: 'nord', theme: nordTheme },
];

// Quick commands with descriptions
const quickCommands = [
  { name: '📖 Help', command: 'help', description: 'Show all available commands' },
  { name: '📁 List Files', command: 'ls -la', description: 'List all files with details' },
  { name: '📄 Read README', command: 'cat /home/README.txt', description: 'Display README file' },
  { name: '📝 Create File', command: 'echo "Hello WCLI!" > test.txt', description: 'Create a test file' },
  { name: '🔍 Find Files', command: 'find . -name "*.txt"', description: 'Find all text files' },
  { name: '🎨 Demo Command', command: 'demo "Custom commands work!"', description: 'Run custom demo command' },
  { name: '👋 Greet', command: 'greet Alice', description: 'Run custom greet command' },
  { name: '📊 Word Count', command: 'cat /home/README.txt | wc -l', description: 'Count lines in README' },
  { name: '🌐 Weather', command: 'curl wttr.in/London', description: 'Get weather report' },
  { name: '🗂️ History', command: 'history', description: 'Show command history' },
];

// All available commands
const allCommands = ref<Array<{ name: string; description: string }>>([]);

// Apply theme
function applyTheme(theme: any) {
  applyThemeUtil(theme);
  currentTheme.value = theme.name;
}

// Execute command programmatically
async function executeCommand(cmd: string) {
  await terminal.executeCommand(cmd);
}

// Session management
async function saveSession() {
  try {
    await terminal.saveSession();
    await terminal.executeCommand('echo "✅ Session saved successfully!"');
  } catch (error) {
    await terminal.executeCommand(`echo "❌ Failed to save session: ${error}"`);
  }
}

async function loadSession() {
  try {
    const loaded = await terminal.loadSession();
    if (loaded) {
      await terminal.executeCommand('echo "✅ Session loaded successfully!"');
    } else {
      await terminal.executeCommand('echo "ℹ️ No saved session found"');
    }
  } catch (error) {
    await terminal.executeCommand(`echo "❌ Failed to load session: ${error}"`);
  }
}

async function clearSession() {
  try {
    await terminal.clearSession();
    await terminal.executeCommand('echo "✅ Session cleared!"');
  } catch (error) {
    await terminal.executeCommand(`echo "❌ Failed to clear session: ${error}"`);
  }
}

// Initialize
onMounted(async () => {
  await terminal.initialize();
  
  // Get all commands
  allCommands.value = terminal.getExecutor().getAllCommands();
  
  // Show welcome message
  await terminal.executeCommand('echo "🎉 Welcome to WCLI v2.0 Demo!"');
  await terminal.executeCommand('echo "👈 Use the sidebar to explore features"');
  await terminal.executeCommand('echo "💡 Click any command to run it"');
  await terminal.executeCommand('echo ""');
  await terminal.executeCommand('cat /home/README.txt');
});
</script>

<style scoped>
.demo-app {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #000;
  color: #0f0;
  font-family: 'Courier New', monospace;
}

/* Sidebar */
.sidebar {
  width: 300px;
  background: #1a1a1a;
  border-right: 2px solid #333;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 2px solid #333;
  background: #0a0a0a;
}

.sidebar-header h2 {
  margin: 0;
  color: #0f0;
  font-size: 24px;
  text-shadow: 0 0 10px #0f0;
}

.version {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 12px;
}

.sidebar-section {
  padding: 15px;
  border-bottom: 1px solid #333;
}

.sidebar-section h3 {
  margin: 0 0 10px 0;
  color: #0f0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Theme buttons */
.theme-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.theme-buttons button {
  padding: 5px 10px;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #0f0;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  transition: all 0.2s;
}

.theme-buttons button:hover {
  background: #3a3a3a;
  border-color: #0f0;
}

.theme-buttons button.active {
  background: #0f0;
  color: #000;
  border-color: #0f0;
}

/* Command list */
.command-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.command-list li {
  padding: 8px 10px;
  background: #2a2a2a;
  border: 1px solid #333;
  margin-bottom: 5px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.command-list li:hover {
  background: #3a3a3a;
  border-color: #0f0;
  transform: translateX(5px);
}

.command-list.compact li {
  padding: 5px 10px;
  font-size: 11px;
}

.cmd-name {
  display: block;
  color: #0f0;
  font-weight: bold;
  margin-bottom: 2px;
}

.cmd-hint {
  display: block;
  color: #666;
  font-size: 10px;
  font-family: monospace;
}

/* Button group */
.button-group {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.btn-small {
  flex: 1;
  padding: 8px;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #0f0;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  transition: all 0.2s;
}

.btn-small:hover {
  background: #3a3a3a;
  border-color: #0f0;
}

/* Terminal area */
.terminal-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Scrollbar styling */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #0f0;
}

/* Responsive */
@media (max-width: 768px) {
  .demo-app {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    max-height: 40vh;
    border-right: none;
    border-bottom: 2px solid #333;
  }
}
</style>
