/**
 * Typed compatibility facade backed by @antv/event-emitter.
 */

import AntVEventEmitter from '@antv/event-emitter';

export type Handler<Args extends unknown[]> = (...args: Args) => void;

interface EventEmitterDelegate {
  on(event: string, handler: unknown, once?: boolean): unknown;
  off(event?: string, handler?: unknown): unknown;
  once(event: string, handler: unknown): unknown;
  emit<Args extends unknown[]>(event: string, ...args: Args): void;
}

type EventEmitterConstructor = new () => EventEmitterDelegate;

const eventEmitterModule: unknown = AntVEventEmitter;
const AntVEventEmitterConstructor = (
  typeof eventEmitterModule === 'function'
    ? eventEmitterModule
    : (eventEmitterModule as { default: unknown }).default
) as EventEmitterConstructor;

export class EventEmitter {
  private readonly emitter = new AntVEventEmitterConstructor();

  on<Args extends unknown[]>(event: string, handler: Handler<Args>): void {
    this.emitter.on(event, handler);
  }

  off<Args extends unknown[]>(event: string, handler: Handler<Args>): void {
    this.emitter.off(event, handler);
  }

  once<Args extends unknown[]>(event: string, handler: Handler<Args>): void {
    this.emitter.once(event, handler);
  }

  emit<Args extends unknown[]>(event: string, ...args: Args): void {
    this.emitter.emit(event, ...args);
  }

  removeAllListeners(event?: string): void {
    this.emitter.off(event);
  }
}
