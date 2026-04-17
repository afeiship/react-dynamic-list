import { useListContext } from '@jswork/react-dynamic-list/src/main';
import { defaults } from './types';
import type { Item } from './types';

export function ListControls() {
  const { add, remove, canAdd, canRemove, list } = useListContext<Item>('todos', { max: 5, defaults });
  return (
    <div className="flex items-center gap-3 mt-4">
      <button className="btn btn-primary btn-sm" disabled={!canAdd} onClick={add}>
        + Add
      </button>
      <button
        className="btn btn-ghost btn-sm"
        disabled={!canRemove || list.length === 0}
        onClick={() => remove(list.length - 1)}
      >
        - Remove Last
      </button>
      <span className="text-xs opacity-50">
        {list.length} / 5 items
      </span>
    </div>
  );
}
