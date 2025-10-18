# Running WCLI Examples

This guide shows you how to run the various WCLI examples.

## Quick Start: Demo App

The easiest way to see WCLI in action as a library:

```bash
# From the wcli root directory
cd examples/demo-app

# Install dependencies
bun install  # or npm install

# Run the dev server
bun run dev  # or npm run dev
```

Open `http://localhost:3001` in your browser.

## Running the Main WCLI App

To run WCLI as a standalone application:

```bash
# From the wcli root directory
bun install  # or npm install
bun run dev  # or npm run dev
```

Open `http://localhost:3000` in your browser.

## Example Projects

### 1. Demo App (`examples/demo-app/`)

**What it shows:** Basic usage of WCLI as a library

**How to run:**
```bash
cd examples/demo-app
bun install
bun run dev
```

**Features:**
- Simple drop-in terminal component
- All default commands included
- IndexedDB persistence

### 2. Basic Usage (`examples/basic/`)

**What it shows:** Minimal HTML example

This is a reference implementation showing the simplest possible usage. To use it in a real project:

1. Install WCLI: `npm install wcli vue`
2. Copy the code from `examples/basic/index.html`
3. Set up your build tool (Vite, Webpack, etc.)

### 3. Custom Storage (`examples/custom-storage/`)

**What it shows:** How to implement a custom storage adapter

This is a code reference showing:
- Implementing `IStorageAdapter` interface
- Using API backend for storage
- Multi-user support

**To use:** Copy the `APIStorageAdapter` class into your project and adapt it to your API.

### 4. Custom Commands (`examples/custom-commands/`)

**What it shows:** Adding custom commands and lifecycle hooks

This is a code reference showing:
- Creating custom commands
- Using lifecycle hooks
- Command registration

**To use:** Copy the command definitions into your project.

## Creating Your Own Project

### Option 1: Start from Demo App

```bash
# Copy the demo app
cp -r examples/demo-app my-terminal-app
cd my-terminal-app

# Install dependencies
bun install

# Start customizing!
```

### Option 2: Fresh Vue 3 Project

```bash
# Create new Vue 3 project
npm create vite@latest my-terminal-app -- --template vue-ts
cd my-terminal-app

# Install WCLI
npm install wcli

# Use in your app
```

In your `App.vue`:
```vue
<script setup>
import { TerminalComponent } from 'wcli/components';
</script>

<template>
  <TerminalComponent />
</template>
```

### Option 3: Custom Configuration

```typescript
import { Terminal } from 'wcli';
import { TerminalComponent } from 'wcli/components';
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
});

await terminal.initialize();
```

## Troubleshooting

### "Module not found: wcli"

Make sure you've installed WCLI:
```bash
npm install wcli
```

### "Cannot find module '@/types'"

If you're using the source directly (not the npm package), make sure your build tool is configured with the `@` alias:

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
  },
}
```

### TypeScript errors

Make sure you have Vue 3 types installed:
```bash
npm install --save-dev @vue/tsconfig
```

## Need Help?

- Check the [README](./README.md) for full API documentation
- See [MIGRATION.md](./MIGRATION.md) for v1 → v2 migration
- Open an issue on GitHub

## Next Steps

Once you have an example running:

1. **Explore commands** - Try `help` to see all available commands
2. **Customize** - Add your own commands, themes, or storage
3. **Build** - Create your terminal-based application
4. **Share** - Publish your custom terminal app!

