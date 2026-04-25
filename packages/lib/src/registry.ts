export interface ListOptions<T> {
  min?: number;
  max?: number;
  defaults: () => T;
}

const map = new Map<string, ListOptions<any>>();

export function registerOptions<T>(name: string, options: ListOptions<T>) {
  map.set(name, options);
}

export function getOptions<T>(name: string): ListOptions<T> | undefined {
  return map.get(name);
}

export function clearOptions() {
  map.clear();
}
