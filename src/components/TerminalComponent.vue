<template>
  <div class="terminal-container">
    <TerminalOutput 
      ref="outputRef"
      :lines="outputLines" 
    />
    
    <div v-if="suggestions.length > 0" class="terminal-suggestions">
      <span
        v-for="(suggestion, idx) in displaySuggestions"
        :key="idx"
        class="suggestion-item"
      >
        {{ suggestion }}
      </span>
      <span v-if="hasMoreSuggestions" class="suggestion-more">
        (+{{ suggestions.length - maxDisplaySuggestions }} more)
      </span>
    </div>
    
    <TerminalInput
      ref="inputRef"
      v-model="inputValue"
      :prompt="currentPrompt"
      :autocomplete-fn="handleAutocomplete"
      @submit="handleSubmit"
      @interrupt="handleInterrupt"
      @typing="hideSuggestions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, createApp } from 'vue';
import type { TerminalLine } from '@/types';
import { Terminal } from '@/core/Terminal';
import { registerBuiltInCommands } from '@/commands';
import TerminalOutput from './TerminalOutput.vue';
import TerminalInput from './TerminalInput.vue';
import IntroSection from './IntroSection.vue';

const terminal = new Terminal();
const outputLines = ref<TerminalLine[]>([]);
const inputValue = ref('');
const currentPrompt = ref('');
const suggestions = ref<string[]>([]);
const outputRef = ref<InstanceType<typeof TerminalOutput> | null>(null);
const inputRef = ref<InstanceType<typeof TerminalInput> | null>(null);

const maxDisplaySuggestions = 10;
const displaySuggestions = computed(() => 
  suggestions.value.slice(0, maxDisplaySuggestions)
);
const hasMoreSuggestions = computed(() => 
  suggestions.value.length > maxDisplaySuggestions
);

function preventPinchZoom() {
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());
  
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  let initialDistance = 0;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
    }
  });
  
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
    }
  }, { passive: false });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function appendLine(line: TerminalLine) {
  outputLines.value.push(line);
}

function updatePrompt() {
  currentPrompt.value = terminal.getPrompt();
}

async function handleSubmit() {
  hideSuggestions();
  
  const input = inputValue.value.trim();
  if (!input) return;
  
  const aliasManager = terminal.getExecutor().getAliasManager();
  const resolvedInput = aliasManager.resolve(input);
  const commandName = resolvedInput.split(/\s+/)[0];
  
  if (commandName === 'clear') {
    clearTerminal();
    inputValue.value = '';
    return;
  }
  
  const prompt = terminal.getPrompt();
  appendLine({
    id: generateId(),
    type: 'input',
    content: prompt + input,
    timestamp: new Date(),
  });
  
  await terminal.executeCommand(input);
  
  inputValue.value = '';
  updatePrompt();
}

async function handleAutocomplete(cursorPos: number): Promise<{ suggestions: string[]; replacement: string }> {
  const input = inputValue.value;
  const beforeCursor = input.slice(0, cursorPos);
  const parts = beforeCursor.trim().split(/\s+/);
  const lastPart = parts[parts.length - 1] || '';

  let result: { suggestions: string[]; replacement: string };

  if (parts.length === 1 && !beforeCursor.endsWith(' ')) {
    const commands = terminal.getExecutor().getAllCommands();
    const commandSuggestions = commands
      .map(cmd => cmd.name)
      .filter(name => name.startsWith(lastPart))
      .sort();
    
    result = { suggestions: commandSuggestions, replacement: lastPart };
  } else {
    result = await autocompleteFilePath(lastPart);
  }

  if (result.suggestions.length > 1) {
    showSuggestions(result.suggestions);
  } else {
    hideSuggestions();
  }

  return result;
}

async function autocompleteFilePath(partial: string): Promise<{ suggestions: string[]; replacement: string }> {
  const fs = terminal.getFilesystem();
  const cwd = fs.getCwd();

  try {
    let searchDir: string;
    let prefix: string;

    if (partial.includes('/')) {
      const lastSlash = partial.lastIndexOf('/');
      const dirPart = partial.slice(0, lastSlash + 1);
      prefix = partial.slice(lastSlash + 1);
      
      if (partial.startsWith('/')) {
        searchDir = dirPart || '/';
      } else {
        searchDir = fs.resolvePath(dirPart || '.', cwd);
      }
    } else {
      searchDir = cwd;
      prefix = partial;
    }

    if (!(await fs.exists(searchDir)) || !(await fs.isDirectory(searchDir))) {
      return { suggestions: [], replacement: partial };
    }

    const entries = await fs.readDir(searchDir);
    const matches: string[] = [];

    for (const entry of entries) {
      if (entry.startsWith(prefix)) {
        const fullPath = searchDir === '/' ? `/${entry}` : `${searchDir}/${entry}`;
        const isDir = await fs.isDirectory(fullPath);
        
        let displayPath: string;
        if (partial.includes('/')) {
          const lastSlash = partial.lastIndexOf('/');
          const dirPart = partial.slice(0, lastSlash + 1);
          displayPath = dirPart + entry + (isDir ? '/' : '');
        } else {
          displayPath = entry + (isDir ? '/' : '');
        }
        
        matches.push(displayPath);
      }
    }

    return { suggestions: matches.sort(), replacement: partial };
  } catch (error) {
    return { suggestions: [], replacement: partial };
  }
}

function handleInterrupt() {
  appendLine({
    id: generateId(),
    type: 'output',
    content: '^C',
    timestamp: new Date(),
  });
}

function showSuggestions(items: string[]) {
  suggestions.value = items;
}

function hideSuggestions() {
  suggestions.value = [];
}

function clearTerminal() {
  outputLines.value = [];
  terminal.clearLines();
}

function mountIntroSection() {
  if (outputRef.value) {
    const introSlot = outputRef.value.getIntroSlot();
    if (introSlot) {
      const introApp = createApp(IntroSection, {
        onComplete: () => {
          // Intro animation is complete
        }
      });
      introApp.mount(introSlot);
    }
  }
}

async function initializeDemoFiles() {
  const fs = terminal.getFilesystem();
  
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
    
    const readme = `Welcome to WCLI - Web Command Line Interface!

This is a fully-featured web-based terminal simulator built with TypeScript, Vue, and Vite.

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

onMounted(async () => {
  preventPinchZoom();
  
  await terminal.initialize();
  
  registerBuiltInCommands(terminal.getExecutor());
  
  const helpCommand = terminal.getExecutor().getCommand('help');
  if (helpCommand) {
    const originalExecute = helpCommand.execute;
    helpCommand.execute = async (args, options) => {
      (options as any).commands = terminal.getExecutor().getAllCommands();
      return originalExecute.call(helpCommand, args, options);
    };
  }
  
  terminal.onOutput((line: TerminalLine) => {
    appendLine(line);
    updatePrompt();
  });
  
  await initializeDemoFiles();
  mountIntroSection();
  
  updatePrompt();
  
  (window as any).terminal = terminal;
});
</script>

<style scoped>
.terminal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

