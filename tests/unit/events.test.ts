import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '@src/events.js';

describe('EventEmitter', () => {
  it('should register and emit events', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on('test', handler);
    emitter.emit('test', { value: 1 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to handlers', () => {
    const emitter = new EventEmitter();
    let received: { x: number } | undefined;
    emitter.on('test', (arg: { x: number }) => {
      received = arg;
    });
    emitter.emit('test', { x: 42 });
    expect(received).toEqual({ x: 42 });
  });

  it('should support multiple handlers', () => {
    const emitter = new EventEmitter();
    let count = 0;
    emitter.on('click', () => count++);
    emitter.on('click', () => count++);
    emitter.emit('click');
    expect(count).toBe(2);
  });

  it('should remove handler with off', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on('test', handler);
    emitter.off('test', handler);
    emitter.emit('test');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle once handler', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.once('test', handler);
    emitter.emit('test');
    emitter.emit('test');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not throw when emitting event with no handlers', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.emit('nonexistent')).not.toThrow();
  });

  it('should not throw when off is called for unregistered handler', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.off('test', () => {})).not.toThrow();
  });

  it('should removeAllListeners for a specific event', () => {
    const emitter = new EventEmitter();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    emitter.on('a', handler1);
    emitter.on('b', handler2);
    emitter.removeAllListeners('a');
    emitter.emit('a');
    emitter.emit('b');
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should removeAllListeners for all events', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on('a', handler);
    emitter.on('b', handler);
    emitter.removeAllListeners();
    emitter.emit('a');
    emitter.emit('b');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should isolate errors in handlers', () => {
    const emitter = new EventEmitter();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const goodHandler = vi.fn();
    emitter.on('test', () => {
      throw new Error('oops');
    });
    emitter.on('test', goodHandler);
    emitter.emit('test');
    expect(goodHandler).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('Data lifecycle events', () => {
  it('should emit afteradditem / afterremoveitem / afterupdateitem event names', () => {
    const emitter = new EventEmitter();
    const addHandler = vi.fn();
    const removeHandler = vi.fn();
    const updateHandler = vi.fn();

    emitter.on('afteradditem', addHandler);
    emitter.on('afterremoveitem', removeHandler);
    emitter.on('afterupdateitem', updateHandler);

    emitter.emit('afteradditem', { type: 'node', id: 'n1' });
    expect(addHandler).toHaveBeenCalledTimes(1);
    expect(addHandler.mock.calls[0][0]).toEqual({ type: 'node', id: 'n1' });

    emitter.emit('afterremoveitem', { type: 'node', id: 'n1' });
    expect(removeHandler).toHaveBeenCalledTimes(1);

    emitter.emit('afterupdateitem', { type: 'node', id: 'n1', action: 'position' });
    expect(updateHandler).toHaveBeenCalledTimes(1);
    expect(updateHandler.mock.calls[0][0].action).toBe('position');
  });

  it('should support brush:select and brush:end events', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on('brush:select', handler);
    emitter.on('brush:end', handler);

    emitter.emit('brush:select', { nodeIds: ['a', 'b'] });
    emitter.emit('brush:end', { nodeIds: ['a', 'b'] });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('should support lasso:select and lasso:end events', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on('lasso:select', handler);
    emitter.on('lasso:end', handler);

    emitter.emit('lasso:select', { nodeIds: ['c'] });
    emitter.emit('lasso:end', { nodeIds: ['c'] });
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
