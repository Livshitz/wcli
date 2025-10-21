import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFilesystem } from '../../src/core/Filesystem';
import { CommandExecutor } from '../../src/core/CommandExecutor';
import type { Command, CommandOptions, CommandResult } from '../../src/types';

describe('CommandExecutor', () => {
  let fs: VirtualFilesystem;
  let executor: CommandExecutor;

  beforeEach(() => {
    fs = new VirtualFilesystem();
    executor = new CommandExecutor(fs);
  });

  // Mock command for testing
  const createMockCommand = (name: string, handler: (args: string[], options: CommandOptions) => Promise<CommandResult>): Command => ({
    name,
    description: `Mock ${name} command`,
    usage: name,
    execute: handler,
  });

  describe('command registration', () => {
    it('should register and retrieve commands', () => {
      const cmd = createMockCommand('test', async () => ({ exitCode: 0 }));
      executor.registerCommand(cmd);
      
      const retrieved = executor.getCommand('test');
      expect(retrieved).toBe(cmd);
    });

    it('should get all commands', () => {
      const cmd1 = createMockCommand('test1', async () => ({ exitCode: 0 }));
      const cmd2 = createMockCommand('test2', async () => ({ exitCode: 0 }));
      
      executor.registerCommand(cmd1);
      executor.registerCommand(cmd2);
      
      const all = executor.getAllCommands();
      expect(all).toHaveLength(2);
      expect(all).toContain(cmd1);
      expect(all).toContain(cmd2);
    });
  });

  describe('simple command execution', () => {
    it('should execute a simple command', async () => {
      const cmd = createMockCommand('echo', async (args, options) => {
        await options.stdout.write(args.join(' ') + '\n');
        return { exitCode: 0 };
      });
      
      executor.registerCommand(cmd);
      const result = await executor.execute('echo hello world');
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toBe('hello world\n');
    });

    it('should return error for unknown command', async () => {
      const result = await executor.execute('unknowncommand');
      expect(result.exitCode).toBe(127);
      expect(result.error).toContain('Command not found');
    });

    it('should handle command errors', async () => {
      const cmd = createMockCommand('fail', async () => {
        throw new Error('Command failed');
      });
      
      executor.registerCommand(cmd);
      const result = await executor.execute('fail');
      
      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('Command failed');
    });
  });

  describe('piping', () => {
    it('should pipe between commands', async () => {
      const cmd1 = createMockCommand('produce', async (args, options) => {
        await options.stdout.write('test output');
        return { exitCode: 0 };
      });
      
      const cmd2 = createMockCommand('consume', async (args, options) => {
        const input = await options.stdin.readAll();
        await options.stdout.write(`consumed: ${input}`);
        return { exitCode: 0 };
      });
      
      executor.registerCommand(cmd1);
      executor.registerCommand(cmd2);
      
      const result = await executor.execute('produce | consume');
      expect(result.exitCode).toBe(0);
      expect(result.output).toBe('consumed: test output');
    });
  });

  describe('operators', () => {
    it('should handle && operator', async () => {
      let executed = false;
      
      const cmd1 = createMockCommand('first', async () => ({ exitCode: 0 }));
      const cmd2 = createMockCommand('second', async () => {
        executed = true;
        return { exitCode: 0 };
      });
      
      executor.registerCommand(cmd1);
      executor.registerCommand(cmd2);
      
      await executor.execute('first && second');
      expect(executed).toBe(true);
    });

    it('should skip second command on && failure', async () => {
      let executed = false;
      
      const cmd1 = createMockCommand('first', async () => ({ exitCode: 1 }));
      const cmd2 = createMockCommand('second', async () => {
        executed = true;
        return { exitCode: 0 };
      });
      
      executor.registerCommand(cmd1);
      executor.registerCommand(cmd2);
      
      await executor.execute('first && second');
      expect(executed).toBe(false);
    });

    it('should handle || operator', async () => {
      let executed = false;
      
      const cmd1 = createMockCommand('first', async () => ({ exitCode: 1 }));
      const cmd2 = createMockCommand('second', async () => {
        executed = true;
        return { exitCode: 0 };
      });
      
      executor.registerCommand(cmd1);
      executor.registerCommand(cmd2);
      
      await executor.execute('first || second');
      expect(executed).toBe(true);
    });
  });

  describe('redirection', () => {
    it('should redirect output to file', async () => {
      const cmd = createMockCommand('echo', async (args, options) => {
        await options.stdout.write(args.join(' '));
        return { exitCode: 0 };
      });
      
      executor.registerCommand(cmd);
      await executor.execute('echo test > output.txt');
      
      const content = await fs.readFile('/output.txt');
      expect(content).toBe('test');
    });

    it('should append to file', async () => {
      await fs.writeFile('/output.txt', 'first\n');
      
      const cmd = createMockCommand('echo', async (args, options) => {
        await options.stdout.write(args.join(' '));
        return { exitCode: 0 };
      });
      
      executor.registerCommand(cmd);
      await executor.execute('echo second >> output.txt');
      
      const content = await fs.readFile('/output.txt');
      expect(content).toBe('first\nsecond');
    });
  });

  describe('environment variables', () => {
    it('should set and get environment variables', () => {
      executor.setEnv('TEST_VAR', 'test value');
      expect(executor.getEnv('TEST_VAR')).toBe('test value');
    });

    it('should pass environment to commands', async () => {
      executor.setEnv('CUSTOM', 'value');
      
      const cmd = createMockCommand('envtest', async (args, options) => {
        await options.stdout.write(options.env.CUSTOM || 'not found');
        return { exitCode: 0 };
      });
      
      executor.registerCommand(cmd);
      const result = await executor.execute('envtest');
      
      expect(result.output).toBe('value');
    });
  });
});

