export type ListAction = "add" | "remove" | "update" | "reset";

export interface ChangeEvent<T> {
  action: ListAction;
  data: T[];
  index?: number;
}

export interface ListApi<T> {
  list: T[];
  change: ChangeEvent<T> | null;
  add: () => void;
  remove: (index: number) => void;
  update: (index: number, updater: (prev: T) => T) => void;
  reset: (items: T[]) => void;
  canAdd: boolean;
  canRemove: boolean;
}

export interface ListConstraints<T> {
  min?: number;
  max?: number;
  defaults: () => T;
}
