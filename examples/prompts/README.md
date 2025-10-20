# User Prompts and Input Collection

WCLI supports interactive user prompts, allowing commands to request input from users during execution.

## Overview

The prompt system allows commands to:
- Ask for user input with custom messages
- Validate input before accepting it
- Mask input (for passwords)
- Provide default values
- Handle cancellation (Ctrl+C)

## Basic Usage

### Simple Prompt

```typescript
const answer = await options.prompt('What is your name?');
```

### Prompt with Options

```typescript
const username = await options.prompt({
  message: 'Username:',
  defaultValue: 'guest',
  password: false, // Set to true for password fields
  validate: (input) => {
    if (!input.trim()) {
      return 'Username cannot be empty';
    }
    return true; // Valid input
  }
});
```

## Prompt Options

| Option | Type | Description |
|--------|------|-------------|
| `message` | `string` | The prompt message to display |
| `defaultValue` | `string` | Optional default value (used when user presses Enter without typing) |
| `password` | `boolean` | If true, input will be completely invisible (like terminal password prompts) |
| `validate` | `function` | Optional validation function |

**Note:** When a `defaultValue` is provided, pressing Enter without typing anything will use the default value. This is useful for confirmation prompts like `(Y/n)` where uppercase indicates the default.

## Validation

The `validate` function can return:
- `true` - Input is valid
- `false` - Input is invalid (generic error)
- `string` - Input is invalid with custom error message

```typescript
validate: (input) => {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  if (num < 1 || num > 10) {
    return 'Number must be between 1 and 10';
  }
  return true;
}
```

## Built-in Commands

WCLI includes several commands demonstrating prompt usage:

### `login`
Interactive login with username and password:
```bash
login
```

### `survey`
Multi-question survey:
```bash
survey
```

### `ask`
Ask a simple question:
```bash
ask "What is your favorite color?"
```

### `confirm`
Yes/no confirmation (defaults to "yes"):
```bash
confirm "Do you want to continue?"
# Pressing Enter without typing will default to "yes"
```

## Creating Custom Commands with Prompts

```typescript
import type { Command, CommandOptions, CommandResult } from 'wcli';

export const myCommand: Command = {
  name: 'mycommand',
  description: 'Example command with prompts',
  usage: 'mycommand',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { stdout, prompt } = options;

    if (!prompt) {
      await stdout.write('Error: Prompt not available\n');
      return { exitCode: 1 };
    }

    try {
      // Ask for input
      const name = await prompt('What is your name?');
      
      // Ask for confirmation with default value
      const shouldContinue = await prompt({
        message: 'Continue? (Y/n)',
        defaultValue: 'y',
        validate: (input) => {
          const normalized = input.toLowerCase().trim();
          if (normalized !== 'y' && normalized !== 'n' && normalized !== '') {
            return 'Please answer y or n';
          }
          return true;
        }
      });
      
      if (shouldContinue.toLowerCase() !== 'y') {
        await stdout.write('Cancelled.\n');
        return { exitCode: 1 };
      }
      
      // Ask for password
      const password = await prompt({
        message: 'Password:',
        password: true,
        validate: (input) => {
          if (input.length < 6) {
            return 'Password must be at least 6 characters';
          }
          return true;
        }
      });
      
      // Process the inputs
      await stdout.write(`Hello, ${name}!\n`);
      
      return { exitCode: 0 };
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt cancelled') {
        await stdout.write('Cancelled.\n');
        return { exitCode: 130 };
      }
      throw error;
    }
  }
};
```

## Error Handling

Prompts can be cancelled by the user with Ctrl+C. This throws an error with the message "Prompt cancelled". Always handle this in your commands:

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

## Advanced Usage

### Multiple Prompts in Sequence

```typescript
const name = await prompt('Name:');
const email = await prompt('Email:');
const age = await prompt({
  message: 'Age:',
  validate: (input) => {
    const num = parseInt(input, 10);
    return !isNaN(num) && num > 0 ? true : 'Please enter a valid age';
  }
});
```

### Conditional Prompts

```typescript
const hasAccount = await prompt({
  message: 'Do you have an account? (y/n)',
  validate: (input) => {
    const normalized = input.toLowerCase();
    return normalized === 'y' || normalized === 'n' 
      ? true 
      : 'Please answer y or n';
  }
});

if (hasAccount.toLowerCase() === 'y') {
  const username = await prompt('Username:');
  const password = await prompt({ message: 'Password:', password: true });
  // Login logic...
} else {
  // Registration logic...
}
```

## Programmatic Access

You can also access the PromptManager directly from the Terminal instance:

```typescript
import { Terminal } from 'wcli';

const terminal = new Terminal();
await terminal.initialize();

const promptManager = terminal.getPromptManager();

// Request a prompt
const answer = await promptManager.prompt({
  message: 'Your answer:',
  defaultValue: 'default'
});

// Check if there's an active prompt
if (promptManager.hasActivePrompt()) {
  console.log('A prompt is active');
}

// Get current prompt request
const currentPrompt = promptManager.getCurrentPrompt();
```

## Best Practices

1. **Always check if prompt is available**: Not all environments may support prompts
2. **Handle cancellation**: Users should be able to cancel prompts with Ctrl+C
3. **Provide clear messages**: Make prompt messages descriptive
4. **Validate input**: Use the validate function to ensure data quality
5. **Use password mode for sensitive data**: Always mask passwords
6. **Provide defaults when appropriate**: Make common values easy to select
7. **Use appropriate exit codes**: Return 130 for cancelled operations

## Keyboard Shortcuts

When a prompt is active:
- `Enter` - Submit the current input
- `Ctrl+C` - Cancel the prompt
- All standard terminal editing shortcuts still work (Ctrl+A, Ctrl+E, etc.)

