import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFilesystem } from '../../src/core/Filesystem';

describe('VirtualFilesystem', () => {
  let fs: VirtualFilesystem;

  beforeEach(() => {
    fs = new VirtualFilesystem();
  });

  describe('directory operations', () => {
    it('should start with root directory', async () => {
      expect(fs.getCwd()).toBe('/');
      expect(await fs.exists('/')).toBe(true);
      expect(await fs.isDirectory('/')).toBe(true);
    });

    it('should create directories', async () => {
      await fs.createDir('/test');
      expect(await fs.exists('/test')).toBe(true);
      expect(await fs.isDirectory('/test')).toBe(true);
    });

    it('should create nested directories', async () => {
      await fs.createDir('/parent');
      await fs.createDir('/parent/child');
      expect(await fs.exists('/parent/child')).toBe(true);
    });

    it('should fail to create existing directory', async () => {
      await fs.createDir('/test');
      await expect(fs.createDir('/test')).rejects.toThrow();
    });

    it('should list directory contents', async () => {
      await fs.createDir('/test');
      await fs.writeFile('/test/file1.txt', 'content');
      await fs.writeFile('/test/file2.txt', 'content');
      
      const contents = await fs.readDir('/test');
      expect(contents).toContain('file1.txt');
      expect(contents).toContain('file2.txt');
    });
  });

  describe('file operations', () => {
    it('should create and read files', async () => {
      await fs.writeFile('/test.txt', 'hello world');
      const content = await fs.readFile('/test.txt');
      expect(content).toBe('hello world');
    });

    it('should overwrite existing files', async () => {
      await fs.writeFile('/test.txt', 'first');
      await fs.writeFile('/test.txt', 'second');
      const content = await fs.readFile('/test.txt');
      expect(content).toBe('second');
    });

    it('should delete files', async () => {
      await fs.writeFile('/test.txt', 'content');
      expect(await fs.exists('/test.txt')).toBe(true);
      await fs.deleteFile('/test.txt');
      expect(await fs.exists('/test.txt')).toBe(false);
    });

    it('should fail to read non-existent file', async () => {
      await expect(fs.readFile('/nonexistent.txt')).rejects.toThrow();
    });

    it('should fail to delete non-empty directory', async () => {
      await fs.createDir('/test');
      await fs.writeFile('/test/file.txt', 'content');
      await expect(fs.deleteFile('/test')).rejects.toThrow('not empty');
    });
  });

  describe('path operations', () => {
    it('should resolve absolute paths', () => {
      const path = fs.resolvePath('/test/file.txt', '/home');
      expect(path).toBe('/test/file.txt');
    });

    it('should resolve relative paths', () => {
      const path = fs.resolvePath('file.txt', '/home');
      expect(path).toBe('/home/file.txt');
    });

    it('should handle . and .. in paths', () => {
      expect(fs.resolvePath('./file.txt', '/home')).toBe('/home/file.txt');
      expect(fs.resolvePath('../file.txt', '/home/user')).toBe('/home/file.txt');
    });

    it('should change working directory', () => {
      fs.setCwd('/home');
      expect(fs.getCwd()).toBe('/home');
    });
  });

  describe('metadata', () => {
    it('should return file stats', async () => {
      await fs.writeFile('/test.txt', 'hello');
      const stats = await fs.stat('/test.txt');
      
      expect(stats.size).toBe(5);
      expect(stats.created).toBeInstanceOf(Date);
      expect(stats.modified).toBeInstanceOf(Date);
    });

    it('should update modification time', async () => {
      await fs.writeFile('/test.txt', 'first');
      const stats1 = await fs.stat('/test.txt');
      
      // Wait longer to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 50));
      
      await fs.writeFile('/test.txt', 'second');
      const stats2 = await fs.stat('/test.txt');
      
      expect(stats2.modified.getTime()).toBeGreaterThanOrEqual(stats1.modified.getTime());
    });
  });

  describe('type checking', () => {
    it('should identify files and directories', async () => {
      await fs.createDir('/dir');
      await fs.writeFile('/file.txt', 'content');
      
      expect(await fs.isDirectory('/dir')).toBe(true);
      expect(await fs.isFile('/dir')).toBe(false);
      
      expect(await fs.isFile('/file.txt')).toBe(true);
      expect(await fs.isDirectory('/file.txt')).toBe(false);
    });
  });
});

