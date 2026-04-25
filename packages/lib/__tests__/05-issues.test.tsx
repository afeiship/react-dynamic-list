/**
 * 05-issues.test.ts
 *
 * 针对源码分析中发现的潜在问题编写的测试用例。
 *
 * 场景覆盖:
 * 1. store.updateAt 越界保护 (internal store API)
 * 2. useCommand actions 稳定性（options 通过 registerOptions 注册）
 * 3. useCommand state 对象每次渲染返回新引用
 * 4. DynamicList 与外部 useCommand 双订阅连锁
 * 5. subscribe cleanup (internal event API)
 */

// @vitest-environment jsdom
import React from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useCommand } from '../src/use-command';
import { registerOptions, clearOptions } from '../src/registry';
import { DynamicList } from '../src/dynamic-list';
import { getList, setList, updateAt } from '../src/store';
import { subscribe } from '../src/event';

afterEach(() => {
  clearOptions();
});

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
// 2. useCommand actions 稳定性
// -------------------------------------------------------
describe('useCommand action stability', () => {
  beforeEach(() => setList('action-stability', []));

  it('all action callbacks are stable across rerenders', () => {
    registerOptions('action-stability', { defaults: () => 'x' });
    const { result, rerender } = renderHook(() =>
      useCommand('action-stability'),
    );

    const addBefore = result.current.actions.add;
    const updateBefore = result.current.actions.update;
    const setBefore = result.current.actions.set;
    const removeBefore = result.current.actions.remove;

    rerender();

    expect(result.current.actions.add).toBe(addBefore);
    expect(result.current.actions.update).toBe(updateBefore);
    expect(result.current.actions.set).toBe(setBefore);
    expect(result.current.actions.remove).toBe(removeBefore);
  });
});

// -------------------------------------------------------
// 3. useCommand state 对象每次渲染都是新引用
// -------------------------------------------------------
describe('useCommand state identity', () => {
  beforeEach(() => setList('state-identity', []));

  it('state object is a new reference on every render', () => {
    registerOptions('state-identity', { defaults: () => 'x' });
    const { result, rerender } = renderHook(() =>
      useCommand('state-identity'),
    );

    const stateBefore = result.current.state;
    act(() => result.current.actions.add());
    const stateAfter = result.current.state;

    expect(stateBefore).not.toBe(stateAfter);
  });

  it('state.list reference changes after mutation', () => {
    registerOptions('state-identity', { defaults: () => 'x' });
    const { result } = renderHook(() =>
      useCommand('state-identity'),
    );

    const listBefore = result.current.state.list;
    act(() => result.current.actions.add());
    const listAfter = result.current.state.list;

    expect(listBefore).not.toBe(listAfter);
    expect(listAfter).toEqual(['x']);
  });

  it('state.list reference is same when no mutation occurs', () => {
    const { result, rerender } = renderHook(() =>
      useCommand('state-identity'),
    );

    const listBefore = result.current.state.list;
    rerender();
    const listAfter = result.current.state.list;

    expect(listBefore).toBe(listAfter);
  });
});

// -------------------------------------------------------
// 4. DynamicList + 外部 useCommand 双订阅连锁
// -------------------------------------------------------
describe('DynamicList + external useCommand dual subscription', () => {
  beforeEach(() => setList('dual-sub', []));

  it('external useCommand sees changes from DynamicList internal set', () => {
    const data = [{ id: 1, title: 'X' }];

    // Set up external hook first
    const { result } = renderHook(() => useCommand('dual-sub'));
    expect(result.current.state.list).toEqual([]);

    // Render DynamicList — registers options + triggers data sync
    render(
      <DynamicList
        name="dual-sub"
        defaults={() => ({ id: 0, title: '' })}
        data={data}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    expect(getList('dual-sub')).toEqual(data);
    expect(result.current.state.list).toEqual(data);
  });

  it('both subscribers receive change events on mutation', () => {
    registerOptions('dual-sub', { defaults: () => 'x' });
    const { result: hook1 } = renderHook(() => useCommand('dual-sub'));
    const { result: hook2 } = renderHook(() => useCommand('dual-sub'));

    act(() => hook1.current.actions.add());

    expect(hook1.current.state.list).toEqual(['x']);
    expect(hook2.current.state.list).toEqual(['x']);
  });
});

// -------------------------------------------------------
// 5. subscribe cleanup
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
    const unsub2 = subscribe('cleanup-test3', () => {});
    unsub2();
  });
});
