# WCLI Prompt System Implementation

## Overview

The WCLI prompt system provides interactive user input collection capabilities for commands. Commands can now ask for user input with custom messages, validation, password masking, and default values.

## What Was Added

### Core Components

1. **PromptManager** (`src/core/PromptManager.ts`)
   - Manages prompt requests and responses
   - Handles validation and error states
   - Provides callbacks for UI integration

2. **Updated Terminal** (`src/core/Terminal.ts`)
   - Integrated PromptManager
   - Exposed `getPromptManager()` method

3. **Updated CommandExecutor** (`src/core/CommandExecutor.ts`)
   - Passes prompt function to commands via options
   - Binds PromptManager to command execution context

4. **Updated CommandOptions** (`src/types/index.ts`)
   - Added optional `prompt` function
   - Added `PromptOptions` interface

5. **Updated TerminalComponent** (`src/components/TerminalComponent.vue`)
   - Handles prompt display and input collection
   - Supports password masking in output
   - Manages prompt/normal mode switching
   - Handles Ctrl+C cancellation

### New Commands

Four new interactive commands demonstrating the prompt system:

1. **login** - Interactive login with username/password validation
2. **survey** - Multi-question survey with various input types
3. **ask** - Simple question prompt
4. **confirm** - Yes/no confirmation dialog

### Documentation

1. **examples/prompts/README.md** - Comprehensive usage guide
2. **examples/prompts/example.ts** - Three detailed example commands
3. **Updated README.md** - Added prompt system documentation

## Usage

### Basic Usage

```typescript
import type { Command } from 'wcli';

const myCommand: Command = {
  name: 'mycommand',
  description: 'Example with prompt',
  usage: 'mycommand',
  
  async execute(args, options) {
    const { stdout, prompt } = options;
    
    // Check if prompt is available
    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }
    
    // Simple string prompt
    const name = await prompt('What is your name?');
    
    // Prompt with options
    const email = await prompt({
      message: 'Email:',
      defaultValue: 'user@example.com',
      validate: (input) => {
        return input.includes('@') ? true : 'Invalid email';
      }
    });
    
    // Password prompt (masked in output)
    const password = await prompt({
      message: 'Password:',
      password: true,
      validate: (input) => {
        return input.length >= 8 ? true : 'Password too short';
      }
    });
    
    await stdout.write(`Welcome, ${name}!\n`);
    return { exitCode: 0 };
  }
};
```

### Prompt Options

| Option | Type | Description |
|--------|------|-------------|
| `message` | `string` | The prompt message to display (required) |
| `defaultValue` | `string` | Optional default value (used when Enter is pressed with empty input) |
| `password` | `boolean` | If true, input is completely invisible (like macOS terminal) |
| `validate` | `function` | Validation function returning `true` or error message |

### Validation

The validate function receives the input and returns:
- `true` - Input is valid
- `false` - Input is invalid (generic error)
- `string` - Input is invalid with custom error message

```typescript
validate: (input) => {
  if (!input.trim()) {
    return 'Input cannot be empty';
  }
  if (input.length < 3) {
    return 'Input must be at least 3 characters';
  }
  return true;
}
```

### Error Handling

Always handle cancellation (Ctrl+C):

```typescript
try {
  const answer = await prompt('Question?');
  // Process answer...
} catch (error) {
  if (error instanceof Error && error.message === 'Prompt cancelled') {
    await stdout.write('Operation cancelled.\n');
    return { exitCode: 130 }; // Standard cancellation exit code
  }
  throw error;
}
```

## Try It Out

Start the dev server and try these commands:

```bash
npm run dev

# Then in the terminal:
login        # Interactive login
survey       # Multi-question survey
ask "What is your favorite color?"
confirm "Do you want to continue?"
```

## Architecture

### Flow Diagram

```
Command Execute
    ↓
Call options.prompt()
    ↓
PromptManager.prompt()
    ↓
Emit 'onPrompt' event
    ↓
TerminalComponent catches event
    ↓
Switch to prompt mode
    ↓
User types input + Enter
    ↓
TerminalComponent.handleSubmit()
    ↓
PromptManager.respond()
    ↓
Promise resolves
    ↓
Command continues
```

### Key Features

1. **Non-blocking**: Uses promises for async input collection
2. **Validation**: Input can be validated before accepting
3. **Cancellation**: Ctrl+C cancels prompts gracefully
4. **Password mode**: Sensitive input can be masked
5. **Default values**: Pre-filled values can be provided
6. **Error handling**: Clear error messages for validation failures

## Password Input

The password input feature mimics macOS terminal/zsh behavior:
- **While typing**: Input is completely invisible (not even dots or asterisks)
- **Cursor remains visible**: So users know they're typing
- **After submission**: No value is shown in the output (just the prompt message)
- **Not saved to history**: Password prompts don't add entries to command history

This matches the exact behavior of password prompts in macOS terminal and other Unix-like systems.

## Default Values

When a `defaultValue` is provided:
- Pressing Enter without typing anything will use the default value
- Useful for confirmation prompts like `(Y/n)` where uppercase indicates the default
- The default value is pre-filled in the input field for visibility
- Users can clear it and type their own value if desired

Example:
```typescript
const answer = await prompt({
  message: 'Continue? (Y/n)',
  defaultValue: 'y',
  validate: (input) => {
    const normalized = input.toLowerCase().trim();
    return ['y', 'n'].includes(normalized) ? true : 'Please answer y or n';
  }
});
// Pressing Enter without typing will return 'y'
```

## Exported API

```typescript
import { 
  PromptManager,
  type PromptOptions,
  type PromptRequest 
} from 'wcli';

// Create prompt manager
const promptManager = new PromptManager();

// Set up handlers
promptManager.onPrompt((request) => {
  console.log('Prompt requested:', request.options.message);
});

promptManager.onPromptClear(() => {
  console.log('Prompt cleared');
});

// Request input
const answer = await promptManager.prompt({
  message: 'Your name:',
  defaultValue: 'User'
});

// Check state
const hasActive = promptManager.hasActivePrompt();
const current = promptManager.getCurrentPrompt();

// Cancel prompt
promptManager.cancel();
```

## Future Enhancements

Possible future improvements:
1. Multi-select prompts (checkboxes)
2. List selection prompts (radio buttons)
3. Progress bars during long operations
4. Colored prompt messages
5. Custom prompt themes
6. Prompt history/autocomplete
7. Autocomplete within prompts

## Testing

To test the prompt system:

```typescript
import { Terminal } from 'wcli';

const terminal = new Terminal({
  includeDefaultCommands: true
});

await terminal.initialize();

// Test basic prompt
const promptManager = terminal.getPromptManager();
promptManager.onPrompt((request) => {
  // Simulate user input
  setTimeout(() => {
    promptManager.respond('test answer');
  }, 100);
});

await terminal.executeCommand('login');
```

## Migration Guide

If you have existing commands, the prompt function is **optional** in CommandOptions, so existing code remains compatible:

```typescript
// Old command - still works
async execute(args, options) {
  await options.stdout.write('Hello!\n');
  return { exitCode: 0 };
}

// New command with prompts
async execute(args, options) {
  if (options.prompt) {
    const name = await options.prompt('Name?');
    await options.stdout.write(`Hello, ${name}!\n`);
  } else {
    await options.stdout.write('Hello!\n');
  }
  return { exitCode: 0 };
}
```

## Summary

The prompt system adds powerful interactive capabilities to WCLI while maintaining backward compatibility. Commands can now create sophisticated user experiences with forms, confirmations, and validated input collection.

