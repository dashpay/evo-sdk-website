import { describe, it, expect, beforeAll, vi } from 'vitest';

// state.js touches `document` at import time. The vitest config uses the
// 'node' environment (no DOM), so we stub a minimal document shim with
// getElementById/querySelectorAll before dynamically importing the module.
let registerDynamicHandler;
let clearDynamicHandlers;
let dynamicInputHandlers;

beforeAll(async () => {
  vi.stubGlobal('document', {
    getElementById: () => null,
    querySelectorAll: () => [],
  });
  ({ registerDynamicHandler, clearDynamicHandlers, dynamicInputHandlers } =
    await import('../../public/src/state.js'));
});

describe('registerDynamicHandler — replacing an existing handler', () => {
  it('calls clear() on the previous handler before replacing it', () => {
    clearDynamicHandlers();
    const previousClear = vi.fn();
    const previous = { clear: previousClear };
    const next = { clear: vi.fn() };

    registerDynamicHandler('foo', previous);
    registerDynamicHandler('foo', next);

    expect(previousClear).toHaveBeenCalledTimes(1);
    expect(dynamicInputHandlers.get('foo')).toBe(next);
  });

  it('does not invoke clear() when no previous handler is registered', () => {
    clearDynamicHandlers();
    const next = { clear: vi.fn() };
    registerDynamicHandler('bar', next);
    expect(next.clear).not.toHaveBeenCalled();
    expect(dynamicInputHandlers.get('bar')).toBe(next);
  });

  it('skips clear() when re-registering the exact same handler instance', () => {
    clearDynamicHandlers();
    const handler = { clear: vi.fn() };
    registerDynamicHandler('baz', handler);
    registerDynamicHandler('baz', handler);
    expect(handler.clear).not.toHaveBeenCalled();
    expect(dynamicInputHandlers.get('baz')).toBe(handler);
  });

  it('still registers the new handler when the previous clear() throws', () => {
    clearDynamicHandlers();
    const previous = { clear: () => { throw new Error('boom'); } };
    const next = { clear: vi.fn() };
    registerDynamicHandler('qux', previous);
    expect(() => registerDynamicHandler('qux', next)).not.toThrow();
    expect(dynamicInputHandlers.get('qux')).toBe(next);
  });

  it('replaces a previous handler that has no clear() method', () => {
    clearDynamicHandlers();
    const previous = {};
    const next = { clear: vi.fn() };
    registerDynamicHandler('plain', previous);
    expect(() => registerDynamicHandler('plain', next)).not.toThrow();
    expect(dynamicInputHandlers.get('plain')).toBe(next);
  });
});
