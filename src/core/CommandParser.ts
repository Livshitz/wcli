import type { ParsedCommand, CommandPipeline, PipelineOperator, Redirect } from '@/types';

export class CommandParser {
  parse(input: string): CommandPipeline {
    const tokens = this.tokenize(input);
    return this.buildPipeline(tokens);
  }

  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"' || char === "'") {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        } else {
          current += char;
        }
        continue;
      }

      if (inQuotes) {
        current += char;
        continue;
      }

      if (char === '&' && input[i + 1] === '&') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push('&&');
        i++;
        continue;
      }

      if (char === '|') {
        if (input[i + 1] === '|') {
          if (current) {
            tokens.push(current);
            current = '';
          }
          tokens.push('||');
          i++;
          continue;
        } else {
          if (current) {
            tokens.push(current);
            current = '';
          }
          tokens.push('|');
          continue;
        }
      }

      if (char === ';') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(';');
        continue;
      }

      if (char === '>') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        if (input[i + 1] === '>') {
          tokens.push('>>');
          i++;
        } else {
          tokens.push('>');
        }
        continue;
      }

      if (char === '<') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push('<');
        continue;
      }

      if (char === ' ' || char === '\t') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  private buildPipeline(tokens: string[]): CommandPipeline {
    const commands: ParsedCommand[] = [];
    const operators: PipelineOperator[] = [];
    const redirects: Redirect[] = [];
    
    let currentCommand: string | null = null;
    let currentArgs: string[] = [];
    let currentFlags: Record<string, boolean | string> = {};
    let expectingRedirectTarget = false;
    let redirectType: '>' | '>>' | '<' | null = null;
    let commandIndex = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Handle redirect target
      if (expectingRedirectTarget) {
        if (redirectType) {
          redirects.push({
            type: redirectType,
            target: token,
            commandIndex,
          });
        }
        expectingRedirectTarget = false;
        redirectType = null;
        continue;
      }

      // Handle redirect operators
      if (token === '>' || token === '>>' || token === '<') {
        redirectType = token as '>' | '>>' | '<';
        expectingRedirectTarget = true;
        continue;
      }

      // Handle pipeline operators
      if (token === '|' || token === '&&' || token === '||' || token === ';') {
        if (currentCommand) {
          commands.push({
            command: currentCommand,
            args: currentArgs,
            flags: currentFlags,
          });
          commandIndex++;
          currentCommand = null;
          currentArgs = [];
          currentFlags = {};
        }
        operators.push(token as PipelineOperator);
        continue;
      }

      // Parse flags
      if (token.startsWith('-')) {
        let flagName = token.slice(1);
        // Handle double dash --flag
        if (flagName.startsWith('-')) {
          flagName = flagName.slice(1);
        }
        if (flagName.includes('=')) {
          const [name, value] = flagName.split('=', 2);
          currentFlags[name] = value;
        } else {
          currentFlags[flagName] = true;
        }
        continue;
      }

      // First token is the command
      if (!currentCommand) {
        currentCommand = token;
      } else {
        currentArgs.push(token);
      }
    }

    // Add the last command
    if (currentCommand) {
      commands.push({
        command: currentCommand,
        args: currentArgs,
        flags: currentFlags,
      });
    }

    return {
      commands,
      operators,
      redirects,
    };
  }

  static parseGlob(pattern: string, files: string[]): string[] {
    // Simple glob matching
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return files.filter(file => regex.test(file));
  }

  static expandGlobs(args: string[], files: string[]): string[] {
    const expanded: string[] = [];
    
    for (const arg of args) {
      if (arg.includes('*') || arg.includes('?')) {
        const matches = this.parseGlob(arg, files);
        if (matches.length > 0) {
          expanded.push(...matches);
        } else {
          expanded.push(arg);
        }
      } else {
        expanded.push(arg);
      }
    }
    
    return expanded;
  }
}

