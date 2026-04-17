import { useCallback, useEffect, useState } from "react";
import { getList, addToList, removeAt, setList, updateAt } from "./store";
import { subscribe, emitChange } from "./event";
import type { ChangeEvent, ListApi, ListConstraints } from "./types";

export function useListContext<T = unknown>(name: string, constraints?: ListConstraints<T>): ListApi<T> {
  const [change, setChange] = useState<ChangeEvent<T> | null>(null);

  useEffect(() => subscribe(name, (action, index) => setChange({ action, data: getList<T>(name), index })), [name]);

  const add = useCallback(() => {
    const item = constraints?.defaults();
    if (item === undefined) return;
    const index = getList<T>(name).length;
    addToList(name, item);
    emitChange(name, "add", index);
  }, [name, constraints]);

  const update = useCallback(
    (index: number, updater: (prev: T) => T) => {
      updateAt(name, index, updater);
      emitChange(name, "update", index);
    },
    [name],
  );

  const remove = useCallback(
    (index: number) => {
      removeAt(name, index);
      emitChange(name, "remove", index);
    },
    [name],
  );

  const reset = useCallback(
    (items: T[]) => {
      setList(name, items);
      emitChange(name, "reset");
    },
    [name],
  );

  const list = getList<T>(name);
  const max = constraints?.max;
  const min = constraints?.min;
  const canAdd = max === undefined || list.length < max;
  const canRemove = min === undefined || list.length > min;

  return { list, change, add, remove, update, reset, canAdd, canRemove };
}
