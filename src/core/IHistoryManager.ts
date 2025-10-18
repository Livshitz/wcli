/**
 * History manager interface for managing command history
 */
export interface IHistoryManager {
  /**
   * Add a command to history
   */
  add(command: string): void;

  /**
   * Get command at specific index
   */
  get(index: number): string | undefined;

  /**
   * Get previous command (move backward in history)
   */
  getPrevious(): string | undefined;

  /**
   * Get next command (move forward in history)
   */
  getNext(): string | undefined;

  /**
   * Get all commands in history
   */
  getAll(): string[];

  /**
   * Search history for commands containing query
   */
  search(query: string): string[];

  /**
   * Clear all history
   */
  clear(): void;

  /**
   * Persist history to storage
   */
  persist(): Promise<void>;

  /**
   * Load history from storage
   */
  load(): Promise<void>;

  /**
   * Get current position in history
   */
  getPosition(): number;

  /**
   * Reset history navigation position
   */
  resetPosition(): void;
}

