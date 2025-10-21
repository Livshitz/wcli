# Setting Up WCLI in a New Vue Project

This is a reference example for setting up WCLI in a new Vue 3 + TypeScript + Vite project.

## 1. Create a New Project

```bash
# Using Vite
npm create vite@latest my-terminal-app -- --template vue-ts
cd my-terminal-app
npm install
```

## 2. Install WCLI

### From NPM (when published)
```bash
npm install wcli
```

### From Local Source (development)
```bash
# If wcli is in a parent or sibling directory
npm install file:../wcli

# Or use npm link
cd ../wcli
npm link
cd ../my-terminal-app
npm link wcli
```

## 3. TypeScript Configuration

Create or update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "types": ["vite/client"]
  },
  "include": ["src/**/*", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

## 4. Vite Configuration

Your `vite.config.ts` should look like:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

## 5. Package.json

Make sure Vue is installed:

```json
{
  "name": "my-terminal-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.22",
    "wcli": "^2.1.2"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.1",
    "typescript": "^5.0.0",
    "vite": "^7.1.10"
  }
}
```

## 6. Create Your App Component

`src/App.vue`:

```vue
<template>
  <div class="app">
    <TerminalComponent :terminal="terminal" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Terminal, applyTheme } from 'wcli';
import { TerminalComponent } from 'wcli/components';
import { darkTheme } from 'wcli/themes';
import type { Command } from 'wcli';
import 'wcli/styles/terminal.css';

// Define custom commands
const helloCommand: Command = {
  name: 'hello',
  description: 'Say hello',
  usage: 'hello [name]',
  async execute(args, options) {
    const name = args[0] || 'World';
    await options.stdout.write(`Hello, ${name}!\n`);
    return { exitCode: 0 };
  },
};

// Create terminal instance
const terminal = new Terminal({
  commands: [helloCommand],
  includeDefaultCommands: true,
  env: {
    USER: 'user',
    HOME: '/home/user',
  },
});

onMounted(async () => {
  applyTheme(darkTheme);
  await terminal.initialize();
  await terminal.executeCommand('echo "Welcome to my terminal app!"');
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  width: 100vw;
  height: 100vh;
}
</style>
```

## 7. Update Main Entry Point

`src/main.ts`:

```typescript
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

## 8. Run Your App

```bash
npm run dev
```

Open your browser to `http://localhost:5173` (or the URL shown in terminal).

## Common Issues

### Module Not Found Error

If you see "Cannot find module 'wcli'":

1. Check that wcli is in your `package.json` dependencies
2. Run `npm install` again
3. Check the wcli package has been built (should have a `dist/` folder)
4. Restart your IDE/editor

### TypeScript Errors

If you see TypeScript errors:

1. Make sure wcli is built: `cd node_modules/wcli && npm run build`
2. Try `skipLibCheck: true` in tsconfig.json
3. Restart the TypeScript language server (in VSCode: Cmd+Shift+P → "Restart TypeScript Server")

### Styles Not Loading

Make sure you import the CSS:
```typescript
import 'wcli/styles/terminal.css';
```

## Next Steps

- Explore the [WCLI documentation](../../docs/)
- Check out more [examples](../)
- Read about [custom commands](../custom-commands/)
- Learn about [themes](../../src/themes/)

