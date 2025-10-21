import type { IStorageAdapter } from '../core/IStorageAdapter';

/**
 * In-memory storage adapter.
 * Data is lost when the page reloads or the instance is destroyed.
 * Useful for testing, temporary sessions, or when persistence is not needed.
 */
export class MemoryAdapter implements IStorageAdapter {
  private storage: Map<string, any> = new Map();

  async save(key: string, data: any): Promise<void> {
    // Deep clone to prevent external mutations
    this.storage.set(key, JSON.parse(JSON.stringify(data)));
  }

  async load(key: string): Promise<any> {
    const data = this.storage.get(key);
    if (data === undefined) {
      return null;
    }
    // Deep clone to prevent external mutations
    return JSON.parse(JSON.stringify(data));
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async list(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  /**
   * Clear all data from memory (useful for testing)
   */
  clear(): void {
    this.storage.clear();
  }
}

