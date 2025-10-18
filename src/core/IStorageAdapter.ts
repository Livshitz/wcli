/**
 * Storage adapter interface for persisting data across sessions.
 * Implementations can use IndexedDB, localStorage, remote APIs, etc.
 */
export interface IStorageAdapter {
  /**
   * Save data to storage under the specified key
   */
  save(key: string, data: any): Promise<void>;

  /**
   * Load data from storage by key
   * Returns null if key doesn't exist
   */
  load(key: string): Promise<any>;

  /**
   * Remove data from storage by key
   */
  remove(key: string): Promise<void>;

  /**
   * List all keys in storage
   */
  list(): Promise<string[]>;
}

