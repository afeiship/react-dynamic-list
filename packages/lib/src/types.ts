export type ListAction = "add" | "remove" | "update" | "reset";

export interface ChangeEvent<T> {
  action: ListAction;
  data: T[];
  index?: number;
}

export interface ListState<T> {
  list: T[];
  change: ChangeEvent<T> | null;
  canAdd: boolean;
  canRemove: boolean;
}

export interface ListActions<T> {
  add: () => void;
  remove: (index: number) => void;
  update: (index: number, updater: (prev: T) => T) => void;
  reset: (items: T[]) => void;
}

export interface ListApi<T> {
  state: ListState<T>;
  actions: ListActions<T>;
}

export interface ListConstraints<T> {
  min?: number;
  max?: number;
  defaults: () => T;
}
