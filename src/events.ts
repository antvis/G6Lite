/**
 * Lightweight typed event emitter.
 */

export type Handler = (...args: any[]) => void;

export class EventEmitter {
  private _handlers = new Map<string, Set<Handler>>();

  on(event: string, handler: Handler): void {
    let set = this._handlers.get(event);
    if (!set) {
      set = new Set();
      this._handlers.set(event, set);
    }
    set.add(handler);
  }

  off(event: string, handler: Handler): void {
    const set = this._handlers.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) this._handlers.delete(event);
    }
  }

  once(event: string, handler: Handler): void {
    const wrapper: Handler = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    this.on(event, wrapper);
  }

  emit(event: string, ...args: any[]): void {
    const set = this._handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(...args);
      } catch (e) {
        console.error(`EventEmitter: error in handler for "${event}"`, e);
      }
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this._handlers.delete(event);
    } else {
      this._handlers.clear();
    }
  }
}
