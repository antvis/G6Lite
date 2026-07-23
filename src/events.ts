/**
 * Lightweight typed event emitter.
 */

export type Handler<Args extends unknown[]> = (...args: Args) => void;

type StoredHandler = Handler<never[]>;

export class EventEmitter {
  private _handlers = new Map<string, Set<StoredHandler>>();

  on<Args extends unknown[]>(event: string, handler: Handler<Args>): void {
    let set = this._handlers.get(event);
    if (!set) {
      set = new Set();
      this._handlers.set(event, set);
    }
    set.add(handler as unknown as StoredHandler);
  }

  off<Args extends unknown[]>(event: string, handler: Handler<Args>): void {
    const set = this._handlers.get(event);
    if (set) {
      set.delete(handler as unknown as StoredHandler);
      if (set.size === 0) this._handlers.delete(event);
    }
  }

  once<Args extends unknown[]>(event: string, handler: Handler<Args>): void {
    const wrapper: Handler<Args> = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    this.on(event, wrapper);
  }

  emit<Args extends unknown[]>(event: string, ...args: Args): void {
    const set = this._handlers.get(event);
    if (!set) return;
    for (const storedHandler of set) {
      try {
        const handler = storedHandler as unknown as Handler<Args>;
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
