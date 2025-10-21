import type { Command, CommandOptions, CommandResult } from '../types';

// Helper function to count lines, words, and bytes in text
function countText(text: string): { lines: number; words: number; bytes: number } {
  const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const bytes = new Blob([text]).size;
  
  return { lines, words, bytes };
}

export const wcCommand: Command = {
  name: 'wc',
  description: 'Print newline, word, and byte counts',
  usage: 'wc [options] [file...]',
  
  async execute(args: string[], options: CommandOptions): Promise<CommandResult> {
    const { fs, cwd, stdout, stdin, flags } = options;
    
    const showLines = !flags?.w && !flags?.c;
    const showWords = !flags?.l && !flags?.c;
    const showBytes = !flags?.l && !flags?.w;
    const onlyLines = flags?.l;
    const onlyWords = flags?.w;
    const onlyBytes = flags?.c;
    
    try {
      let totalLines = 0;
      let totalWords = 0;
      let totalBytes = 0;
      const results: Array<{ lines: number; words: number; bytes: number; name: string }> = [];
      
      // If no files specified, read from stdin
      if (args.length === 0) {
        const input = await stdin.readAll();
        const { lines, words, bytes } = countText(input);
        
        let output = '';
        if (onlyLines || showLines) output += lines.toString().padStart(8);
        if (onlyWords || showWords) output += words.toString().padStart(8);
        if (onlyBytes || showBytes) output += bytes.toString().padStart(8);
        
        await stdout.write(output + '\n');
        return { exitCode: 0 };
      }
      
      // Process each file
      for (const file of args) {
        const resolvedPath = fs.resolvePath(file, cwd);
        
        if (!(await fs.exists(resolvedPath))) {
          await stdout.write(`wc: ${file}: No such file or directory\n`);
          return { exitCode: 1 };
        }
        
        if (!(await fs.isFile(resolvedPath))) {
          await stdout.write(`wc: ${file}: Is a directory\n`);
          return { exitCode: 1 };
        }
        
        const content = await fs.readFile(resolvedPath);
        const counts = countText(content);
        
        results.push({ ...counts, name: file });
        totalLines += counts.lines;
        totalWords += counts.words;
        totalBytes += counts.bytes;
      }
      
      // Output results
      for (const result of results) {
        let output = '';
        if (onlyLines || showLines) output += result.lines.toString().padStart(8);
        if (onlyWords || showWords) output += result.words.toString().padStart(8);
        if (onlyBytes || showBytes) output += result.bytes.toString().padStart(8);
        output += ' ' + result.name;
        
        await stdout.write(output + '\n');
      }
      
      // Show totals if multiple files
      if (results.length > 1) {
        let output = '';
        if (onlyLines || showLines) output += totalLines.toString().padStart(8);
        if (onlyWords || showWords) output += totalWords.toString().padStart(8);
        if (onlyBytes || showBytes) output += totalBytes.toString().padStart(8);
        output += ' total';
        
        await stdout.write(output + '\n');
      }
      
      return { exitCode: 0 };
    } catch (error) {
      await stdout.write(`wc: ${error instanceof Error ? error.message : String(error)}\n`);
      return { exitCode: 1 };
    }
  },
};
