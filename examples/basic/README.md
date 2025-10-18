# Basic WCLI Example

This example demonstrates the simplest way to use WCLI in your project.

## Installation

```bash
npm install wcli vue
```

## Usage

```javascript
import { createApp } from 'vue';
import { TerminalComponent } from 'wcli/components';

const app = createApp({
  components: { TerminalComponent },
  template: '<TerminalComponent />'
});

app.mount('#app');
```

## Features Included

- All default commands (ls, cd, cat, etc.)
- IndexedDB persistence
- Command history
- Tab autocomplete
- Default theme

This is the easiest way to get started with WCLI!

