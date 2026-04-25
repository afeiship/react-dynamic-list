import { useCommand } from '@jswork/react-dynamic-list';
import type { Todo } from './types';

export const TodoControls = () => {
  const { state, actions } = useCommand<Todo>('pg-todo');
  const { canAdd, list } = state;
  const { add } = actions;
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
