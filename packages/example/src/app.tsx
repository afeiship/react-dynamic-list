import { DynamicList } from '@jswork/react-dynamic-list/src/main';
import { TodoItem } from './components/todo/todo-item';
import { TodoEmpty } from './components/todo/todo-empty';
import { TodoControls } from './components/todo/todo-controls';
import { initialData, defaults } from './components/todo/types';
import type { Todo } from './components/todo/types';

export default function App() {
  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">React Dynamic List</h1>
          <span className="badge badge-warning">Build: {BUILD_TIME}</span>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Todo Demo</h2>
            <TodoControls />
            <DynamicList<Todo>
              name="pg-todo"
              data={initialData}
              defaults={defaults}
              max={8}
              slots={{ item: TodoItem, empty: TodoEmpty }}
              onChange={e => console.log('change: ', e.data)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
