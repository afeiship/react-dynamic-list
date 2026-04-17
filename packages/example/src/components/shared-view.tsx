import { useListContext } from '@jswork/react-dynamic-list/src/main';
import type { Item } from './types';

export function SharedView() {
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
