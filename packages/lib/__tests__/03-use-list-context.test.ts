// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useListContext } from '../src/use-list-context';
import { setList, getList } from '../src/store';

describe('useListContext', () => {
  beforeEach(() => {
    setList('test', []);
  });

  it('should initialize with an empty list', () => {
    const { result } = renderHook(() => useListContext('test'));
    expect(result.current.list).toEqual([]);
    expect(result.current.change).toBeNull();
    expect(result.current.canAdd).toBe(true);
    expect(result.current.canRemove).toBe(true);
  });

  it('should add an item using defaults', () => {
    const { result } = renderHook(() =>
      useListContext('test', { defaults: () => ({ value: 0 }) }),
    );
    act(() => result.current.add());
    expect(result.current.list).toEqual([{ value: 0 }]);
  });

  it('should add multiple items sequentially', () => {
    let id = 0;
    const { result } = renderHook(() =>
      useListContext('test', { defaults: () => ({ value: ++id }) }),
    );
    act(() => result.current.add());
    act(() => result.current.add());
    act(() => result.current.add());
    expect(result.current.list).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });

  it('should not add when no defaults provided', () => {
    const { result } = renderHook(() => useListContext('test'));
    act(() => result.current.add());
    expect(result.current.list).toEqual([]);
  });

  it('should remove an item at index', () => {
    setList('test', [{ value: 1 }, { value: 2 }, { value: 3 }]);
    const { result } = renderHook(() => useListContext('test'));
    act(() => result.current.remove(1));
    expect(result.current.list).toEqual([{ value: 1 }, { value: 3 }]);
  });

  it('should update an item at index', () => {
    setList('test', [{ value: 1 }]);
    const { result } = renderHook(() => useListContext('test'));
    act(() => result.current.update(0, (prev: any) => ({ value: prev.value + 10 })));
    expect(result.current.list).toEqual([{ value: 11 }]);
  });

  it('should reset the list', () => {
    setList('test', [{ value: 1 }, { value: 2 }]);
    const { result } = renderHook(() => useListContext('test'));
    act(() => result.current.reset([{ value: 99 }]));
    expect(result.current.list).toEqual([{ value: 99 }]);
  });

  it('should track change event with action and index', () => {
    const { result } = renderHook(() =>
      useListContext('test', { defaults: () => ({ value: 0 }) }),
    );
    act(() => result.current.add());
    expect(result.current.change).toEqual({
      action: 'add',
      data: [{ value: 0 }],
      index: 0,
    });

    act(() => result.current.update(0, () => ({ value: 42 })));
    expect(result.current.change).toEqual({
      action: 'update',
      data: [{ value: 42 }],
      index: 0,
    });

    act(() => result.current.remove(0));
    expect(result.current.change).toEqual({
      action: 'remove',
      data: [],
      index: 0,
    });
  });

  it('should track reset change event', () => {
    const { result } = renderHook(() =>
      useListContext('test', { defaults: () => ({ value: 0 }) }),
    );
    act(() => result.current.reset([{ value: 1 }, { value: 2 }]));
    expect(result.current.change).toEqual({
      action: 'reset',
      data: [{ value: 1 }, { value: 2 }],
      index: undefined,
    });
  });
});

describe('useListContext constraints', () => {
  beforeEach(() => {
    setList('constraint-test', []);
  });

  it('canAdd is false when list reaches max', () => {
    setList('constraint-test', [{ value: 1 }, { value: 2 }]);
    const { result } = renderHook(() =>
      useListContext('constraint-test', { max: 2, defaults: () => ({ value: 0 }) }),
    );
    expect(result.current.canAdd).toBe(false);
  });

  it('canAdd is true when below max', () => {
    setList('constraint-test', [{ value: 1 }]);
    const { result } = renderHook(() =>
      useListContext('constraint-test', { max: 3, defaults: () => ({ value: 0 }) }),
    );
    expect(result.current.canAdd).toBe(true);
  });

  it('canRemove is false when list at min', () => {
    setList('constraint-test', [{ value: 1 }]);
    const { result } = renderHook(() =>
      useListContext('constraint-test', { min: 1, defaults: () => ({ value: 0 }) }),
    );
    expect(result.current.canRemove).toBe(false);
  });

  it('canRemove is true when above min', () => {
    setList('constraint-test', [{ value: 1 }, { value: 2 }]);
    const { result } = renderHook(() =>
      useListContext('constraint-test', { min: 1, defaults: () => ({ value: 0 }) }),
    );
    expect(result.current.canRemove).toBe(true);
  });

  it('no constraints means canAdd and canRemove are always true', () => {
    const { result } = renderHook(() => useListContext('constraint-test'));
    expect(result.current.canAdd).toBe(true);
    expect(result.current.canRemove).toBe(true);
  });
});

describe('useListContext shared state', () => {
  beforeEach(() => {
    setList('shared-test', []);
  });

  it('two hooks with same name share the same store', () => {
    const { result: hook1 } = renderHook(() =>
      useListContext('shared-test', { defaults: () => ({ value: 0 }) }),
    );
    const { result: hook2 } = renderHook(() => useListContext('shared-test'));

    act(() => hook1.current.add());
    expect(hook2.current.list).toEqual([{ value: 0 }]);
  });

  it('store mutations are visible across hooks', () => {
    const { result: hook1 } = renderHook(() => useListContext('shared-test'));
    const { result: hook2 } = renderHook(() => useListContext('shared-test'));

    act(() => hook1.current.reset([{ value: 42 }]));
    expect(getList('shared-test')).toEqual([{ value: 42 }]);
    expect(hook2.current.list).toEqual([{ value: 42 }]);
  });
});
