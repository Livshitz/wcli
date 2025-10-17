import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFilesystem } from '@/core/Filesystem';
import { StringInputStream, StringOutputStream } from '@/utils/Stream';
import { lsCommand } from '../src/commands/ls';
import { cdCommand } from '../src/commands/cd';
import { pwdCommand } from '../src/commands/pwd';
import { catCommand } from '../src/commands/cat';
import { echoCommand } from '../src/commands/echo';
import { grepCommand } from '../src/commands/grep';
import { mkdirCommand } from '../src/commands/mkdir';
import { touchCommand } from '../src/commands/touch';
import type { CommandOptions } from '@/types';

describe('Commands', () => {
  let fs: VirtualFilesystem;
  let stdout: StringOutputStream;
  let stderr: StringOutputStream;
  let stdin: StringInputStream;

  beforeEach(() => {
    fs = new VirtualFilesystem();
    stdout = new StringOutputStream();
    stderr = new StringOutputStream();
    stdin = new StringInputStream('');
  });

  const createOptions = (overrides: Partial<CommandOptions> = {}): CommandOptions => ({
    fs,
    cwd: fs.getCwd(),
    stdin,
    stdout,
    stderr,
    env: { HOME: '/home', PATH: '/bin', USER: 'test' },
    ...overrides,
  });

  describe('ls command', () => {
    it('should list directory contents', async () => {
      await fs.createDir('/test');
      await fs.writeFile('/test/file1.txt', '');
      await fs.writeFile('/test/file2.txt', '');

      const result = await lsCommand.execute(['/test'], createOptions());
      expect(result.exitCode).toBe(0);
      expect(stdout.getOutput()).toContain('file1.txt');
      expect(stdout.getOutput()).toContain('file2.txt');
    });

    it('should handle non-existent directory', async () => {
      const result = await lsCommand.execute(['/nonexistent'], createOptions());
      expect(result.exitCode).toBe(1);
    });
  });

  describe('cd command', () => {
    it('should change directory', async () => {
      await fs.createDir('/test');
      const result = await cdCommand.execute(['/test'], createOptions());
      expect(result.exitCode).toBe(0);
      expect(fs.getCwd()).toBe('/test');
    });

    it('should handle non-existent directory', async () => {
      const result = await cdCommand.execute(['/nonexistent'], createOptions());
      expect(result.exitCode).toBe(1);
      expect(fs.getCwd()).toBe('/'); // Should not change
    });

    it('should go to home when no args', async () => {
      await fs.createDir('/home');
      fs.setCwd('/test');
      await cdCommand.execute([], createOptions());
      expect(fs.getCwd()).toBe('/home');
    });
  });

  describe('pwd command', () => {
    it('should print working directory', async () => {
      fs.setCwd('/test/path');
      const result = await pwdCommand.execute([], createOptions());
      expect(result.exitCode).toBe(0);
      expect(stdout.getOutput()).toBe('/test/path\n');
    });
  });

  describe('cat command', () => {
    it('should read file contents', async () => {
      await fs.writeFile('/test.txt', 'hello world');
      const result = await catCommand.execute(['/test.txt'], createOptions());
      expect(result.exitCode).toBe(0);
      expect(stdout.getOutput()).toContain('hello world');
    });

    it('should read from stdin when no file specified', async () => {
      const stdinData = new StringInputStream('input data');
      const result = await catCommand.execute([], createOptions({ stdin: stdinData }));
      expect(result.exitCode).toBe(0);
      expect(stdout.getOutput()).toBe('input data');
    });

    it('should handle non-existent file', async () => {
      const result = await catCommand.execute(['/nonexistent'], createOptions());
      expect(result.exitCode).toBe(1);
    });
  });

  describe('echo command', () => {
    it('should print arguments', async () => {
      const result = await echoCommand.execute(['hello', 'world'], createOptions());
      expect(result.exitCode).toBe(0);
      expect(stdout.getOutput()).toBe('hello world\n');
    });

    it('should handle empty arguments', async () => {
      const result = await echoCommand.execute([], createOptions());
      expect(result.exitCode).toBe(0);
      expect(stdout.getOutput()).toBe('\n');
    });
  });

  describe('grep command', () => {
    it('should search for pattern in file', async () => {
      await fs.writeFile('/test.txt', 'line1\nline2\ntest line\nline4');
      const result = await grepCommand.execute(['test', '/test.txt'], createOptions());
      expect(result.exitCode).toBe(0);
      expect(stdout.getOutput()).toContain('test line');
      expect(stdout.getOutput()).not.toContain('line1');
    });

    it('should search stdin when no file specified', async () => {
      const stdinData = new StringInputStream('foo\nbar\nbaz');
      const result = await grepCommand.execute(['ba'], createOptions({ stdin: stdinData }));
      expect(result.exitCode).toBe(0);
      expect(stdout.getOutput()).toContain('bar');
      expect(stdout.getOutput()).toContain('baz');
      expect(stdout.getOutput()).not.toContain('foo');
    });
  });

  describe('mkdir command', () => {
    it('should create directory', async () => {
      const result = await mkdirCommand.execute(['/newdir'], createOptions());
      expect(result.exitCode).toBe(0);
      expect(await fs.exists('/newdir')).toBe(true);
      expect(await fs.isDirectory('/newdir')).toBe(true);
    });

    it('should handle existing directory', async () => {
      await fs.createDir('/test');
      const result = await mkdirCommand.execute(['/test'], createOptions());
      expect(result.exitCode).toBe(1);
    });

    it('should require arguments', async () => {
      const result = await mkdirCommand.execute([], createOptions());
      expect(result.exitCode).toBe(1);
    });
  });

  describe('touch command', () => {
    it('should create empty file', async () => {
      const result = await touchCommand.execute(['/newfile.txt'], createOptions());
      expect(result.exitCode).toBe(0);
      expect(await fs.exists('/newfile.txt')).toBe(true);
      const content = await fs.readFile('/newfile.txt');
      expect(content).toBe('');
    });

    it('should create multiple files', async () => {
      const result = await touchCommand.execute(['/file1.txt', '/file2.txt'], createOptions());
      expect(result.exitCode).toBe(0);
      expect(await fs.exists('/file1.txt')).toBe(true);
      expect(await fs.exists('/file2.txt')).toBe(true);
    });
  });
});

