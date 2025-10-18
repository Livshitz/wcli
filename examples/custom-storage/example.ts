import { Terminal, type IStorageAdapter } from 'wcli';

// Custom storage adapter that uses a REST API backend
class APIStorageAdapter implements IStorageAdapter {
  private apiUrl: string;
  private userId: string;

  constructor(apiUrl: string, userId: string) {
    this.apiUrl = apiUrl;
    this.userId = userId;
  }

  async save(key: string, data: any): Promise<void> {
    const response = await fetch(`${this.apiUrl}/storage/${this.userId}/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to save: ${response.statusText}`);
    }
  }

  async load(key: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/storage/${this.userId}/${key}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to load: ${response.statusText}`);
    }

    return response.json();
  }

  async remove(key: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/storage/${this.userId}/${key}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove: ${response.statusText}`);
    }
  }

  async list(): Promise<string[]> {
    const response = await fetch(`${this.apiUrl}/storage/${this.userId}`);

    if (!response.ok) {
      throw new Error(`Failed to list: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage
const apiStorage = new APIStorageAdapter('https://api.example.com', 'user123');

const terminal = new Terminal({
  storageAdapter: apiStorage,
  env: {
    USER: 'john',
    HOME: '/home/john',
    PATH: '/bin',
  },
});

await terminal.initialize();

// Now all filesystem, history, and session data will be persisted to your API!

