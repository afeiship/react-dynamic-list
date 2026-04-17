import { useState } from 'react';
import { DynamicList, useListContext } from '@jswork/react-dynamic-list/src/main';
import type { ChangeEvent } from '@jswork/react-dynamic-list/src/main';

interface Item {
  id: number;
  title: string;
}

let uid = 3;
const initialData: Item[] = [
  { id: 1, title: 'Learn React' },
  { id: 2, title: 'Build a project' },
  { id: 3, title: 'Deploy to production' },
];
const constraints = {
  defaults: () => ({ id: ++uid, title: `Item ${uid}` }),
  min: 0,
  max: 5,
};

const ItemSlot = ({ item, index }: { item: Item; index: number }) => {
  const { remove, update } = useListContext<Item>('todos');
  return (
    <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
      <span className="cursor-pointer" onClick={() => update(index, (prev) => ({ ...prev, title: prev.title + '!' }))}>
        {item.title}
      </span>
      <button className="btn btn-ghost btn-xs text-error" onClick={() => remove(index)}>
        ✕
      </button>
    </div>
  );
};

const EmptySlot = () => (
  <div className="text-center py-8 opacity-40">No items. Click "+ Add" to start.</div>
);

function ListControls() {
  const { add, remove, canAdd, canRemove, list } = useListContext<Item>('todos');
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
        {list.length} / {constraints.max} items
      </span>
    </div>
  );
}

function SharedView() {
  const { list } = useListContext<Item>('todos');
  return (
    <div className="text-sm space-y-1">
      {list.length === 0 && <div className="opacity-40">Empty</div>}
      {list.map((item, i) => (
        <div key={item.id} className="py-1 px-2 bg-base-200 rounded">
          {i}. {item.title}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<Item>) => {
    setLogs((prev) => [`[${event.action}] index=${event.index ?? '-'} count=${event.data.length}`, ...prev].slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">React Dynamic List</h1>
          <span className="badge badge-warning">Build: {BUILD_TIME}</span>
        </div>

        {/* Main list */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Interactive List</h2>
            <DynamicList<Item>
              name="todos"
              data={initialData}
              constraints={constraints}
              onChange={handleChange}
              slots={{ item: ItemSlot, empty: EmptySlot }}
            />
            <ListControls />
          </div>
        </div>

        {/* Shared state */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-sm">Shared State (same name="todos")</h2>
            <SharedView />
          </div>
        </div>

        {/* Change log */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-sm">Change Log</h2>
            <div className="max-h-32 overflow-y-auto font-mono text-xs space-y-0.5">
              {logs.map((log, i) => (
                <div key={i} className="opacity-60">
                  {log}
                </div>
              ))}
              {logs.length === 0 && <div className="opacity-30">No events yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
