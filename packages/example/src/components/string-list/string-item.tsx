import { useListContext } from '@jswork/react-dynamic-list/src/main';

interface StringItem {
  id: number;
  value: string;
}

export const StringItem = ({ item, index }: { item: StringItem; index: number }) => {
  const { remove, update } = useListContext<StringItem>('string-list');
  const isEmpty = item.value.trim() === '';

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${isEmpty ? 'bg-error/10 ring-1 ring-error/40' : 'bg-base-200'}`}>
      <input
        type="text"
        className={`input input-sm input-bordered flex-1 ${isEmpty ? 'input-error' : ''}`}
        placeholder="请输入内容..."
        value={item.value}
        onChange={(e) => update(index, (prev) => ({ ...prev, value: e.target.value }))}
      />
      {isEmpty && (
        <span className="text-error text-xs whitespace-nowrap">请先填写</span>
      )}
      <button className="btn btn-ghost btn-xs text-error" onClick={() => remove(index)}>
        ✕
      </button>
    </div>
  );
};
