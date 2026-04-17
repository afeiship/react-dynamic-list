import { useListContext } from '@jswork/react-dynamic-list/src/main';
import type { Todo } from './types';
import { defaults } from './types';

export const TodoControls = () => {
  const { add, canAdd, list } = useListContext<Todo>('pg-todo', { defaults, max: 8 });
  const remaining = list.filter((t) => !t.done).length;
  return (
    <div className="flex items-center gap-3 mb-3">
      <button onClick={add} disabled={!canAdd} className="btn btn-primary btn-sm disabled:opacity-40">
        + Add Todo
      </button>
      <span className="text-xs opacity-50">
        {remaining} remaining / {list.length} total
      </span>
    </div>
  );
};
