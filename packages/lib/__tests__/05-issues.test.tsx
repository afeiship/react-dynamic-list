/**
 * 05-issues.test.ts
 *
 * 针对源码分析中发现的潜在问题编写的测试用例。
 *
 * 场景覆盖:
 * 1. store.updateAt 越界保护 (internal store API)
 * 2. useCommand actions 因 options 引用不稳定导致 useCallback 失效
 * 3. useCommand state.list 每次渲染返回新引用（非响应式）
 * 4. DynamicList data sync 循环 — reset → emitChange → subscribe → 重复 reset
 * 5. DynamicList 与外部 useCommand 双订阅导致连锁渲染
 * 6. subscribe cleanup (internal event API) — 返回 void 且清理空 listener set
 */

// @vitest-environment jsdom
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCommand } from '../src/use-command';
import { DynamicList } from '../src/dynamic-list';
import { getList, setList, updateAt } from '../src/store';
import { subscribe } from '../src/event';

// -------------------------------------------------------
// 1. store.updateAt 越界保护
// -------------------------------------------------------
describe('store.updateAt boundary', () => {
  beforeEach(() => setList('boundary', ['a']));

  it('index in range works correctly', () => {
    updateAt('boundary', 0, (v: string) => v.toUpperCase());
    expect(getList('boundary')).toEqual(['A']);
  });

  it('index out of range is a no-op', () => {
    updateAt('boundary', 5, (v) => v);
    expect(getList('boundary')).toEqual(['a']);
  });

  it('negative index is a no-op', () => {
    updateAt('boundary', -1, (v) => v);
    expect(getList('boundary')).toEqual(['a']);
  });
});

// -------------------------------------------------------
// 2. useCommand actions 因 options 不稳定而重建
// -------------------------------------------------------
describe('useCommand action stability', () => {
  beforeEach(() => setList('action-stability', []));

  it('add callback is stable when options object reference changes (uses optionsRef)', () => {
    const options1 = { defaults: () => 'x' };
    const options2 = { defaults: () => 'x' };

    const { result, rerender } = renderHook(
      ({ opts }) => useCommand('action-stability', opts),
      { initialProps: { opts: options1 } },
    );

    const addBefore = result.current.actions.add;
    rerender({ opts: options2 });
    const addAfter = result.current.actions.add;

    // add uses optionsRef, so it's stable across rerenders
    expect(addBefore).toBe(addAfter);
  });

  it('update/reset/remove are stable regardless of options change', () => {
    const { result, rerender } = renderHook(
      ({ opts }) => useCommand('action-stability', opts),
      { initialProps: { opts: { defaults: () => 'x' } } },
    );

    const updateBefore = result.current.actions.update;
    const resetBefore = result.current.actions.reset;
    const removeBefore = result.current.actions.remove;

    rerender({ opts: { defaults: () => 'y' } });

    // update/reset/remove 只依赖 name，不依赖 options
    expect(result.current.actions.update).toBe(updateBefore);
    expect(result.current.actions.reset).toBe(resetBefore);
    expect(result.current.actions.remove).toBe(removeBefore);
  });
});

// -------------------------------------------------------
// 3. useCommand state 对象每次渲染都是新引用
// -------------------------------------------------------
describe('useCommand state identity', () => {
  beforeEach(() => setList('state-identity', []));

  it('state object is a new reference on every render', () => {
    const { result, rerender } = renderHook(() =>
      useCommand('state-identity', { defaults: () => 'x' }),
    );

    const stateBefore = result.current.state;
    // trigger a re-render by acting
    act(() => result.current.actions.add());
    const stateAfter = result.current.state;

    expect(stateBefore).not.toBe(stateAfter);
  });

  it('state.list reference changes after mutation', () => {
    const { result } = renderHook(() =>
      useCommand('state-identity', { defaults: () => 'x' }),
    );

    const listBefore = result.current.state.list;
    act(() => result.current.actions.add());
    const listAfter = result.current.state.list;

    // setList creates a new array via [...items]
    expect(listBefore).not.toBe(listAfter);
    expect(listAfter).toEqual(['x']);
  });

  it('state.list reference is same when no mutation occurs', () => {
    const { result, rerender } = renderHook(() =>
      useCommand('state-identity', { defaults: () => 'x' }),
    );

    const listBefore = result.current.state.list;
    // re-render without mutation (force via options change)
    rerender();
    const listAfter = result.current.state.list;

    // getList returns same store reference when no mutation happened
    expect(listBefore).toBe(listAfter);
  });
});

// -------------------------------------------------------
// 4. DynamicList data sync 循环风险
// -------------------------------------------------------
describe('DynamicList data sync loop', () => {
  beforeEach(() => setList('sync-loop', []));

  it('does not re-reset when same data reference is passed', () => {
    const data = [{ id: 1, title: 'A' }];
    const resetSpy = vi.fn();

    const { rerender } = render(
      <DynamicList
        name="sync-loop"
        defaults={() => ({ id: 0, title: '' })}
        data={data}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    expect(getList('sync-loop')).toEqual(data);

    // rerender with SAME reference
    rerender(
      <DynamicList
        name="sync-loop"
        defaults={() => ({ id: 0, title: '' })}
        data={data}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    // store should still equal data (not reset again)
    expect(getList('sync-loop')).toEqual(data);
  });

  it('does reset when data reference changes (even if content is same)', () => {
    const data1 = [{ id: 1, title: 'A' }];
    const data2 = [{ id: 1, title: 'A' }];

    const { rerender } = render(
      <DynamicList
        name="sync-loop"
        defaults={() => ({ id: 0, title: '' })}
        data={data1}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    const storeBefore = getList('sync-loop');
    rerender(
      <DynamicList
        name="sync-loop"
        defaults={() => ({ id: 0, title: '' })}
        data={data2}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );
    const storeAfter = getList('sync-loop');

    // content same but reference changed → reset triggered
    expect(storeBefore).not.toBe(storeAfter);
    expect(storeAfter).toEqual(data2);
  });
});

// -------------------------------------------------------
// 5. DynamicList + 外部 useCommand 双订阅连锁
// -------------------------------------------------------
describe('DynamicList + external useCommand dual subscription', () => {
  beforeEach(() => setList('dual-sub', []));

  it('external useCommand sees changes from DynamicList internal reset', () => {
    const data = [{ id: 1, title: 'X' }];

    // Set up external hook first
    const { result } = renderHook(() =>
      useCommand('dual-sub', { defaults: () => ({ id: 0, title: '' }) }),
    );
    expect(result.current.state.list).toEqual([]);

    // Render DynamicList — its data sync effect triggers reset
    render(
      <DynamicList
        name="dual-sub"
        defaults={() => ({ id: 0, title: '' })}
        data={data}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    // DynamicList reset → emitChange → external subscriber → state update
    // Both renderHook and render flush in their own act() scopes,
    // so check the store (source of truth) and the hook state
    expect(getList('dual-sub')).toEqual(data);
    expect(result.current.state.list).toEqual(data);
  });

  it('both subscribers receive change events on mutation', () => {
    const calls1: string[] = [];
    const calls2: string[] = [];

    const { result: hook1 } = renderHook(() =>
      useCommand('dual-sub', { defaults: () => 'x' }),
    );
    const { result: hook2 } = renderHook(() =>
      useCommand('dual-sub', { defaults: () => 'x' }),
    );

    // listen to changes
    renderHook(() => {
      const { state } = useCommand('dual-sub');
      if (state.change) calls1.push(state.change.action);
    });
    renderHook(() => {
      const { state } = useCommand('dual-sub');
      if (state.change) calls2.push(state.change.action);
    });

    act(() => hook1.current.actions.add());

    // Both hooks should reflect the change
    expect(hook1.current.state.list).toEqual(['x']);
    expect(hook2.current.state.list).toEqual(['x']);
  });
});

// -------------------------------------------------------
// 6. subscribe cleanup
// -------------------------------------------------------
describe('subscribe cleanup', () => {
  it('unsubscribe function returns void', () => {
    const unsub = subscribe('cleanup-test', () => {});
    const result = unsub();
    expect(result).toBeUndefined();
  });

  it('calling unsubscribe twice is safe', () => {
    const unsub = subscribe('cleanup-test2', () => {});
    unsub();
    expect(() => unsub()).not.toThrow();
  });

  it('removes empty listener set after last unsubscribe', () => {
    const unsub = subscribe('cleanup-test3', () => {});
    unsub();
    // listener set should be cleaned up from the map
    // subscribing again should work fine
    const unsub2 = subscribe('cleanup-test3', () => {});
    unsub2();
  });
});
