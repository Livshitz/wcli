import { describe, it, expect } from 'vitest';
import { PathResolver } from '../../src/utils/PathResolver';

describe('PathResolver', () => {
  describe('normalize', () => {
    it('should normalize simple paths', () => {
      expect(PathResolver.normalize('/foo/bar')).toBe('/foo/bar');
      expect(PathResolver.normalize('/foo/bar/')).toBe('/foo/bar');
      expect(PathResolver.normalize('/')).toBe('/');
    });

    it('should handle . and .. in paths', () => {
      expect(PathResolver.normalize('/foo/./bar')).toBe('/foo/bar');
      expect(PathResolver.normalize('/foo/../bar')).toBe('/bar');
      expect(PathResolver.normalize('/foo/bar/..')).toBe('/foo');
    });

    it('should handle multiple slashes', () => {
      expect(PathResolver.normalize('/foo//bar')).toBe('/foo/bar');
      expect(PathResolver.normalize('///foo/bar')).toBe('/foo/bar');
    });

    it('should handle empty and edge cases', () => {
      expect(PathResolver.normalize('')).toBe('/');
      expect(PathResolver.normalize('/.')).toBe('/');
      expect(PathResolver.normalize('/..')).toBe('/');
    });
  });

  describe('resolve', () => {
    it('should resolve absolute paths', () => {
      expect(PathResolver.resolve('/foo/bar', '/home')).toBe('/foo/bar');
      expect(PathResolver.resolve('/test', '/any/path')).toBe('/test');
    });

    it('should resolve relative paths', () => {
      expect(PathResolver.resolve('bar', '/foo')).toBe('/foo/bar');
      expect(PathResolver.resolve('./bar', '/foo')).toBe('/foo/bar');
      expect(PathResolver.resolve('../bar', '/foo/baz')).toBe('/foo/bar');
    });

    it('should handle relative paths from root', () => {
      expect(PathResolver.resolve('foo', '/')).toBe('/foo');
      expect(PathResolver.resolve('./foo', '/')).toBe('/foo');
    });
  });

  describe('dirname', () => {
    it('should return parent directory', () => {
      expect(PathResolver.dirname('/foo/bar')).toBe('/foo');
      expect(PathResolver.dirname('/foo')).toBe('/');
      expect(PathResolver.dirname('/')).toBe('/');
    });

    it('should handle nested paths', () => {
      expect(PathResolver.dirname('/foo/bar/baz')).toBe('/foo/bar');
      expect(PathResolver.dirname('/a/b/c/d')).toBe('/a/b/c');
    });
  });

  describe('basename', () => {
    it('should return filename', () => {
      expect(PathResolver.basename('/foo/bar')).toBe('bar');
      expect(PathResolver.basename('/foo/bar.txt')).toBe('bar.txt');
      expect(PathResolver.basename('/foo')).toBe('foo');
    });

    it('should handle root', () => {
      expect(PathResolver.basename('/')).toBe('');
    });
  });

  describe('join', () => {
    it('should join path segments', () => {
      expect(PathResolver.join('/foo', 'bar')).toBe('/foo/bar');
      expect(PathResolver.join('/foo', 'bar', 'baz')).toBe('/foo/bar/baz');
      expect(PathResolver.join('/', 'foo')).toBe('/foo');
    });

    it('should handle relative segments', () => {
      expect(PathResolver.join('/foo', '../bar')).toBe('/bar');
      expect(PathResolver.join('/foo', './bar')).toBe('/foo/bar');
    });
  });

  describe('isAbsolute', () => {
    it('should detect absolute paths', () => {
      expect(PathResolver.isAbsolute('/foo')).toBe(true);
      expect(PathResolver.isAbsolute('/')).toBe(true);
      expect(PathResolver.isAbsolute('/foo/bar')).toBe(true);
    });

    it('should detect relative paths', () => {
      expect(PathResolver.isAbsolute('foo')).toBe(false);
      expect(PathResolver.isAbsolute('./foo')).toBe(false);
      expect(PathResolver.isAbsolute('../foo')).toBe(false);
    });
  });

  describe('relative', () => {
    it('should compute relative paths', () => {
      expect(PathResolver.relative('/foo/bar', '/foo/baz')).toBe('../baz');
      expect(PathResolver.relative('/foo', '/foo/bar')).toBe('bar');
      expect(PathResolver.relative('/foo/bar', '/foo/bar')).toBe('.');
    });

    it('should handle different directory levels', () => {
      expect(PathResolver.relative('/a/b/c', '/a/d/e')).toBe('../../d/e');
      expect(PathResolver.relative('/a', '/b/c')).toBe('../b/c');
    });
  });
});

