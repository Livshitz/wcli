import { describe, it, expect } from 'vitest';
import { CommandParser } from '../../src/core/CommandParser';

describe('CommandParser', () => {
  const parser = new CommandParser();

  describe('simple commands', () => {
    it('should parse basic command', () => {
      const result = parser.parse('ls');
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].command).toBe('ls');
      expect(result.commands[0].args).toEqual([]);
    });

    it('should parse command with arguments', () => {
      const result = parser.parse('ls /home /bin');
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].command).toBe('ls');
      expect(result.commands[0].args).toEqual(['/home', '/bin']);
    });

    it('should parse command with flags', () => {
      const result = parser.parse('ls -l -a');
      expect(result.commands[0].flags).toHaveProperty('l', true);
      expect(result.commands[0].flags).toHaveProperty('a', true);
    });

    it('should parse flags with values', () => {
      const result = parser.parse('command --name=value');
      expect(result.commands[0].flags).toHaveProperty('name', 'value');
    });
  });

  describe('operators', () => {
    it('should parse pipe operator', () => {
      const result = parser.parse('ls | grep test');
      expect(result.commands).toHaveLength(2);
      expect(result.operators).toEqual(['|']);
      expect(result.commands[0].command).toBe('ls');
      expect(result.commands[1].command).toBe('grep');
    });

    it('should parse multiple pipes', () => {
      const result = parser.parse('ls | grep txt | cat');
      expect(result.commands).toHaveLength(3);
      expect(result.operators).toEqual(['|', '|']);
    });

    it('should parse && operator', () => {
      const result = parser.parse('mkdir test && cd test');
      expect(result.commands).toHaveLength(2);
      expect(result.operators).toEqual(['&&']);
    });

    it('should parse || operator', () => {
      const result = parser.parse('cd invalid || echo failed');
      expect(result.commands).toHaveLength(2);
      expect(result.operators).toEqual(['||']);
    });

    it('should parse semicolon operator', () => {
      const result = parser.parse('echo one ; echo two');
      expect(result.commands).toHaveLength(2);
      expect(result.operators).toEqual([';']);
    });
  });

  describe('redirection', () => {
    it('should parse output redirection', () => {
      const result = parser.parse('echo test > file.txt');
      expect(result.redirects).toHaveLength(1);
      expect(result.redirects[0].type).toBe('>');
      expect(result.redirects[0].target).toBe('file.txt');
    });

    it('should parse append redirection', () => {
      const result = parser.parse('echo test >> file.txt');
      expect(result.redirects).toHaveLength(1);
      expect(result.redirects[0].type).toBe('>>');
    });

    it('should parse input redirection', () => {
      const result = parser.parse('cat < input.txt');
      expect(result.redirects).toHaveLength(1);
      expect(result.redirects[0].type).toBe('<');
    });
  });

  describe('quotes', () => {
    it('should handle double quotes', () => {
      const result = parser.parse('echo "hello world"');
      expect(result.commands[0].args).toEqual(['hello world']);
    });

    it('should handle single quotes', () => {
      const result = parser.parse("echo 'hello world'");
      expect(result.commands[0].args).toEqual(['hello world']);
    });

    it('should handle escaped characters', () => {
      const result = parser.parse('echo hello\\ world');
      expect(result.commands[0].args).toEqual(['hello world']);
    });
  });

  describe('parseGlob', () => {
    it('should match wildcard patterns', () => {
      const files = ['test.js', 'test.ts', 'readme.md'];
      const result = CommandParser.parseGlob('*.js', files);
      expect(result).toEqual(['test.js']);
    });

    it('should match multiple wildcards', () => {
      const files = ['test.js', 'app.js', 'readme.md'];
      const result = CommandParser.parseGlob('*.js', files);
      expect(result).toEqual(['test.js', 'app.js']);
    });

    it('should match question mark', () => {
      const files = ['test1.js', 'test2.js', 'test10.js'];
      const result = CommandParser.parseGlob('test?.js', files);
      expect(result).toEqual(['test1.js', 'test2.js']);
    });
  });

  describe('expandGlobs', () => {
    it('should expand glob patterns', () => {
      const files = ['test.js', 'app.js', 'readme.md'];
      const result = CommandParser.expandGlobs(['*.js'], files);
      expect(result).toEqual(['test.js', 'app.js']);
    });

    it('should keep non-glob arguments', () => {
      const files = ['test.js'];
      const result = CommandParser.expandGlobs(['test.js', 'readme.md'], files);
      expect(result).toEqual(['test.js', 'readme.md']);
    });

    it('should keep pattern if no matches', () => {
      const files = ['test.js'];
      const result = CommandParser.expandGlobs(['*.txt'], files);
      expect(result).toEqual(['*.txt']);
    });
  });
});

