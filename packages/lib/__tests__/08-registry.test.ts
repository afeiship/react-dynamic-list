import { describe, it, expect, afterEach } from 'vitest';
import { registerOptions, getOptions, clearOptions } from '../src/registry';

describe('registry', () => {
  afterEach(() => clearOptions());

  it('registers and retrieves options by name', () => {
    const opts = { defaults: () => ({ id: 1 }) };
    registerOptions('todos', opts);
    expect(getOptions('todos')).toBe(opts);
  });

  it('returns undefined for unregistered name', () => {
    expect(getOptions('unknown')).toBeUndefined();
  });

  it('overwrites existing options', () => {
    registerOptions('todos', { defaults: () => 'a' });
    registerOptions('todos', { defaults: () => 'b' });
    expect(getOptions('todos')?.defaults()).toBe('b');
  });

  it('clearOptions removes all registrations', () => {
    registerOptions('a', { defaults: () => 1 });
    registerOptions('b', { defaults: () => 2 });
    clearOptions();
    expect(getOptions('a')).toBeUndefined();
    expect(getOptions('b')).toBeUndefined();
  });

  it('stores min/max constraints', () => {
    registerOptions('todos', { defaults: () => ({}), min: 1, max: 5 });
    const opts = getOptions('todos');
    expect(opts?.min).toBe(1);
    expect(opts?.max).toBe(5);
  });
});
