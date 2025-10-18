# Custom Storage Adapter Example

This example shows how to implement a custom storage adapter to persist terminal data to a REST API backend instead of IndexedDB.

## Use Cases

- Multi-user applications with server-side persistence
- Syncing terminal state across devices
- Integration with existing backend systems
- Custom data storage requirements

## Implementation

The key is to implement the `IStorageAdapter` interface:

```typescript
interface IStorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  remove(key: string): Promise<void>;
  list(): Promise<string[]>;
}
```

Then pass it to the Terminal constructor:

```typescript
const terminal = new Terminal({
  storageAdapter: new APIStorageAdapter('https://api.example.com', 'user123'),
});
```

## Benefits

- User-specific filesystems and history
- Data persistence across sessions and devices
- Integration with authentication systems
- Backup and recovery capabilities

