// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCommand } from '../src/use-command';
import { registerOptions, clearOptions } from '../src/registry';
import { setList, getList } from '../src/store';

describe('useCommand', () => {
  beforeEach(() => {
    setList('test', []);
  });
  afterEach(() => {
    clearOptions();
  });

  it('should initialize with an empty list', () => {
    const { result } = renderHook(() => useCommand('test'));
    expect(result.current.state.list).toEqual([]);
    expect(result.current.state.change).toBeNull();
    expect(result.current.state.canAdd).toBe(true);
    expect(result.current.state.canRemove).toBe(true);
  });

  it('should add an item using defaults', () => {
    registerOptions('test', { defaults: () => ({ value: 0 }) });
    const { result } = renderHook(() => useCommand('test'));
    act(() => result.current.actions.add());
    expect(result.current.state.list).toEqual([{ value: 0 }]);
  });

  it('should add multiple items sequentially', () => {
    let id = 0;
    registerOptions('test', { defaults: () => ({ value: ++id }) });
    const { result } = renderHook(() => useCommand('test'));
    act(() => result.current.actions.add());
    act(() => result.current.actions.add());
    act(() => result.current.actions.add());
    expect(result.current.state.list).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });

  it('should not add when no defaults provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useCommand('test'));
    act(() => result.current.actions.add());
    expect(result.current.state.list).toEqual([]);
    warnSpy.mockRestore();
  });

  it('should remove an item at index', () => {
    setList('test', [{ value: 1 }, { value: 2 }, { value: 3 }]);
    const { result } = renderHook(() => useCommand('test'));
    act(() => result.current.actions.remove(1));
    expect(result.current.state.list).toEqual([{ value: 1 }, { value: 3 }]);
  });

  it('should update an item at index', () => {
    setList('test', [{ value: 1 }]);
    const { result } = renderHook(() => useCommand('test'));
    act(() => result.current.actions.update(0, (prev: any) => ({ value: prev.value + 10 })));
    expect(result.current.state.list).toEqual([{ value: 11 }]);
  });

  it('should set the list', () => {
    setList('test', [{ value: 1 }, { value: 2 }]);
    const { result } = renderHook(() => useCommand('test'));
    act(() => result.current.actions.set([{ value: 99 }]));
    expect(result.current.state.list).toEqual([{ value: 99 }]);
  });

  it('should track change event with action and index', () => {
    registerOptions('test', { defaults: () => ({ value: 0 }) });
    const { result } = renderHook(() => useCommand('test'));
    act(() => result.current.actions.add());
    expect(result.current.state.change).toEqual({
      action: 'add',
      data: [{ value: 0 }],
      index: 0,
    });

    act(() => result.current.actions.update(0, () => ({ value: 42 })));
    expect(result.current.state.change).toEqual({
      action: 'update',
      data: [{ value: 42 }],
      index: 0,
    });

    act(() => result.current.actions.remove(0));
    expect(result.current.state.change).toEqual({
      action: 'remove',
      data: [],
      index: 0,
    });
  });

  it('should track set change event', () => {
    registerOptions('test', { defaults: () => ({ value: 0 }) });
    const { result } = renderHook(() => useCommand('test'));
    act(() => result.current.actions.set([{ value: 1 }, { value: 2 }]));
    expect(result.current.state.change).toEqual({
      action: 'set',
      data: [{ value: 1 }, { value: 2 }],
      index: undefined,
    });
  });
});

describe('useCommand constraints', () => {
  beforeEach(() => {
    setList('constraint-test', []);
  });
  afterEach(() => {
    clearOptions();
  });

  it('canAdd is false when list reaches max', () => {
    setList('constraint-test', [{ value: 1 }, { value: 2 }]);
    registerOptions('constraint-test', { max: 2, defaults: () => ({ value: 0 }) });
    const { result } = renderHook(() => useCommand('constraint-test'));
    expect(result.current.state.canAdd).toBe(false);
  });

  it('canAdd is true when below max', () => {
    setList('constraint-test', [{ value: 1 }]);
    registerOptions('constraint-test', { max: 3, defaults: () => ({ value: 0 }) });
    const { result } = renderHook(() => useCommand('constraint-test'));
    expect(result.current.state.canAdd).toBe(true);
  });

  it('canRemove is false when list at min', () => {
    setList('constraint-test', [{ value: 1 }]);
    registerOptions('constraint-test', { min: 1, defaults: () => ({ value: 0 }) });
    const { result } = renderHook(() => useCommand('constraint-test'));
    expect(result.current.state.canRemove).toBe(false);
  });

  it('canRemove is true when above min', () => {
    setList('constraint-test', [{ value: 1 }, { value: 2 }]);
    registerOptions('constraint-test', { min: 1, defaults: () => ({ value: 0 }) });
    const { result } = renderHook(() => useCommand('constraint-test'));
    expect(result.current.state.canRemove).toBe(true);
  });

  it('no constraints means canAdd and canRemove are always true', () => {
    const { result } = renderHook(() => useCommand('constraint-test'));
    expect(result.current.state.canAdd).toBe(true);
    expect(result.current.state.canRemove).toBe(true);
  });
});

describe('useCommand shared state', () => {
  beforeEach(() => {
    setList('shared-test', []);
  });
  afterEach(() => {
    clearOptions();
  });

  it('two hooks with same name share the same store', () => {
    registerOptions('shared-test', { defaults: () => ({ value: 0 }) });
    const { result: hook1 } = renderHook(() => useCommand('shared-test'));
    const { result: hook2 } = renderHook(() => useCommand('shared-test'));

    act(() => hook1.current.actions.add());
    expect(hook2.current.state.list).toEqual([{ value: 0 }]);
  });

  it('store mutations are visible across hooks', () => {
    const { result: hook1 } = renderHook(() => useCommand('shared-test'));
    const { result: hook2 } = renderHook(() => useCommand('shared-test'));

    act(() => hook1.current.actions.set([{ value: 42 }]));
    expect(getList('shared-test')).toEqual([{ value: 42 }]);
    expect(hook2.current.state.list).toEqual([{ value: 42 }]);
  });
});
