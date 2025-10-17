import { describe, it, expect } from 'vitest';
import { StringInputStream, StringOutputStream, PipeStream, EmptyInputStream } from '../../src/utils/Stream';

describe('Stream utilities', () => {
  describe('StringInputStream', () => {
    it('should read all data', async () => {
      const stream = new StringInputStream('hello world');
      const data = await stream.readAll();
      expect(data).toBe('hello world');
    });

    it('should read character by character', async () => {
      const stream = new StringInputStream('abc');
      expect(await stream.read()).toBe('a');
      expect(await stream.read()).toBe('b');
      expect(await stream.read()).toBe('c');
      expect(await stream.read()).toBe(null);
    });

    it('should handle empty string', async () => {
      const stream = new StringInputStream('');
      expect(await stream.readAll()).toBe('');
      expect(await stream.read()).toBe(null);
    });
  });

  describe('StringOutputStream', () => {
    it('should write and get output', async () => {
      const stream = new StringOutputStream();
      await stream.write('hello');
      await stream.write(' world');
      expect(stream.getOutput()).toBe('hello world');
    });

    it('should handle multiple writes', async () => {
      const stream = new StringOutputStream();
      await stream.write('a');
      await stream.write('b');
      await stream.write('c');
      expect(stream.getOutput()).toBe('abc');
    });

    it('should clear output', async () => {
      const stream = new StringOutputStream();
      await stream.write('test');
      expect(stream.getOutput()).toBe('test');
      stream.clear();
      expect(stream.getOutput()).toBe('');
    });

    it('should throw when writing after close', async () => {
      const stream = new StringOutputStream();
      await stream.close();
      await expect(stream.write('test')).rejects.toThrow('Stream is closed');
    });
  });

  describe('PipeStream', () => {
    it('should pipe data between write and read', async () => {
      const stream = new PipeStream();
      await stream.write('test');
      await stream.close();
      const data = await stream.readAll();
      expect(data).toBe('test');
    });

    it('should handle multiple writes', async () => {
      const stream = new PipeStream();
      await stream.write('hello');
      await stream.write(' ');
      await stream.write('world');
      await stream.close();
      expect(await stream.readAll()).toBe('hello world');
    });

    it('should return closed status', async () => {
      const stream = new PipeStream();
      expect(stream.isClosed()).toBe(false);
      await stream.close();
      expect(stream.isClosed()).toBe(true);
    });
  });

  describe('EmptyInputStream', () => {
    it('should always return null', async () => {
      const stream = new EmptyInputStream();
      expect(await stream.read()).toBe(null);
      expect(await stream.readAll()).toBe('');
    });
  });
});

