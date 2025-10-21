import type { FileSystemNode, FileMetadata, IFilesystem } from '../types';
import type { IStorageAdapter } from './IStorageAdapter';
import { PathResolver } from '../utils/PathResolver';
import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';

export class VirtualFilesystem implements IFilesystem {
  private root: FileSystemNode;
  private cwd: string = '/';
  private storage: IStorageAdapter;

  constructor(storage?: IStorageAdapter) {
    this.root = this.createNode('/', 'directory');
    this.storage = storage || new IndexedDBAdapter('wcli-fs', 'filesystem');
  }

  private createNode(name: string, type: 'file' | 'directory', content: string = ''): FileSystemNode {
    const now = new Date();
    return {
      name,
      type,
      content: type === 'file' ? content : undefined,
      children: type === 'directory' ? new Map() : undefined,
      metadata: {
        created: now,
        modified: now,
        size: content.length,
        permissions: type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--',
        isExecutable: false,
      },
    };
  }

  private async getNode(path: string): Promise<FileSystemNode | null> {
    const normalized = PathResolver.normalize(path);
    
    if (normalized === '/') {
      return this.root;
    }
    
    const parts = normalized.split('/').filter(p => p);
    let current = this.root;
    
    for (const part of parts) {
      if (!current.children) {
        return null;
      }
      const next = current.children.get(part);
      if (!next) {
        return null;
      }
      current = next;
    }
    
    return current;
  }

  private async getParentNode(path: string): Promise<FileSystemNode | null> {
    const dirname = PathResolver.dirname(path);
    return this.getNode(dirname);
  }

  resolvePath(path: string, cwd?: string): string {
    return PathResolver.resolve(path, cwd || this.cwd);
  }

  getCwd(): string {
    return this.cwd;
  }

  setCwd(path: string): void {
    this.cwd = PathResolver.normalize(path);
  }

  async readFile(path: string): Promise<string> {
    const resolved = this.resolvePath(path);
    const node = await this.getNode(resolved);
    
    if (!node) {
      throw new Error(`File not found: ${path}`);
    }
    
    if (node.type !== 'file') {
      throw new Error(`Not a file: ${path}`);
    }
    
    return node.content || '';
  }

  async writeFile(path: string, content: string): Promise<void> {
    const resolved = this.resolvePath(path);
    const basename = PathResolver.basename(resolved);
    const parent = await this.getParentNode(resolved);
    
    if (!parent) {
      throw new Error(`Parent directory does not exist: ${path}`);
    }
    
    if (!parent.children) {
      throw new Error(`Parent is not a directory: ${path}`);
    }
    
    const existing = parent.children.get(basename);
    
    if (existing) {
      if (existing.type !== 'file') {
        throw new Error(`Cannot write to directory: ${path}`);
      }
      existing.content = content;
      existing.metadata.modified = new Date();
      existing.metadata.size = content.length;
    } else {
      const newFile = this.createNode(basename, 'file', content);
      parent.children.set(basename, newFile);
    }
    
    await this.persist();
  }

  async deleteFile(path: string): Promise<void> {
    const resolved = this.resolvePath(path);
    const basename = PathResolver.basename(resolved);
    const parent = await this.getParentNode(resolved);
    
    if (!parent || !parent.children) {
      throw new Error(`Parent directory does not exist: ${path}`);
    }
    
    const node = parent.children.get(basename);
    if (!node) {
      throw new Error(`File not found: ${path}`);
    }
    
    if (node.type === 'directory' && node.children && node.children.size > 0) {
      throw new Error(`Directory not empty: ${path}`);
    }
    
    parent.children.delete(basename);
    await this.persist();
  }

  async readDir(path: string): Promise<string[]> {
    const resolved = this.resolvePath(path);
    const node = await this.getNode(resolved);
    
    if (!node) {
      throw new Error(`Directory not found: ${path}`);
    }
    
    if (node.type !== 'directory' || !node.children) {
      throw new Error(`Not a directory: ${path}`);
    }
    
    return Array.from(node.children.keys());
  }

  async createDir(path: string): Promise<void> {
    const resolved = this.resolvePath(path);
    const basename = PathResolver.basename(resolved);
    const parent = await this.getParentNode(resolved);
    
    if (!parent) {
      throw new Error(`Parent directory does not exist: ${path}`);
    }
    
    if (!parent.children) {
      throw new Error(`Parent is not a directory: ${path}`);
    }
    
    if (parent.children.has(basename)) {
      throw new Error(`File or directory already exists: ${path}`);
    }
    
    const newDir = this.createNode(basename, 'directory');
    parent.children.set(basename, newDir);
    
    await this.persist();
  }

  async exists(path: string): Promise<boolean> {
    const resolved = this.resolvePath(path);
    const node = await this.getNode(resolved);
    return node !== null;
  }

  async stat(path: string): Promise<FileMetadata> {
    const resolved = this.resolvePath(path);
    const node = await this.getNode(resolved);
    
    if (!node) {
      throw new Error(`File not found: ${path}`);
    }
    
    return node.metadata;
  }

  async isDirectory(path: string): Promise<boolean> {
    const resolved = this.resolvePath(path);
    const node = await this.getNode(resolved);
    return node?.type === 'directory';
  }

  async isFile(path: string): Promise<boolean> {
    const resolved = this.resolvePath(path);
    const node = await this.getNode(resolved);
    return node?.type === 'file';
  }

  async getNodeType(path: string): Promise<'file' | 'directory' | null> {
    const resolved = this.resolvePath(path);
    const node = await this.getNode(resolved);
    return node?.type || null;
  }

  // Persistence using storage adapter
  private serializeNode(node: FileSystemNode): any {
    return {
      name: node.name,
      type: node.type,
      content: node.content,
      children: node.children ? Array.from(node.children.entries()).map(([key, child]) => [key, this.serializeNode(child)]) : undefined,
      metadata: {
        ...node.metadata,
        created: node.metadata.created.toISOString(),
        modified: node.metadata.modified.toISOString(),
      },
    };
  }

  private deserializeNode(data: any): FileSystemNode {
    return {
      name: data.name,
      type: data.type,
      content: data.content,
      children: data.children ? new Map(data.children.map(([key, child]: [string, any]) => [key, this.deserializeNode(child)])) : undefined,
      metadata: {
        ...data.metadata,
        created: new Date(data.metadata.created),
        modified: new Date(data.metadata.modified),
      },
    };
  }

  async persist(): Promise<void> {
    try {
      const data = {
        root: this.serializeNode(this.root),
        cwd: this.cwd,
      };
      
      await this.storage.save('filesystem', data);
    } catch (error) {
      console.error('Failed to persist filesystem:', error);
    }
  }

  async load(): Promise<void> {
    try {
      const data = await this.storage.load('filesystem');
      
      if (data) {
        this.root = this.deserializeNode(data.root);
        this.cwd = data.cwd;
      }
    } catch (error) {
      console.error('Failed to load filesystem:', error);
    }
  }

  async initializeDefaultStructure(): Promise<void> {
    // Create default directories
    const dirs = ['/home', '/bin', '/etc', '/tmp'];
    
    for (const dir of dirs) {
      if (!(await this.exists(dir))) {
        await this.createDir(dir);
      }
    }
    
    // Set cwd to /home
    this.setCwd('/home');
    
    await this.persist();
  }
}

