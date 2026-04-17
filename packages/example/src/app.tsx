import { DynamicList } from '@jswork/react-dynamic-list/src/main';
import { ItemSlot } from './components/item-slot';
import { EmptySlot } from './components/empty-slot';
import { PrefillItemSlot } from './components/prefill-item-slot';
import { ListControls } from './components/list-controls';
import { SharedView } from './components/shared-view';
import { useChangeLog } from './components/change-log';
import { initialData, defaults, prefillInitialData, prefillDefaults } from './components/types';
import type { Item } from './components/types';
import { TodoItem } from './components/todo/todo-item';
import { TodoEmpty } from './components/todo/todo-empty';
import { TodoControls } from './components/todo/todo-controls';
import { initialData as todoInitialData, defaults as todoDefaults } from './components/todo/types';
import type { Todo } from './components/todo/types';
import { StringItem } from './components/string-list/string-item';
import { StringEmpty } from './components/string-list/string-empty';
import { StringControls, stringDefaults } from './components/string-list/string-controls';

export default function App() {
  const { handleChange, LogView } = useChangeLog();

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
              data={todoInitialData}
              defaults={todoDefaults}
              max={8}
              slots={{ item: TodoItem, empty: TodoEmpty }}
              onChange={e => {
                console.log('change todo: ', e.data);
              }}
            />
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">String List (必填校验)</h2>
            <DynamicList<{ id: number; value: string }>
              name="string-list"
              data={[]}
              defaults={stringDefaults}
              max={10}
              slots={{ item: StringItem, empty: StringEmpty }}
              onChange={(e) => console.log('change string-list: ', e.data)}
            />
            <StringControls />
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Dynamic List</h2>
            <DynamicList<Item>
              name="todos"
              data={initialData}
              defaults={defaults}
              max={5}
              onChange={handleChange}
              slots={{ item: ItemSlot, empty: EmptySlot }}
            />
            <ListControls />
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">With Initial Values</h2>
            <DynamicList<Item>
              name="prefill-list"
              data={prefillInitialData}
              defaults={prefillDefaults}
              max={8}
              slots={{ item: PrefillItemSlot, empty: EmptySlot }}
              onChange={e => console.log('change prefill: ', e.data)}
            />
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-sm">Shared State (same name="todos")</h2>
            <SharedView />
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-sm">Change Log</h2>
            <LogView />
          </div>
        </div>
      </div>
    </div>
  );
}
