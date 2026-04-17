import { useListContext } from '@jswork/react-dynamic-list/src/main';

interface StringItem {
  id: number;
  value: string;
}

let stringUid = 0;

export const stringDefaults = () => ({ id: ++stringUid, value: '' });

export function StringControls() {
  const { add, list } = useListContext<StringItem>('string-list', {
    max: 10,
    defaults: stringDefaults,
  });

  const hasEmpty = list.some((item) => item.value.trim() === '');

  return (
    <div className="flex items-center gap-3 mt-4">
      <button className="btn btn-primary btn-sm" disabled={hasEmpty} onClick={add}>
        + 添加
      </button>
      <span className="text-xs opacity-50">{list.length} / 10 项</span>
      {hasEmpty && (
        <span className="text-error text-xs">请先填写所有空白项后再添加新项</span>
      )}
    </div>
  );
}
