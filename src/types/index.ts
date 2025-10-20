// Core interfaces for the terminal

export * from './config';

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Map<string, FileSystemNode>;
  metadata: FileMetadata;
}

export interface FileMetadata {
  created: Date;
  modified: Date;
  size: number;
  permissions: string;
  isExecutable?: boolean;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  execute(args: string[], options: CommandOptions): Promise<CommandResult>;
}

export interface PromptOptions {
  message: string;
  defaultValue?: string;
  password?: boolean;
  validate?: (input: string) => boolean | string;
}

export interface CommandOptions {
  stdin: InputStream;
  stdout: OutputStream;
  stderr: OutputStream;
  cwd: string;
  env: Record<string, string>;
  fs: IFilesystem;
  flags?: Record<string, boolean | string>;
  prompt?: (options: string | PromptOptions) => Promise<string>;
}

export interface CommandResult {
  exitCode: number;
  output?: string;
  error?: string;
}

export interface IFilesystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
  createDir(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FileMetadata>;
  resolvePath(path: string, cwd: string): string;
  getCwd(): string;
  setCwd(path: string): void;
  isDirectory(path: string): Promise<boolean>;
  isFile(path: string): Promise<boolean>;
}

export interface InputStream {
  read(): Promise<string | null>;
  readAll(): Promise<string>;
}

export interface OutputStream {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, boolean | string>;
}

export interface CommandPipeline {
  commands: ParsedCommand[];
  operators: PipelineOperator[];
  redirects: Redirect[];
}

export type PipelineOperator = '|' | '&&' | '||' | ';';

export interface Redirect {
  type: '>' | '>>' | '<';
  target: string;
  commandIndex: number;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'prompt' | 'component';
  content: string;
  timestamp: Date;
  component?: {
    name: string;
    props?: Record<string, any>;
    source?: 'local' | 'remote';
    url?: string;
  };
}

export interface TerminalHistory {
  add(command: string): void;
  get(index: number): string | undefined;
  getPrevious(): string | undefined;
  getNext(): string | undefined;
  search(query: string): string[];
  getAll(): string[];
}

