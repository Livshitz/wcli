import type { IStorageAdapter } from '../core/IStorageAdapter';

/**
 * LocalStorage-based storage adapter.
 * Fallback option for environments without IndexedDB or when you need simpler storage.
 * Note: Has size limitations (typically 5-10MB) compared to IndexedDB.
 */
export class LocalStorageAdapter implements IStorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'wcli:') {
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async save(key: string, data: any): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.getFullKey(key), serialized);
    } catch (error) {
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async load(key: string): Promise<any> {
    try {
      const serialized = localStorage.getItem(this.getFullKey(key));
      if (serialized === null) {
        return null;
      }
      return JSON.parse(serialized);
    } catch (error) {
      throw new Error(`Failed to load data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getFullKey(key));
    } catch (error) {
      throw new Error(`Failed to remove data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async list(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      throw new Error(`Failed to list keys: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

