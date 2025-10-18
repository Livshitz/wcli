import type { IHistoryManager } from './IHistoryManager';
import type { IStorageAdapter } from './IStorageAdapter';

/**
 * Default history manager implementation
 */
export class DefaultHistoryManager implements IHistoryManager {
  private history: string[] = [];
  private position: number = -1;
  private storageKey: string;
  private storage: IStorageAdapter;
  private maxSize: number;

  constructor(
    storage: IStorageAdapter,
    storageKey: string = 'wcli-history',
    maxSize: number = 1000
  ) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.maxSize = maxSize;
  }

  add(command: string): void {
    // Don't add empty commands or duplicates of the last command
    if (!command.trim() || command === this.history[this.history.length - 1]) {
      return;
    }

    this.history.push(command);

    // Trim history if it exceeds max size
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(-this.maxSize);
    }

    this.resetPosition();
  }

  get(index: number): string | undefined {
    return this.history[index];
  }

  getPrevious(): string | undefined {
    if (this.history.length === 0) {
      return undefined;
    }

    if (this.position === -1) {
      this.position = this.history.length - 1;
    } else if (this.position > 0) {
      this.position--;
    }

    return this.history[this.position];
  }

  getNext(): string | undefined {
    if (this.position === -1 || this.position >= this.history.length - 1) {
      this.position = -1;
      return '';
    }

    this.position++;
    return this.history[this.position];
  }

  getAll(): string[] {
    return [...this.history];
  }

  search(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(cmd => cmd.toLowerCase().includes(lowerQuery));
  }

  clear(): void {
    this.history = [];
    this.position = -1;
  }

  async persist(): Promise<void> {
    try {
      await this.storage.save(this.storageKey, this.history);
    } catch (error) {
      console.error('Failed to persist history:', error);
    }
  }

  async load(): Promise<void> {
    try {
      const data = await this.storage.load(this.storageKey);
      if (data && Array.isArray(data)) {
        this.history = data;
        this.resetPosition();
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  getPosition(): number {
    return this.position;
  }

  resetPosition(): void {
    this.position = -1;
  }
}

