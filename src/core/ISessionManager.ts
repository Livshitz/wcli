/**
 * Session data structure
 */
export interface Session {
  /**
   * Serialized filesystem state
   */
  filesystem: any;

  /**
   * Command history
   */
  history: string[];

  /**
   * Environment variables
   */
  env: Record<string, string>;

  /**
   * Current working directory
   */
  cwd: string;

  /**
   * Command aliases
   */
  aliases: Record<string, string>;

  /**
   * Timestamp of last save
   */
  timestamp?: number;
}

/**
 * Session manager interface for saving/loading terminal sessions
 */
export interface ISessionManager {
  /**
   * Save the current session
   */
  saveSession(session: Session): Promise<void>;

  /**
   * Load the saved session
   * Returns null if no session exists
   */
  loadSession(): Promise<Session | null>;

  /**
   * Clear the saved session
   */
  clearSession(): Promise<void>;
}

