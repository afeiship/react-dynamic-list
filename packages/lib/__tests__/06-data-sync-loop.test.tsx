/**
 * 06-data-sync-loop.test.tsx
 *
 * 验证 DynamicList 的 data sync 使用 fast-deep-equal 深比较，
 * 避免 inline 数组（每次渲染新引用）导致的无限 reset 循环。
 */

// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DynamicList } from '../src/dynamic-list';
import { getList, setList } from '../src/store';

describe('DynamicList data sync (deep-equal)', () => {
  beforeEach(() => setList('sync-loop', []));

  it('does not re-reset when same data reference is passed', () => {
    const data = [{ id: 1, title: 'A' }];

    const { rerender } = render(
      <DynamicList
        name="sync-loop"
        defaults={() => ({ id: 0, title: '' })}
        data={data}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    expect(getList('sync-loop')).toEqual(data);

    rerender(
      <DynamicList
        name="sync-loop"
        defaults={() => ({ id: 0, title: '' })}
        data={data}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    expect(getList('sync-loop')).toEqual(data);
  });

  it('does NOT reset when content is deep-equal (new reference, same content)', () => {
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

    // deep-equal detects same content → no reset
    expect(storeAfter).toBe(storeBefore);
  });

  it('does reset when data content actually changes', () => {
    const data1 = [{ id: 1, title: 'A' }];
    const data2 = [{ id: 1, title: 'B' }];

    const { rerender } = render(
      <DynamicList
        name="sync-loop"
        defaults={() => ({ id: 0, title: '' })}
        data={data1}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    rerender(
      <DynamicList
        name="sync-loop"
        defaults={() => ({ id: 0, title: '' })}
        data={data2}
        slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
      />,
    );

    expect(getList('sync-loop')).toEqual(data2);
  });

  it('does not infinite loop when data is inline array (new ref each render)', () => {
    let renderCount = 0;

    const Wrapper = () => {
      renderCount++;
      return (
        <DynamicList
          name="sync-loop"
          defaults={() => ({ id: 0, title: '' })}
          data={[{ id: 1, title: 'A' }]}
          slots={{ item: ({ item }: any) => <div>{item.title}</div> }}
        />
      );
    };

    render(<Wrapper />);
    // Should stabilize after initial reset + subscriber re-render
    // Without deep-equal, this would loop until React bails out (>> 2 renders)
    expect(renderCount).toBeLessThanOrEqual(2);
    expect(getList('sync-loop')).toEqual([{ id: 1, title: 'A' }]);
  });
});
