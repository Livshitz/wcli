import type { InputStream, OutputStream } from '@/types';

export class StringInputStream implements InputStream {
  private data: string;
  private position: number = 0;

  constructor(data: string) {
    this.data = data;
  }

  async read(): Promise<string | null> {
    if (this.position >= this.data.length) {
      return null;
    }
    const char = this.data[this.position];
    this.position++;
    return char;
  }

  async readAll(): Promise<string> {
    const result = this.data.slice(this.position);
    this.position = this.data.length;
    return result;
  }
}

export class StringOutputStream implements OutputStream {
  private buffer: string[] = [];
  private closed: boolean = false;

  async write(data: string): Promise<void> {
    if (this.closed) {
      throw new Error('Stream is closed');
    }
    this.buffer.push(data);
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  getOutput(): string {
    return this.buffer.join('');
  }

  clear(): void {
    this.buffer = [];
  }
}

export class PipeStream implements InputStream, OutputStream {
  private buffer: string[] = [];
  private position: number = 0;
  private closed: boolean = false;
  private resolvers: Array<(value: string | null) => void> = [];

  async write(data: string): Promise<void> {
    if (this.closed) {
      throw new Error('Stream is closed');
    }
    this.buffer.push(data);
    
    // Resolve any waiting readers
    if (this.resolvers.length > 0) {
      const resolver = this.resolvers.shift();
      if (resolver) {
        resolver(data);
      }
    }
  }

  async read(): Promise<string | null> {
    if (this.position < this.buffer.length) {
      return this.buffer[this.position++];
    }
    
    if (this.closed) {
      return null;
    }
    
    // Wait for data
    return new Promise((resolve) => {
      this.resolvers.push(resolve);
    });
  }

  async readAll(): Promise<string> {
    const result = this.buffer.slice(this.position).join('');
    this.position = this.buffer.length;
    
    // Wait for close if not closed yet
    if (!this.closed) {
      await new Promise<void>((resolve) => {
        const checkClosed = setInterval(() => {
          if (this.closed) {
            clearInterval(checkClosed);
            resolve();
          }
        }, 10);
      });
    }
    
    return result;
  }

  async close(): Promise<void> {
    this.closed = true;
    // Resolve all waiting readers with null
    this.resolvers.forEach(resolver => resolver(null));
    this.resolvers = [];
  }

  isClosed(): boolean {
    return this.closed;
  }
}

export class EmptyInputStream implements InputStream {
  async read(): Promise<string | null> {
    return null;
  }

  async readAll(): Promise<string> {
    return '';
  }
}

