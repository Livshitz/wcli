# Custom Commands & Hooks Example

This example demonstrates how to add custom commands and lifecycle hooks to WCLI.

## Custom Commands

Implement the `Command` interface:

```typescript
interface Command {
  name: string;
  description: string;
  usage: string;
  execute(args: string[], options: CommandOptions): Promise<CommandResult>;
}
```

Then register them in the config:

```typescript
const terminal = new Terminal({
  commands: [deployCommand, statusCommand],
  includeDefaultCommands: true, // Optional: keep built-in commands
});
```

## Lifecycle Hooks

Hook into command execution for logging, analytics, validation, etc:

```typescript
const terminal = new Terminal({
  hooks: {
    beforeCommand: async (input) => {
      // Runs before every command
    },
    afterCommand: async (input, output) => {
      // Runs after successful command
    },
    commandError: async (input, error) => {
      // Runs when command fails
    },
  },
});
```

## Available Hooks

- `beforeInit` - Before terminal initialization
- `afterInit` - After terminal initialization
- `beforeCommand` - Before command execution
- `afterCommand` - After successful command execution
- `commandError` - When command execution fails
- `filesystemChange` - When filesystem is modified
- `sessionSave` - When session is saved
- `sessionLoad` - When session is loaded

## Use Cases

- Custom business logic commands
- Integration with APIs
- Analytics and monitoring
- Access control and validation
- Error reporting
- Audit logging

