/**
 * 07-add-without-defaults.test.ts
 *
 * 验证 useCommand 的 add 在没有 defaults 时调用 console.warn 并跳过。
 */

// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCommand } from '../src/use-command';
import { setList } from '../src/store';

describe('useCommand add without defaults', () => {
  beforeEach(() => setList('no-defaults', []));

  it('warns and does nothing when defaults is not provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useCommand('no-defaults'));

    act(() => result.current.actions.add());

    expect(warnSpy).toHaveBeenCalledWith('defaults is required');
    expect(result.current.state.list).toEqual([]);

    warnSpy.mockRestore();
  });

  it('warns and does nothing when defaults returns undefined', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useCommand('no-defaults', { defaults: () => undefined as any }),
    );

    act(() => result.current.actions.add());

    expect(warnSpy).toHaveBeenCalledWith('defaults is required');
    expect(result.current.state.list).toEqual([]);

    warnSpy.mockRestore();
  });
});
