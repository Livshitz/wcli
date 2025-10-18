import type { ISessionManager, Session } from './ISessionManager';
import type { IStorageAdapter } from './IStorageAdapter';

/**
 * Default session manager implementation using storage adapter
 */
export class DefaultSessionManager implements ISessionManager {
  private storageKey: string;
  private storage: IStorageAdapter;

  constructor(storage: IStorageAdapter, storageKey: string = 'wcli-session') {
    this.storage = storage;
    this.storageKey = storageKey;
  }

  async saveSession(session: Session): Promise<void> {
    try {
      const sessionData = {
        ...session,
        timestamp: Date.now(),
      };
      await this.storage.save(this.storageKey, sessionData);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  async loadSession(): Promise<Session | null> {
    try {
      const session = await this.storage.load(this.storageKey);
      return session || null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      await this.storage.remove(this.storageKey);
    } catch (error) {
      console.error('Failed to clear session:', error);
      throw error;
    }
  }
}

