const store = new Map<string, unknown[]>();

export function getList<T = unknown>(name: string): T[] {
  if (!store.has(name)) store.set(name, []);
  return store.get(name)! as T[];
}

export function setList(name: string, items: unknown[]): void {
  store.set(name, [...items]);
}

export function removeAt(name: string, index: number): void {
  const next = [...getList(name)];
  next.splice(index, 1);
  store.set(name, next);
}

export function addToList<T>(name: string, item: T): void {
  store.set(name, [...getList(name), item]);
}

export function updateAt<T>(name: string, index: number, updater: (prev: T) => T): void {
  const next = [...getList<T>(name)];
  next[index] = updater(next[index]);
  store.set(name, next);
}
