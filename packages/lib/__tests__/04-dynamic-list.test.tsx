// @vitest-environment jsdom
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DynamicList } from '../src/dynamic-list';
import { setList, getList } from '../src/store';
import { addToList } from '../src/store';
import { emitChange } from '../src/event';

interface Item {
  id: number;
  title: string;
}

const defaults = () => ({ id: 0, title: '' });

describe('DynamicList', () => {
  beforeEach(() => {
    setList('dl-test', []);
  });

  it('should render items via slots.item', () => {
    setList('dl-test', [
      { id: 1, title: 'Alpha' },
      { id: 2, title: 'Beta' },
    ]);
    render(
      <DynamicList<Item>
        name="dl-test"
        defaults={defaults}
        slots={{
          item: ({ item }) => <div>{item.title}</div>,
        }}
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('should render slots.empty when list is empty', () => {
    render(
      <DynamicList<Item>
        name="dl-test"
        defaults={defaults}
        slots={{
          item: ({ item }) => <div>{item.title}</div>,
          empty: () => <div>No items</div>,
        }}
      />,
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('should load data prop into store on initial render', () => {
    const initialData: Item[] = [
      { id: 1, title: 'Alpha' },
      { id: 2, title: 'Beta' },
      { id: 3, title: 'Gamma' },
    ];
    render(
      <DynamicList<Item>
        name="dl-test"
        defaults={defaults}
        data={initialData}
        slots={{
          item: ({ item }) => <div>{item.title}</div>,
        }}
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(getList('dl-test')).toEqual(initialData);
  });

  it('should sync data prop into store when data changes', () => {
    const { rerender } = render(
      <DynamicList<Item>
        name="dl-test"
        defaults={defaults}
        data={[{ id: 1, title: 'First' }]}
        slots={{
          item: ({ item }) => <div>{item.title}</div>,
        }}
      />,
    );

    rerender(
      <DynamicList<Item>
        name="dl-test"
        defaults={defaults}
        data={[{ id: 2, title: 'Second' }]}
        slots={{
          item: ({ item }) => <div>{item.title}</div>,
        }}
      />,
    );
    expect(getList('dl-test')).toEqual([{ id: 2, title: 'Second' }]);
  });

  it('should call onChange when store changes', () => {
    const onChange = vi.fn();
    render(
      <DynamicList<Item>
        name="dl-test"
        defaults={defaults}
        onChange={onChange}
        slots={{
          item: ({ item }) => <div>{item.title}</div>,
        }}
      />,
    );

    act(() => {
      addToList('dl-test', { id: 1, title: 'New' });
      emitChange('dl-test', 'add', 0);
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'add', index: 0 }),
    );
  });
});
