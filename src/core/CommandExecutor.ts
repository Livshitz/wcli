import type { Command, CommandOptions, CommandResult, CommandPipeline, IFilesystem } from '@/types';
import { StringInputStream, StringOutputStream, PipeStream, EmptyInputStream } from '@/utils/Stream';
import { CommandParser } from './CommandParser';

export class CommandExecutor {
  private commands: Map<string, Command> = new Map();
  private fs: IFilesystem;
  private env: Record<string, string> = {};

  constructor(fs: IFilesystem) {
    this.fs = fs;
    this.env = {
      HOME: '/home',
      PATH: '/bin',
      USER: 'user',
    };
  }

  registerCommand(command: Command): void {
    this.commands.set(command.name, command);
  }

  getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  async execute(input: string): Promise<CommandResult> {
    const parser = new CommandParser();
    const pipeline = parser.parse(input);

    if (pipeline.commands.length === 0) {
      return { exitCode: 0, output: '' };
    }

    try {
      return await this.executePipeline(pipeline);
    } catch (error) {
      return {
        exitCode: 1,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async executePipeline(pipeline: CommandPipeline): Promise<CommandResult> {
    const { commands, operators, redirects } = pipeline;

    // Handle single command without operators
    if (commands.length === 1 && operators.length === 0) {
      return await this.executeSingleCommand(commands[0], redirects);
    }

    // Handle multiple commands with operators
    let lastResult: CommandResult = { exitCode: 0 };

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const operator = operators[i - 1];

      // Check if we should skip based on previous result and operator
      if (operator === '&&' && lastResult.exitCode !== 0) {
        break;
      }
      if (operator === '||' && lastResult.exitCode === 0) {
        break;
      }

      // Handle pipe operator
      if (operator === '|') {
        // Execute with piping
        const commandRedirects = redirects.filter(r => r.commandIndex === i);
        lastResult = await this.executeSingleCommand(command, commandRedirects, lastResult.output);
      } else {
        // Execute normally
        const commandRedirects = redirects.filter(r => r.commandIndex === i);
        lastResult = await this.executeSingleCommand(command, commandRedirects);
      }
    }

    return lastResult;
  }

  private async executeSingleCommand(
    parsedCommand: { command: string; args: string[]; flags: Record<string, boolean | string> },
    redirects: Array<{ type: '>' | '>>' | '<'; target: string; commandIndex: number }>,
    stdinData?: string
  ): Promise<CommandResult> {
    const { command, args, flags } = parsedCommand;

    // Get the command
    const cmd = this.commands.get(command);
    if (!cmd) {
      // Try to execute from filesystem
      const result = await this.executeFromFilesystem(command, args, stdinData);
      if (result) {
        return result;
      }
      return {
        exitCode: 127,
        error: `Command not found: ${command}`,
      };
    }

    // Setup streams
    const stdin = stdinData ? new StringInputStream(stdinData) : new EmptyInputStream();
    const stdout = new StringOutputStream();
    const stderr = new StringOutputStream();

    // Handle input redirect
    const inputRedirect = redirects.find(r => r.type === '<');
    let finalStdin = stdin;
    
    if (inputRedirect) {
      try {
        const content = await this.fs.readFile(inputRedirect.target);
        finalStdin = new StringInputStream(content);
      } catch (error) {
        return {
          exitCode: 1,
          error: `Failed to read input file: ${inputRedirect.target}`,
        };
      }
    }

    // Execute command
    const options: CommandOptions = {
      stdin: finalStdin,
      stdout,
      stderr,
      cwd: this.fs.getCwd(),
      env: this.env,
      fs: this.fs,
      flags,
    };

    try {
      const result = await cmd.execute(args, options);

      // Handle output redirects
      const outputRedirect = redirects.find(r => r.type === '>' || r.type === '>>');
      if (outputRedirect) {
        const output = stdout.getOutput();
        try {
          if (outputRedirect.type === '>') {
            await this.fs.writeFile(outputRedirect.target, output);
          } else {
            // Append
            const existing = await this.fs.exists(outputRedirect.target) 
              ? await this.fs.readFile(outputRedirect.target) 
              : '';
            await this.fs.writeFile(outputRedirect.target, existing + output);
          }
          return { exitCode: 0 };
        } catch (error) {
          return {
            exitCode: 1,
            error: `Failed to write to file: ${outputRedirect.target}`,
          };
        }
      }

      // Return normal output
      return {
        exitCode: result.exitCode,
        output: stdout.getOutput(),
        error: stderr.getOutput(),
      };
    } catch (error) {
      return {
        exitCode: 1,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async executeFromFilesystem(
    command: string,
    args: string[],
    stdinData?: string
  ): Promise<CommandResult | null> {
    // Try to find the command in the filesystem
    const possiblePaths = [
      this.fs.resolvePath(command, this.fs.getCwd()),
      `/bin/${command}`,
      `/bin/${command}.js`,
    ];

    for (const path of possiblePaths) {
      try {
        if (await this.fs.exists(path)) {
          const content = await this.fs.readFile(path);
          
          // Try to execute as JavaScript
          try {
            const module = await this.evaluateModule(content);
            if (module && typeof module.execute === 'function') {
              const stdin = stdinData ? new StringInputStream(stdinData) : new EmptyInputStream();
              const stdout = new StringOutputStream();
              const stderr = new StringOutputStream();

              const options: CommandOptions = {
                stdin,
                stdout,
                stderr,
                cwd: this.fs.getCwd(),
                env: this.env,
                fs: this.fs,
              };

              const result = await module.execute(args, options);
              return {
                exitCode: result.exitCode,
                output: stdout.getOutput(),
                error: stderr.getOutput(),
              };
            }
          } catch (error) {
            return {
              exitCode: 1,
              error: `Failed to execute ${command}: ${error instanceof Error ? error.message : String(error)}`,
            };
          }
        }
      } catch (error) {
        // Continue to next path
      }
    }

    return null;
  }

  private async evaluateModule(code: string): Promise<any> {
    // Create a safe evaluation context
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    
    try {
      const func = new AsyncFunction('exports', 'require', code + '\nreturn exports;');
      const exports: any = {};
      const require = (name: string) => {
        // Minimal require implementation for dependencies
        throw new Error(`Module not found: ${name}`);
      };
      
      return await func(exports, require);
    } catch (error) {
      throw new Error(`Failed to evaluate module: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  setEnv(key: string, value: string): void {
    this.env[key] = value;
  }

  getEnv(key: string): string | undefined {
    return this.env[key];
  }
}

