import { useCommand } from '@jswork/react-dynamic-list';
import type { Todo } from './types';

export const TodoItem = ({ item, index }: { item: Todo; index: number }) => {
  const { actions } = useCommand<Todo>('pg-todo');
  const { update, remove } = actions;
  return (
    <div className={`flex items-center gap-2 p-2 rounded ${item.done ? 'bg-green-50' : 'bg-base-200'}`}>
      <span className="text-xs opacity-40 w-5 text-right">#{index + 1}</span>
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => update(index, (prev) => ({ ...prev, done: !prev.done }))}
        className="checkbox checkbox-sm"
      />
      <input
        value={item.title}
        onChange={(e) => update(index, (prev) => ({ ...prev, title: e.target.value }))}
        placeholder="Todo title..."
        className={`input input-sm input-bordered flex-1 ${item.done ? 'line-through opacity-50' : ''}`}
      />
      <button onClick={() => remove(index)} className="btn btn-ghost btn-xs text-error">
        ✕
      </button>
    </div>
  );
};
