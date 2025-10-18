/**
 * Simple event emitter for lifecycle hooks
 */
export class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void | Promise<void>>> = new Map();

  /**
   * Register an event listener
   */
  on(event: string, listener: (...args: any[]) => void | Promise<void>): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  /**
   * Unregister an event listener
   */
  off(event: string, listener: (...args: any[]) => void | Promise<void>): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit(event: string, ...args: any[]): Promise<void> {
    const listeners = this.events.get(event);
    if (listeners) {
      for (const listener of listeners) {
        await listener(...args);
      }
    }
  }

  /**
   * Remove all listeners for an event, or all events if no event specified
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

