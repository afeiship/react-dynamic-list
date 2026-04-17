import { useListContext } from '@jswork/react-dynamic-list/src/main';
import type { Item } from './types';

export const PrefillItemSlot = ({ item, index }: { item: Item; index: number }) => {
  const { remove, update } = useListContext<Item>('prefill-list');
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
