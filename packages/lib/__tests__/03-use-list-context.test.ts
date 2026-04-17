// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useListContext } from '../src/use-list-context';
import { setList } from '../src/store';

describe('useListContext', () => {
  beforeEach(() => {
    setList('test', []);
  });

  it('should initialize with an empty list', () => {
    const { result } = renderHook(() => useListContext('test'));
    expect(result.current.list).toEqual([]);
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

  it('should remove an item at index', () => {
    setList('test', [{ value: 1 }, { value: 2 }]);
    const { result } = renderHook(() => useListContext('test'));
    act(() => result.current.remove(0));
    expect(result.current.list).toEqual([{ value: 2 }]);
  });

  it('should update an item at index', () => {
    setList('test', [{ value: 1 }]);
    const { result } = renderHook(() => useListContext('test'));
    act(() => result.current.update(0, (prev: any) => ({ value: prev.value + 1 })));
    expect(result.current.list).toEqual([{ value: 2 }]);
  });

  it('should reset the list', () => {
    const { result } = renderHook(() => useListContext('test'));
    act(() => result.current.reset([{ value: 99 }]));
    expect(result.current.list).toEqual([{ value: 99 }]);
  });

  it('should respect max constraint for canAdd', () => {
    setList('test', [{ value: 1 }, { value: 2 }]);
    const { result } = renderHook(() =>
      useListContext('test', { max: 2, defaults: () => ({ value: 0 }) }),
    );
    expect(result.current.canAdd).toBe(false);
  });

  it('should respect min constraint for canRemove', () => {
    setList('test', [{ value: 1 }]);
    const { result } = renderHook(() =>
      useListContext('test', { min: 1, defaults: () => ({ value: 0 }) }),
    );
    expect(result.current.canRemove).toBe(false);
  });

  it('should emit change events', () => {
    const { result } = renderHook(() =>
      useListContext('test', { defaults: () => ({ value: 0 }) }),
    );
    act(() => result.current.add());
    expect(result.current.change).toEqual({
      action: 'add',
      data: [{ value: 0 }],
      index: 0,
    });
  });
});
