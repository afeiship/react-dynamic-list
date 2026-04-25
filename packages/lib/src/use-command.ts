import { useCallback, useEffect, useState } from 'react';
import { getList, addToList, removeAt, setList, updateAt, moveAt } from './store';
import { subscribe, emitChange } from './event';
import { getOptions } from './registry';
import type { ChangeEvent, ListApi } from './types';

export type { ListOptions } from './registry';

export function useCommand<T = unknown>(name: string): ListApi<T> {
  const [change, setChange] = useState<ChangeEvent<T> | null>(null);
  const [list, setListState] = useState<T[]>(() => getList<T>(name));

  useEffect(
    () => subscribe(name, (_action, _index) => {
      setChange({ action: _action, data: getList<T>(name), index: _index });
      setListState(getList<T>(name));
    }),
    [name],
  );

  const add = useCallback(() => {
    const opts = getOptions<T>(name);
    const item = opts?.defaults();
    if (item === undefined) return console.warn('defaults is required');
    const index = getList<T>(name).length;
    addToList(name, item);
    emitChange(name, 'add', index);
  }, [name]);

  const update = useCallback(
    (index: number, updater: (prev: T) => T) => {
      updateAt(name, index, updater);
      emitChange(name, 'update', index);
    },
    [name],
  );

  const remove = useCallback(
    (index: number) => {
      removeAt(name, index);
      emitChange(name, 'remove', index);
    },
    [name],
  );

  const set = useCallback(
    (items: T[]) => {
      setList(name, items);
      emitChange(name, 'set');
    },
    [name],
  );

  const up = useCallback(
    (index: number) => {
      moveAt(name, index, index - 1);
      emitChange(name, 'up', index);
    },
    [name],
  );

  const down = useCallback(
    (index: number) => {
      moveAt(name, index, index + 1);
      emitChange(name, 'down', index);
    },
    [name],
  );

  const get = useCallback(
    (index?: number): T | T[] | undefined => {
      const list = getList<T>(name);
      return index === undefined ? list : list[index];
    },
    [name],
  );

  const opts = getOptions<T>(name);
  const max = opts?.max;
  const min = opts?.min;
  const canAdd = max === undefined || list.length < max;
  const canRemove = min === undefined || list.length > min;

  return {
    state: { list, change, canAdd, canRemove },
    actions: { add, remove, update, set, up, down, get },
  };
}
